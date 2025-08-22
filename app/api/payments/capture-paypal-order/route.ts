import { NextRequest, NextResponse } from 'next/server'
import { capturePayPalOrder } from '@/lib/paypal'

export async function POST(request: NextRequest) {
  try {
    const { orderID } = await request.json()

    if (!orderID) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const payment = await capturePayPalOrder(orderID)
    
    // TODO: Save payment to database
    // await savePaymentToDatabase(payment)
    
    return NextResponse.json({ 
      success: true, 
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        filmId: payment.filmId,
        userId: payment.userId,
        email: payment.email
      }
    })
  } catch (error: any) {
    const errorMessage = error.message || 'Failed to capture PayPal order'
    
    return NextResponse.json(
      { 
        error: errorMessage
      },
      { status: 500 }
    )
  }
}
