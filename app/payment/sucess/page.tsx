"use client"
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Loader2, Heart, Crown, Star, X } from 'lucide-react'

export default function PaymentSuccess() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState('')

  const filmId = searchParams.get('filmId')
  const userId = searchParams.get('userId')
  const token = searchParams.get('token') // PayPal token
  const PayerID = searchParams.get('PayerID') // PayPal payer ID

  useEffect(() => {
    const processPayment = async () => {
      if (!filmId || !userId) {
        setError('Dados do pagamento não encontrados')
        setIsProcessing(false)
        return
      }

      try {
        // Se tem token do PayPal, capturar o pagamento
        if (token) {
          const response = await fetch('/api/payments/capture-paypal-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              orderId: token,
              filmId,
              userId 
            })
          })

          if (!response.ok) {
            throw new Error('Erro ao processar pagamento')
          }
        }

        // Sucesso - redirecionar após 3 segundos
        setTimeout(() => {
          router.push('/')
        }, 3000)

      } catch (error) {
        console.error('Erro no processamento:', error)
        setError('Erro ao processar pagamento')
      } finally {
        setIsProcessing(false)
      }
    }

    processPayment()
  }, [filmId, userId, token, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-black flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            {i % 3 === 0 ? (
              <Heart className="w-4 h-4 text-pink-400/30" />
            ) : i % 3 === 1 ? (
              <Star className="w-3 h-3 text-yellow-400/30" />
            ) : (
              <Crown className="w-4 h-4 text-purple-400/30" />
            )}
          </div>
        ))}
      </div>

      <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl max-w-md w-full text-center">
        {isProcessing ? (
          <>
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Processando Pagamento...
              </span>
            </h1>
            <p className="text-gray-300">
              Aguarde enquanto confirmamos seu pagamento PayPal
            </p>
          </>
        ) : error ? (
          <>
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-red-400 mb-4">Erro no Pagamento</h1>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
            >
              Voltar ao Início
            </button>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Pagamento Aprovado!
              </span>
            </h1>
            <p className="text-gray-300 mb-6">
              Seu filme foi adquirido com sucesso! 🎉
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Redirecionando em alguns segundos...
            </p>
            
            {/* Pride elements */}
            <div className="flex justify-center space-x-1 mb-4">
              {['🏳️‍🌈', '🏳️‍⚧️', '❤️', '💛', '💚', '💙', '💜'].map((emoji, i) => (
                <span key={i} className="text-lg animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>
                  {emoji}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400">
              💖 Obrigado por apoiar conteúdo diverso e inclusivo 💖
            </p>
          </>
        )}
      </div>
    </div>
  )
}