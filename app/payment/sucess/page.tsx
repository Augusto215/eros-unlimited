"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Loader2, AlertTriangle, Home } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)

  // Múltiplas formas de capturar o ID do pedido PayPal
  const token = searchParams.get('token')
  const PayerID = searchParams.get('PayerID') 
  const paymentId = searchParams.get('paymentId')
  const orderId = searchParams.get('orderId')
  
  // Dados adicionais que podem estar na URL
  const filmId = searchParams.get('filmId')
  const userId = searchParams.get('userId')
  
  const { t } = useTranslation()

  useEffect(() => {
    const processPayment = async () => {
      // Primeiro, vamos fazer log de todos os parâmetros recebidos
      console.log('PayPal redirect params:', {
        token,
        PayerID,
        paymentId,
        orderId,
        filmId,
        userId,
        allParams: Object.fromEntries(searchParams.entries())
      })

      // Determinar qual ID do pedido usar
      const orderToCapture = token || paymentId || orderId

      // Verificar se temos pelo menos um identificador
      if (!orderToCapture) {
        console.error('Nenhum identificador de pedido encontrado nos parâmetros da URL')
        setError('Identificador do pedido PayPal não encontrado na URL. Parâmetros recebidos: ' + 
                 Array.from(searchParams.entries()).map(([key, value]) => `${key}=${value}`).join(', '))
        setIsProcessing(false)
        return
      }

      // Se não temos PayerID, pode ser um fluxo diferente do PayPal
      if (!PayerID) {
        console.warn('PayerID não encontrado, mas tentando processar mesmo assim com orderID:', orderToCapture)
      }

      try {
        const response = await fetch('/api/payments/capture-paypal-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            orderID: orderToCapture,
            // Incluir dados adicionais se disponíveis
            ...(filmId && { filmId }),
            ...(userId && { userId }),
            ...(PayerID && { PayerID })
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorText = await response.text().catch(() => 'Erro desconhecido')
          throw new Error(`Erro HTTP ${response.status}: ${errorData.error || errorText}`)
        }

        const result = await response.json()
        
        console.log('Resposta da API de captura:', result)
        
        if (!result.success) {
          throw new Error(result.error || 'Falha na captura do pagamento PayPal')
        }

        setSuccess(true)
        setPaymentData(result.payment)
        setIsProcessing(false)

        // Redirecionar após 5 segundos
        setTimeout(() => {
          router.push('/')
        }, 5000)

      } catch (error: any) {
        console.error('Erro ao processar pagamento:', error)
        setError(error.message || 'Erro ao processar pagamento')
        setIsProcessing(false)
      }
    }

    processPayment()
  }, [token, PayerID, paymentId, orderId, filmId, userId, router, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 flex items-center justify-center p-4">
      <div className="relative z-10 max-w-lg w-full">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 text-center border border-white/20 shadow-2xl">

          {isProcessing ? (
            <>
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {t('paymentSuccess.processingTitle')}
                </span>
              </h1>
              <p className="text-gray-300 mb-6">
                {t('paymentSuccess.processingMessage')}
              </p>
              <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-4">
                <p className="text-blue-300 text-sm">
                  ⏳ {t('paymentSuccess.capturing')}
                </p>
              </div>
            </>
          ) : error ? (
            <>
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">
                <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                  {t('paymentSuccess.errorTitle')}
                </span>
              </h1>
              <p className="text-gray-300 mb-6">
                {error}
              </p>
              
              {/* Mostrar informações de debug em desenvolvimento */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-xl p-4 mb-6">
                  <p className="text-yellow-300 text-xs font-mono text-left">
                    <strong>Debug Info:</strong><br/>
                    URL Params: {window.location.search}<br/>
                    Token: {token || 'null'}<br/>
                    PayerID: {PayerID || 'null'}<br/>
                    PaymentId: {paymentId || 'null'}<br/>
                    OrderId: {orderId || 'null'}
                  </p>
                </div>
              )}
              
              <div className="bg-red-500/10 border border-red-400/20 rounded-xl p-4 mb-6">
                <p className="text-red-300 text-sm">
                  ❌ {t('paymentSuccess.errorMessage')}
                </p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:from-purple-600 hover:to-pink-600 hover:scale-105 flex items-center justify-center space-x-2"
              >
                <Home className="w-5 h-5" />
                <span>{t('paymentSuccess.backHome')}</span>
              </button>
            </>
          ) : success ? (
            <>
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  🎉 {t('paymentSuccess.successTitle')}
                </span>
              </h1>
              <p className="text-gray-300 mb-6">
                {t('paymentSuccess.successMessage')}
              </p>
              {paymentData && (
                <div className="bg-green-500/10 border border-green-400/20 rounded-xl p-4 mb-6">
                  <div className="text-left space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">{t('paymentSuccess.paymentId')}:</span>
                      <span className="text-green-300 font-mono text-xs">{paymentData.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">{t('paymentSuccess.amountPaid')}:</span>
                      <span className="text-green-300 font-bold">USD {paymentData.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">{t('paymentSuccess.status')}:</span>
                      <span className="text-green-300 font-bold">✅ {t('paymentSuccess.approved')}</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-4 mb-6">
                <p className="text-blue-300 text-sm">
                  🔄 {t('paymentSuccess.autoRedirect')}
                </p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:from-purple-600 hover:to-pink-600 hover:scale-105 flex items-center justify-center space-x-2"
              >
                <Home className="w-5 h-5" />
                <span>{t('paymentSuccess.goToCatalog')}</span>
              </button>
            </>
          ) : null}
        </div>

        <div className="mt-6 text-center">
          <div className="flex justify-center space-x-1 mb-2">
            {['🏳️‍🌈', '🏳️‍⚧️', '❤️', '🧡', '💛', '💚', '💙', '💜'].map((emoji, i) => (
              <span key={i} className="text-lg animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                {emoji}
              </span>
            ))}
          </div>
          <p className="text-gray-400 text-xs">
            {t('paymentSuccess.footer')}
          </p>
        </div>
      </div>
    </div>
  )
}

// Loading component para o Suspense
function LoadingPayment() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {t('paymentSuccess.loading')}
          </span>
        </h2>
        <p className="text-gray-300">
          {t('paymentSuccess.preparing')}
        </p>
      </div>
    </div>
  )
}

// Componente principal com Suspense
export default function PaymentSuccess() {
  return (
    <Suspense fallback={<LoadingPayment />}>
      <PaymentSuccessContent />
    </Suspense>
  )
}