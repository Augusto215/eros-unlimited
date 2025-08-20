import { NextRequest, NextResponse } from 'next/server'
import { createPayPalOrder, createPayPalStandardUrl } from '@/lib/paypal'

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()

    // Validate required fields
    const { filmId, userId, amount, email, title } = orderData
    if (!filmId || !userId || !amount || !email || !title) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      )
    }

    // Try PayPal SDK first, fallback to Standard
    try {
      const order = await createPayPalOrder(orderData)
      return NextResponse.json(order)
    } catch (sdkError) {
      console.warn('PayPal SDK falhou, usando PayPal Standard:', sdkError)
      
      // Fallback to PayPal Standard
      const paypalUrl = createPayPalStandardUrl(orderData)
      return NextResponse.json({ 
        approvalUrl: paypalUrl,
        method: 'standard'
      })
    }

  } catch (error) {
    console.error('Erro na criação do pedido PayPal:', error)
    return NextResponse.json(
      { error: 'Falha ao criar pedido PayPal' },
      { status: 500 }
    )
  }
}