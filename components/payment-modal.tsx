"use client"

import { useState } from "react"
import { X, AlertCircle, Heart, Sparkles, Crown, Star, Shield, Wallet } from "lucide-react"
import type { Film } from "@/lib/types"
import Image from "next/image"
import { usePaymentTranslation, useMoviesTranslation, useFilmTitleTranslation, useFilmGenreTranslation, useCommonTranslation } from "@/hooks/useTranslation"

interface PaymentModalProps {
  film: Film | null
  isOpen: boolean
  userId: string
  onClose: () => void
  onPaymentSuccess: (filmId: string) => void
}

interface PaymentForm {
  email: string
}

export default function PaymentModal({ film, isOpen, userId, onClose, onPaymentSuccess }: PaymentModalProps) {
  const payment = usePaymentTranslation()
  const movies = useMoviesTranslation()
  const common = useCommonTranslation()
  const { getTitle } = useFilmTitleTranslation()
  const { getGenre } = useFilmGenreTranslation()

  const [formData, setFormData] = useState<PaymentForm>({
    email: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<Partial<PaymentForm>>({})

  if (!isOpen || !film) return null

  const handleInputChange = (field: keyof PaymentForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = payment.invalidEmailPaypal
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    handlePayPalPayment()
  }

  const handlePayPalPayment = async () => {
    setIsProcessing(true)

    try {
      const response = await fetch('/api/create-paypal-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: film.price,
          filmId: film.id,
          userId: userId,
          email: formData.email
        })
      })
      const { approvalUrl } = await response.json()
      window.location.href = approvalUrl

    } catch (error: any) {
      console.error('PayPal payment error:', error)
      setErrors({ 
        email: error.message || `${payment.paymentError}. ${common.tryAgain}.`
      })
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-xl rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto border border-white/20 shadow-2xl">
        
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
                <span>{movies.premium}</span>
              </div>
            </div>
            
            <h3 className="text-white text-xl font-bold mb-2">
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                {getTitle(film.id, film.title)}
              </span>
            </h3>
            <p className="text-gray-300 text-sm mb-6">{getGenre(film.id, film.genre)} • {film.releaseYear}</p>
            
            {/* Pricing breakdown */}
            <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-300">{payment.subtotal}:</span>
                <span className="text-white font-medium">USD {film.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-300">{payment.prideSupportFee}:</span>
                <span className="text-green-400 font-medium">USD 0,00</span>
              </div>
              <hr className="border-white/20 my-3" />
              <div className="flex justify-between items-center">
                <span className="text-white font-bold flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
                  {payment.total}:
                </span>
                <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  USD {film.price.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Security badges */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center space-x-2 text-xs text-gray-300">
                <Shield className="w-4 h-4 text-green-400" />
                <span>{payment.ssl256Encryption}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-300">
                <Wallet className="w-4 h-4 text-blue-400" />
                <span>{payment.processedViaPaypal}</span>
              </div>
            </div>
          </div>

          {/* Right side - PayPal payment */}
          <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white text-2xl font-bold">
                    <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      {payment.paypalPayment}
                    </span>
                  </h2>
                  <p className="text-gray-300 text-sm">{payment.secureInstantPayment}</p>
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
              {/* PayPal Section */}
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Wallet className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-4">
                    <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      PayPal
                    </span>
                  </h3>
                  <p className="text-gray-300 text-sm mb-6">
                    {payment.redirectMessage}
                  </p>
                  
                  <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{payment.totalToPay}:</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        USD {film.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Email field for PayPal */}
                <div className="mb-6">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    {payment.paypalEmail}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder={payment.paypalEmailPlaceholder}
                    className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                      errors.email ? 'border-red-500' : 'border-white/20'
                    } focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300`}
                    disabled={isProcessing}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                  <p className="text-gray-400 text-xs mt-1">
                    {payment.enterPaypalEmail}
                  </p>
                </div>

                <div className="space-y-3 text-xs text-gray-400">
                  <div className="flex items-center justify-center space-x-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span>{payment.paypalBuyerProtection}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Wallet className="w-4 h-4 text-blue-400" />
                    <span>{payment.securePayment100}</span>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-xl backdrop-blur-sm">
                <Shield className="w-6 h-6 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-300 text-sm">
                    <strong>{payment.securePaymentNotice}</strong> {payment.militaryEncryption}
                  </p>
                  <p className="text-blue-200 text-xs mt-1">
                    {payment.supportDiverseContent}
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing || !formData.email}
                className="w-full py-5 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 text-white hover:from-blue-600 hover:via-blue-700 hover:to-cyan-600 hover:shadow-blue-500/25"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>{payment.redirectingToPaypal}</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-6 h-6" />
                    <span>{payment.payWithPaypal} - USD {film.price.toFixed(2)}</span>
                    <Heart className="w-5 h-5 text-pink-300" />
                  </>
                )}
              </button>
            </form>

            {/* PayPal Benefits */}
            <div className="mt-6 bg-blue-500/10 border border-blue-400/20 rounded-xl p-4">
              <h4 className="text-blue-300 font-medium mb-3 text-center">{payment.paypalAdvantages}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-300">
                <div className="flex items-center space-x-2">
                  <Shield className="w-3 h-3 text-green-400" />
                  <span>{payment.totalBuyerProtection}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Wallet className="w-3 h-3 text-blue-400" />
                  <span>{payment.noShareBankData}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Crown className="w-3 h-3 text-yellow-400" />
                  <span>{payment.instantPayment}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="w-3 h-3 text-pink-400" />
                  <span>{payment.support24x7}</span>
                </div>
              </div>
            </div>

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
                {payment.thankYouSupport}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}