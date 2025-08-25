import * as paypal from '@paypal/checkout-server-sdk'

// Types
export interface PayPalOrderData {
  filmId: string
  userId: string
  amount: number
  email: string
  title: string
}

export interface PayPalOrder {
  orderId: string
  approvalUrl: string
}

export interface PayPalPayment {
  id: string
  status: string
  amount: number
  filmId: string
  userId: string
  email: string
}

// Configure PayPal environment
const getPayPalEnvironment = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured')
  }

  return process.env.NODE_ENV === 'production' 
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret)
}

// PayPal client
const getPayPalClient = () => {
  return new paypal.core.PayPalHttpClient(getPayPalEnvironment())
}

// Create PayPal Order
export const createPayPalOrder = async (orderData: PayPalOrderData): Promise<PayPalOrder> => {
  try {
    const client = getPayPalClient()
    const request = new paypal.orders.OrdersCreateRequest()
    
    request.prefer("return=representation")
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'BRL',
          value: orderData.amount.toFixed(2)
        },
        description: `Filme: ${orderData.title}`,
        custom_id: JSON.stringify({
          filmId: orderData.filmId,
          userId: orderData.userId,
          email: orderData.email
        })
      }],
      application_context: {
        brand_name: 'EROS Films',
        landing_page: 'BILLING',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel`
      }
    })

    const order = await client.execute(request)
    const approvalUrl = order.result.links?.find((link: any) => link.rel === 'approve')?.href

    if (!approvalUrl) {
      throw new Error('PayPal approval URL not found')
    }

    return {
      orderId: order.result.id,
      approvalUrl
    }

  } catch (error) {
    throw new Error('Failed to create PayPal order')
  }
}

// Capture PayPal Order (execute payment)
export const capturePayPalOrder = async (orderId: string): Promise<PayPalPayment> => {
  try {
    const client = getPayPalClient()
    const request = new paypal.orders.OrdersCaptureRequest(orderId)

    // PRIMEIRO: Busca os detalhes da ordem ANTES de capturar
    const getOrderRequest = new paypal.orders.OrdersGetRequest(orderId)
    const orderDetails = await client.execute(getOrderRequest)
    
    console.log('Order details before capture:', JSON.stringify(orderDetails.result, null, 2))

    // AGORA: Captura o pagamento
    const capture = await client.execute(request)
    const payment = capture.result
    
    console.log('Capture result:', JSON.stringify(payment, null, 2))
    
    // Extrai os dados customizados
    let filmId = '', userId = '', email = ''
    
    // Tenta pegar do orderDetails primeiro (mais confiável)
    if (orderDetails.result.purchase_units && orderDetails.result.purchase_units.length > 0) {
      const purchaseUnit = orderDetails.result.purchase_units[0]
      
      if (purchaseUnit.custom_id) {
        try {
          const customData = JSON.parse(purchaseUnit.custom_id)
          filmId = customData.filmId || ''
          userId = customData.userId || ''
          email = customData.email || ''
          console.log('Custom data extracted from order:', customData)
        } catch (parseError) {
          console.error('Error parsing custom_id from order:', parseError)
        }
      }
    }
    
    // Se não conseguiu, tenta do payment capturado
    if (!filmId && payment.purchase_units && payment.purchase_units.length > 0) {
      const purchaseUnit = payment.purchase_units[0]
      
      if (purchaseUnit.custom_id) {
        try {
          const customData = JSON.parse(purchaseUnit.custom_id)
          filmId = customData.filmId || ''
          userId = customData.userId || ''
          email = customData.email || ''
          console.log('Custom data extracted from payment:', customData)
        } catch (parseError) {
          console.error('Error parsing custom_id from payment:', parseError)
        }
      }
    }

    // Pega o amount correto
    const amount = payment.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || 
                   payment.purchase_units?.[0]?.amount?.value || 
                   0

    return {
      id: payment.id,
      status: payment.status,
      amount: parseFloat(amount),
      filmId,
      userId,
      email
    }

  } catch (error: any) {
    console.error('Error in capturePayPalOrder:', error)
    throw new Error(`Failed to capture PayPal payment: ${error.message || error}`)
  }
}

// Verify PayPal payment (for webhooks)
export const verifyPayPalPayment = async (orderId: string): Promise<boolean> => {
  try {
    const client = getPayPalClient()
    const request = new paypal.orders.OrdersGetRequest(orderId)
    
    const order = await client.execute(request)
    return order.result.status === 'COMPLETED'

  } catch (error) {
    return false
  }
}

// PayPal Standard (simpler integration) - URL builder
export const createPayPalStandardUrl = (orderData: PayPalOrderData): string => {
  const baseUrl = 'https://www.paypal.com/cgi-bin/webscr'
  const businessEmail = process.env.PAYPAL_BUSINESS_EMAIL

  if (!businessEmail) {
    throw new Error('PayPal business email not configured')
  }

  const params = new URLSearchParams({
    cmd: '_xclick',
    business: businessEmail,
    item_name: orderData.title,
    item_number: orderData.filmId,
    amount: orderData.amount.toFixed(2),
    currency_code: 'BRL',
    return: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?filmId=${orderData.filmId}&userId=${orderData.userId}`,
    cancel_return: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel`,
    notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/paypal/ipn`,
    custom: JSON.stringify({
      filmId: orderData.filmId,
      userId: orderData.userId,
      email: orderData.email
    })
  })

  return `${baseUrl}?${params.toString()}`
}

// PayPal configuration check
export const checkPayPalConfig = (): boolean => {
  try {
    getPayPalEnvironment()
    return true
  } catch {
    return false
  }
}