"use client"

import { useState } from "react"
import { X, CreditCard, Lock, AlertCircle, Heart, Sparkles, Crown, Star, Shield } from "lucide-react"
import type { Film } from "@/lib/types"
import Image from "next/image"

interface PaymentModalProps {
  film: Film | null
  isOpen: boolean
  userId: string
  onClose: () => void
  onPaymentSuccess: (filmId: string) => void
}

interface PaymentForm {
  cardNumber: string
  expiryDate: string
  cvv: string
  cardholderName: string
  email: string
  address: string
  city: string
  zipCode: string
  country: string
}

export default function PaymentModal({ film, isOpen, userId, onClose, onPaymentSuccess }: PaymentModalProps) {
  const [formData, setFormData] = useState<PaymentForm>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'BR'
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<Partial<PaymentForm>>({})

  if (!isOpen || !film) return null

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '')
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`
    }
    return v
  }

  const validateCardNumber = (cardNumber: string): boolean => {
    const number = cardNumber.replace(/\s/g, '')
    
    if (!/^\d+$/.test(number)) return false
    if (number.length < 13 || number.length > 19) return false

    // Luhn algorithm
    let sum = 0
    let isEven = false

    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number[i])

      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }

      sum += digit
      isEven = !isEven
    }

    return sum % 10 === 0
  }

  const handleInputChange = (field: keyof PaymentForm, value: string) => {
    let formattedValue = value

    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value)
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value)
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4)
    }

    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<PaymentForm> = {}

    // Card number validation using Luhn algorithm
    if (!validateCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = 'Número do cartão inválido'
    }

    // Expiry date validation
    if (!formData.expiryDate || formData.expiryDate.length !== 5) {
      newErrors.expiryDate = 'Data de validade inválida'
    } else {
      const [month, year] = formData.expiryDate.split('/')
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear() % 100
      const currentMonth = currentDate.getMonth() + 1
      
      if (parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.expiryDate = 'Mês inválido'
      } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiryDate = 'Cartão expirado'
      }
    }

    // CVV validation
    if (!formData.cvv || formData.cvv.length < 3) {
      newErrors.cvv = 'CVV inválido'
    }

    // Cardholder name validation
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Nome do portador é obrigatório'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsProcessing(true)

    try {
      // Import Stripe service dynamically to avoid SSR issues
      const { processPayment } = await import('@/lib/stripe')
      
      // Process payment with Stripe
      const paymentResult = await processPayment({
        amount: film.price,
        filmId: film.id,
        userId: userId,
        paymentData: formData
      })

      if (paymentResult) {
        onPaymentSuccess(film.id)
        onClose()
      } else {
        setErrors({ cardNumber: 'Pagamento não foi aprovado. Verifique os dados do cartão.' })
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      setErrors({ 
        cardNumber: error.message || 'Erro no pagamento. Tente novamente.' 
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getCardBrand = (cardNumber: string) => {
    const number = cardNumber.replace(/\s/g, '')
    if (number.startsWith('4')) return 'Visa'
    if (number.startsWith('5') || number.startsWith('2')) return 'Mastercard'
    if (number.startsWith('3')) return 'American Express'
    return 'Cartão'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-xl rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto border border-white/20 shadow-2xl">
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
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
              {i % 4 === 0 ? (
                <Heart className="w-3 h-3 text-pink-400/30" />
              ) : i % 4 === 1 ? (
                <Star className="w-2 h-2 text-yellow-400/30" />
              ) : i % 4 === 2 ? (
                <Sparkles className="w-3 h-3 text-cyan-400/30" />
              ) : (
                <div className="w-1 h-1 rounded-full bg-purple-400/30" />
              )}
            </div>
          ))}
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row">
          {/* Left side - Film info */}
          <div className="lg:w-1/3 p-6 border-r border-white/20">
            <div className="relative aspect-[2/3] mb-6 rounded-xl overflow-hidden shadow-2xl">
              <Image
                src={film.posterUrl || "/placeholder.svg"}
                alt={film.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Pride badge */}
              <div className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                <Crown className="w-3 h-3" />
                <span>PREMIUM</span>
              </div>
            </div>
            
            <h3 className="text-white text-xl font-bold mb-2">
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                {film.title}
              </span>
            </h3>
            <p className="text-gray-300 text-sm mb-6">{film.genre} • {film.releaseYear}</p>
            
            {/* Pricing breakdown */}
            <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-300">Subtotal:</span>
                <span className="text-white font-medium">R$ {film.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-300">Taxa Pride Support:</span>
                <span className="text-green-400 font-medium">R$ 0,00</span>
              </div>
              <hr className="border-white/20 my-3" />
              <div className="flex justify-between items-center">
                <span className="text-white font-bold flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
                  Total:
                </span>
                <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  R$ {film.price.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Security badges */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center space-x-2 text-xs text-gray-300">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Criptografia SSL 256-bit</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-300">
                <Lock className="w-4 h-4 text-blue-400" />
                <span>Processado via Stripe</span>
              </div>
            </div>
          </div>

          {/* Right side - Payment form */}
          <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white text-2xl font-bold">
                    <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      Finalizar Compra
                    </span>
                  </h2>
                  <p className="text-gray-300 text-sm">Pagamento seguro e instantâneo</p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="text-gray-400 hover:text-white p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Card Information */}
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <h3 className="text-white font-bold mb-4 flex items-center">
                  <Lock className="w-5 h-5 mr-2 text-green-400" />
                  <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    Informações do Cartão
                  </span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Número do Cartão
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.cardNumber}
                        onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                          errors.cardNumber ? 'border-red-500' : 'border-white/20'
                        } focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 pr-20`}
                        disabled={isProcessing}
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-400 bg-white/10 px-2 py-1 rounded">
                        {getCardBrand(formData.cardNumber)}
                      </div>
                    </div>
                    {errors.cardNumber && (
                      <p className="text-red-400 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.cardNumber}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Validade
                      </label>
                      <input
                        type="text"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                        placeholder="MM/AA"
                        maxLength={5}
                        className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                          errors.expiryDate ? 'border-red-500' : 'border-white/20'
                        } focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all duration-300`}
                        disabled={isProcessing}
                      />
                      {errors.expiryDate && (
                        <p className="text-red-400 text-sm mt-1">{errors.expiryDate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={formData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value)}
                        placeholder="123"
                        maxLength={4}
                        className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                          errors.cvv ? 'border-red-500' : 'border-white/20'
                        } focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/20 transition-all duration-300`}
                        disabled={isProcessing}
                      />
                      {errors.cvv && (
                        <p className="text-red-400 text-sm mt-1">{errors.cvv}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Nome do Portador
                    </label>
                    <input
                      type="text"
                      value={formData.cardholderName}
                      onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                      placeholder="Nome como aparece no cartão"
                      className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                        errors.cardholderName ? 'border-red-500' : 'border-white/20'
                      } focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300`}
                      disabled={isProcessing}
                    />
                    {errors.cardholderName && (
                      <p className="text-red-400 text-sm mt-1">{errors.cardholderName}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Billing Information */}
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <h3 className="text-white font-bold mb-4 flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-pink-400" />
                  <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Informações de Cobrança
                  </span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="seu@email.com"
                      className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                        errors.email ? 'border-red-500' : 'border-white/20'
                      } focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300`}
                      disabled={isProcessing}
                    />
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        CEP
                      </label>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        placeholder="12345-678"
                        className="w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all duration-300"
                        disabled={isProcessing}
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Cidade
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Sua cidade"
                        className="w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all duration-300"
                        disabled={isProcessing}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-xl backdrop-blur-sm">
                <Shield className="w-6 h-6 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-300 text-sm">
                    <strong>🔒 Pagamento 100% Seguro:</strong> Seus dados são protegidos com criptografia militar. 
                    Processamento via Stripe com certificação PCI DSS.
                  </p>
                  <p className="text-blue-200 text-xs mt-1">
                    ✨ Apoie conteúdo diverso e inclusivo com sua compra
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 text-white py-5 rounded-xl font-bold text-lg hover:from-green-600 hover:via-emerald-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-green-500/25 flex items-center justify-center space-x-3"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Processando com amor...</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-6 h-6" />
                    <span>Finalizar Compra - R$ {film.price.toFixed(2)}</span>
                    <Heart className="w-5 h-5 text-pink-300" />
                  </>
                )}
              </button>
            </form>

            {/* Pride Footer */}
            <div className="mt-6 text-center">
              <div className="flex justify-center space-x-1 mb-2">
                {['🏳️‍🌈', '🏳️‍⚧️', '❤️', '🧡', '💛', '💚', '💙', '💜'].map((emoji, i) => (
                  <span key={i} className="text-lg animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                    {emoji}
                  </span>
                ))}
              </div>
              <p className="text-gray-400 text-xs">
                💖 Obrigado por apoiar conteúdo diverso e inclusivo 💖
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}