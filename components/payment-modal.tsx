"use client"

import { useState } from "react"
import { X, CreditCard, Lock, AlertCircle } from "lucide-react"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        <div className="flex">
          {/* Left side - Film info */}
          <div className="w-1/3 p-6 border-r border-gray-700">
            <div className="relative aspect-[2/3] mb-4 rounded-lg overflow-hidden">
              <Image
                src={film.posterUrl || "/placeholder.svg"}
                alt={film.title}
                fill
                className="object-cover"
              />
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">{film.title}</h3>
            <p className="text-gray-400 text-sm mb-4">{film.genre} • {film.releaseYear}</p>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Subtotal:</span>
                <span className="text-white">R$ {film.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Taxa de processamento:</span>
                <span className="text-white">R$ 0,00</span>
              </div>
              <hr className="border-gray-600 my-2" />
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold">Total:</span>
                <span className="text-green-400 font-bold text-xl">R$ {film.price.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Right side - Payment form */}
          <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-6 h-6 text-blue-400" />
                <h2 className="text-white text-2xl font-bold">Finalizar Compra</h2>
              </div>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="text-gray-400 hover:text-white p-2 disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Card Information */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-4 flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-green-400" />
                  Informações do Cartão
                </h3>

                <div className="grid grid-cols-1 gap-4">
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
                        className={`w-full p-3 bg-gray-700 text-white rounded-md border ${
                          errors.cardNumber ? 'border-red-500' : 'border-gray-600'
                        } focus:border-blue-500 focus:outline-none pr-20`}
                        disabled={isProcessing}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
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
                        className={`w-full p-3 bg-gray-700 text-white rounded-md border ${
                          errors.expiryDate ? 'border-red-500' : 'border-gray-600'
                        } focus:border-blue-500 focus:outline-none`}
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
                        className={`w-full p-3 bg-gray-700 text-white rounded-md border ${
                          errors.cvv ? 'border-red-500' : 'border-gray-600'
                        } focus:border-blue-500 focus:outline-none`}
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
                      placeholder="João Silva"
                      className={`w-full p-3 bg-gray-700 text-white rounded-md border ${
                        errors.cardholderName ? 'border-red-500' : 'border-gray-600'
                      } focus:border-blue-500 focus:outline-none`}
                      disabled={isProcessing}
                    />
                    {errors.cardholderName && (
                      <p className="text-red-400 text-sm mt-1">{errors.cardholderName}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Billing Information */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-4">Informações de Cobrança</h3>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="seu@email.com"
                      className={`w-full p-3 bg-gray-700 text-white rounded-md border ${
                        errors.email ? 'border-red-500' : 'border-gray-600'
                      } focus:border-blue-500 focus:outline-none`}
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
                        className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
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
                        placeholder="São Paulo"
                        className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                        disabled={isProcessing}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-start space-x-2 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
                <Lock className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-blue-300 text-sm">
                    <strong>Segurança garantida:</strong> Seus dados são protegidos com criptografia SSL de 256 bits.
                    Processado via Stripe.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Finalizar Compra - R$ {film.price.toFixed(2)}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}