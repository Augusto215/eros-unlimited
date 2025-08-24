import { NextRequest, NextResponse } from 'next/server'
import { capturePayPalOrder } from '@/lib/paypal'
import { createClient } from '@supabase/supabase-js'

// Inicializa o cliente Supabase com service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
)

export async function POST(request: NextRequest) {
  try {
    const { orderID } = await request.json()

    if (!orderID) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Captura o pagamento no PayPal
    const payment = await capturePayPalOrder(orderID)
    
    // Verifica se o pagamento foi completado
    if (payment.status !== 'COMPLETED') {
      throw new Error('Payment not completed')
    }

    // Salva a compra no banco de dados
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        user_id: payment.userId,
        movie_id: payment.filmId,  // Certifique-se que filmId está vindo correto
        amount: payment.amount,
        payment_id: payment.id,
        payment_method: 'paypal',
        status: 'completed'
      })
      .select()
      .single()

    if (purchaseError) {
      console.error('Error saving purchase to database:', purchaseError)
      
      // Se for erro de duplicação (usuário já comprou esse filme), não é crítico
      if (purchaseError.code === '23505') { // Código de violação única no Postgres
        console.log('Purchase already exists for this user and movie')
      } else {
        // Para outros erros, você pode decidir se quer falhar ou continuar
        // Por segurança, vamos continuar já que o pagamento foi processado
        console.error('Non-critical error saving purchase:', purchaseError)
      }
    } else {
      console.log('Purchase saved successfully:', purchase)
    }
    
    // Retorna sucesso mesmo se houver erro ao salvar no banco
    // (o pagamento já foi processado no PayPal)
    return NextResponse.json({ 
      success: true, 
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        filmId: payment.filmId,
        userId: payment.userId,
        email: payment.email
      },
      purchase: purchase || null
    })
    
  } catch (error: any) {
    console.error('Error capturing PayPal order:', error)
    const errorMessage = error.message || 'Failed to capture PayPal order'
    
    return NextResponse.json(
      { 
        error: errorMessage
      },
      { status: 500 }
    )
  }
}