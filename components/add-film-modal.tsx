"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X, Plus, Upload, Film, Crown, Star, Sparkles, Heart, Calendar, Clock, DollarSign, Camera, Video, Image as ImageIcon, Check } from "lucide-react"
import { addFilm, type NewFilmData } from "@/lib/movies"

interface FilmFormData {
  title: string
  synopsis: string
  genre: string
  duration: number | string
  releaseYear: number | string
  rating: number | string
  price: number | string
  launch: boolean
  posterUrl: string
  trailerUrl: string
  videoUrl: string
}

interface AddFilmModalProps {
  isOpen: boolean
  onClose: () => void
  onFilmAdded: () => void
}

export default function AddFilmModal({ isOpen, onClose, onFilmAdded }: AddFilmModalProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<FilmFormData>({
    title: '',
    synopsis: '',
    genre: '',
    duration: '',
    releaseYear: new Date().getFullYear(),
    rating: '',
    price: '',
    launch: false,
    posterUrl: '',
    trailerUrl: '',
    videoUrl: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [errors, setErrors] = useState<Partial<FilmFormData>>({})

  if (!isOpen) return null

  const genres = [
    'Ação', 'Aventura', 'Animação', 'Comédia', 'Crime', 'Drama', 
    'Fantasia', 'Ficção Científica', 'Horror', 'Mistério', 'Romance', 
    'Thriller', 'Guerra', 'Western', 'Musical', 'Documentário'
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i)

  const handleInputChange = (field: keyof FilmFormData, value: string | number | boolean) => {
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
    const newErrors: Partial<FilmFormData> = {}

    // Required fields validation
    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório'
    }

    if (!formData.synopsis.trim()) {
      newErrors.synopsis = 'Sinopse é obrigatória'
    }

    if (!formData.genre) {
      newErrors.genre = 'Gênero é obrigatório'
    }

    // Convert to numbers for validation
    const duration = Number(formData.duration)
    const releaseYear = Number(formData.releaseYear)
    const rating = Number(formData.rating)
    const price = Number(formData.price)

    // Duration validation (should be positive integer)
    if (isNaN(duration) || duration <= 0 || duration > 999) {
      newErrors.duration = 'Duração deve estar entre 1 e 999 minutos'
    }

    // Release year validation
    if (isNaN(releaseYear) || releaseYear < 1900 || releaseYear > currentYear) {
      newErrors.releaseYear = 'Ano de lançamento inválido'
    }

    // Rating validation - CRITICAL: limit to 9.9 due to database constraint NUMERIC(2,1)
    if (isNaN(rating) || rating < 0 || rating > 9.9) {
      newErrors.rating = 'Avaliação deve estar entre 0 e 9.9'
    }

    // Price validation - limit to reasonable values
    if (isNaN(price) || price < 0 || price > 9999.99) {
      newErrors.price = 'Preço deve estar entre 0 e 9999.99'
    }

    // URL validation (optional)
    const urlFields = ['posterUrl', 'trailerUrl', 'videoUrl'] as const
    urlFields.forEach(field => {
      const url = formData[field] as string
      if (url && url.trim()) {
        try {
          new URL(url.trim())
        } catch {
          newErrors[field] = 'URL inválida'
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare data with proper type conversion and limits
      const filmToAdd = {
        title: formData.title.trim(),
        synopsis: formData.synopsis.trim(),
        genre: formData.genre,
        duration: Math.min(999, Math.max(1, Number(formData.duration))), // Clamp between 1-999
        releaseYear: Number(formData.releaseYear),
        rating: Math.min(9.9, Math.max(0, Number(formData.rating))), // Clamp between 0-9.9
        price: Math.min(9999.99, Math.max(0, Number(formData.price))), // Clamp price
        launch: formData.launch,
        posterUrl: formData.posterUrl.trim() || undefined,
        trailerUrl: formData.trailerUrl.trim() || undefined,
        videoUrl: formData.videoUrl.trim() || undefined,
      }

      const newFilm = await addFilm(filmToAdd)

      if (newFilm) {
        // Show success message
        setShowSuccessMessage(true)
        
        // Reset form
        setFormData({
          title: '',
          synopsis: '',
          genre: '',
          duration: '',
          releaseYear: new Date().getFullYear(),
          rating: '',
          price: '',
          launch: false,
          posterUrl: '',
          trailerUrl: '',
          videoUrl: ''
        })

        // Clear errors
        setErrors({})

        // Notify parent component
        onFilmAdded()

        // Wait 3 seconds then redirect to Home
        setTimeout(() => {
          setShowSuccessMessage(false)
          onClose()
          router.push('/')
        }, 3000)
      } else {
        setErrors({
          title: 'Erro inesperado ao adicionar filme'
        })
      }
    } catch (error: any) {
      // Show error to user
      setErrors({
        title: error.message || 'Erro ao adicionar filme. Tente novamente.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting && !showSuccessMessage) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-xl rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto border border-white/20 shadow-2xl relative">
        
        {/* Success Message Overlay */}
        {showSuccessMessage && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 rounded-2xl border border-green-400/30 shadow-2xl transform animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-white text-2xl font-bold mb-2">Filme Adicionado com Sucesso! 🎬</h3>
                  <p className="text-green-100 text-sm">Redirecionando para a página inicial em alguns segundos...</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
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
              {i % 6 === 0 ? (
                <Star className="w-3 h-3 text-yellow-400/30" />
              ) : i % 6 === 1 ? (
                <Heart className="w-3 h-3 text-pink-400/30" />
              ) : i % 6 === 2 ? (
                <Sparkles className="w-2 h-2 text-cyan-400/30" />
              ) : i % 6 === 3 ? (
                <Film className="w-3 h-3 text-purple-400/30" />
              ) : i % 6 === 4 ? (
                <Crown className="w-2 h-2 text-orange-400/30" />
              ) : (
                <div className="w-1 h-1 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 opacity-30" />
              )}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-8 border-b border-white/20">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white text-3xl font-bold">
                <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                  Admin Studio
                </span>
              </h2>
              <p className="text-gray-300 text-sm">Adicionar novo filme à plataforma</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting || showSuccessMessage}
            className="text-gray-400 hover:text-white p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="relative z-10 p-8 space-y-8">
          {/* Basic Information */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <h3 className="text-white font-bold text-xl mb-6 flex items-center">
              <Sparkles className="w-5 h-5 mr-3 text-yellow-400" />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Informações Básicas
              </span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                  <Film className="w-4 h-4 mr-2 text-purple-400" />
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ex: Call Me By Your Name"
                  className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                    errors.title ? 'border-red-500' : 'border-white/20'
                  } focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all duration-300`}
                  disabled={isSubmitting || showSuccessMessage}
                />
                {errors.title && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <X className="w-4 h-4 mr-1" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Genre */}
              <div>
                <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                  <Heart className="w-4 h-4 mr-2 text-pink-400" />
                  Gênero *
                </label>
                <select
                  value={formData.genre}
                  onChange={(e) => handleInputChange('genre', e.target.value)}
                  className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                    errors.genre ? 'border-red-500' : 'border-white/20'
                  } focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/20 transition-all duration-300`}
                  disabled={isSubmitting || showSuccessMessage}
                >
                  <option value="" className="bg-gray-800 text-gray-400">Selecione um gênero</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre} className="bg-gray-800 text-white">{genre}</option>
                  ))}
                </select>
                {errors.genre && (
                  <p className="text-red-400 text-sm mt-2">{errors.genre}</p>
                )}
              </div>

              {/* Release Year */}
              <div>
                <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                  Ano de Lançamento *
                </label>
                <select
                  value={formData.releaseYear}
                  onChange={(e) => handleInputChange('releaseYear', parseInt(e.target.value))}
                  className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                    errors.releaseYear ? 'border-red-500' : 'border-white/20'
                  } focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300`}
                  disabled={isSubmitting || showSuccessMessage}
                >
                  {years.map(year => (
                    <option key={year} value={year} className="bg-gray-800 text-white">{year}</option>
                  ))}
                </select>
                {errors.releaseYear && (
                  <p className="text-red-400 text-sm mt-2">{errors.releaseYear}</p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-green-400" />
                  Duração (minutos) * <span className="text-gray-500 ml-2">(1-999)</span>
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="Ex: 132"
                  min="1"
                  max="999"
                  className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                    errors.duration ? 'border-red-500' : 'border-white/20'
                  } focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all duration-300`}
                  disabled={isSubmitting || showSuccessMessage}
                />
                {errors.duration && (
                  <p className="text-red-400 text-sm mt-2">{errors.duration}</p>
                )}
              </div>

              {/* Rating */}
              <div>
                <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                  <Star className="w-4 h-4 mr-2 text-yellow-400" />
                  Avaliação * <span className="text-gray-500 ml-2">(0-9.9)</span>
                </label>
                <input
                  type="number"
                  value={formData.rating}
                  onChange={(e) => handleInputChange('rating', e.target.value)}
                  placeholder="Ex: 8.7"
                  min="0"
                  max="9.9"
                  step="0.1"
                  className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                    errors.rating ? 'border-red-500' : 'border-white/20'
                  } focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300`}
                  disabled={isSubmitting || showSuccessMessage}
                />
                {errors.rating && (
                  <p className="text-red-400 text-sm mt-2">{errors.rating}</p>
                )}
                <p className="text-gray-400 text-xs mt-2 flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" />
                  ⚠️ Máximo 9.9 devido às limitações atuais do banco de dados
                </p>
              </div>

              {/* Price */}
              <div>
                <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-emerald-400" />
                  Preço (USD) * <span className="text-gray-500 ml-2">(0-9999.99)</span>
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="Ex: 24.99"
                  min="0"
                  max="9999.99"
                  step="0.01"
                  className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                    errors.price ? 'border-red-500' : 'border-white/20'
                  } focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300`}
                  disabled={isSubmitting || showSuccessMessage}
                />
                {errors.price && (
                  <p className="text-red-400 text-sm mt-2">{errors.price}</p>
                )}
              </div>

              {/* Launch */}
              <div>
                <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-cyan-400" />
                  É um lançamento? *
                </label>
                <select
                  value={formData.launch ? 'sim' : 'nao'}
                  onChange={(e) => handleInputChange('launch', e.target.value === 'sim')}
                  className="w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                  disabled={isSubmitting || showSuccessMessage}
                >
                  <option value="nao" className="bg-gray-800 text-white">Não</option>
                  <option value="sim" className="bg-gray-800 text-white">Sim</option>
                </select>
                <p className="text-gray-400 text-xs mt-2 flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Filmes marcados como lançamento aparecerão em destaque
                </p>
              </div>

              {/* Synopsis */}
              <div className="md:col-span-2">
                <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                  <Heart className="w-4 h-4 mr-2 text-pink-400" />
                  Sinopse *
                </label>
                <textarea
                  value={formData.synopsis}
                  onChange={(e) => handleInputChange('synopsis', e.target.value)}
                  placeholder="Conte a história deste filme incrível..."
                  rows={4}
                  className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                    errors.synopsis ? 'border-red-500' : 'border-white/20'
                  } focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/20 transition-all duration-300 resize-vertical`}
                  disabled={isSubmitting || showSuccessMessage}
                />
                {errors.synopsis && (
                  <p className="text-red-400 text-sm mt-2">{errors.synopsis}</p>
                )}
              </div>
            </div>
          </div>

          {/* Media URLs */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <h3 className="text-white font-bold text-xl mb-6 flex items-center">
              <Upload className="w-5 h-5 mr-3 text-cyan-400" />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                URLs de Mídia (Opcionais)
              </span>
            </h3>
            
            <div className="space-y-6">
              {/* Poster URL */}
              <div>
                <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                  <ImageIcon className="w-4 h-4 mr-2 text-purple-400" />
                  URL do Poster
                </label>
                <input
                  type="url"
                  value={formData.posterUrl}
                  onChange={(e) => handleInputChange('posterUrl', e.target.value)}
                  placeholder="https://example.com/poster.jpg"
                  className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                    errors.posterUrl ? 'border-red-500' : 'border-white/20'
                  } focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all duration-300`}
                  disabled={isSubmitting || showSuccessMessage}
                />
                {errors.posterUrl && (
                  <p className="text-red-400 text-sm mt-2">{errors.posterUrl}</p>
                )}
              </div>

              {/* Trailer URL */}
              <div>
                <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                  <Camera className="w-4 h-4 mr-2 text-orange-400" />
                  URL do Trailer
                </label>
                <input
                  type="url"
                  value={formData.trailerUrl}
                  onChange={(e) => handleInputChange('trailerUrl', e.target.value)}
                  placeholder="https://example.com/trailer.mp4"
                  className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                    errors.trailerUrl ? 'border-red-500' : 'border-white/20'
                  } focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all duration-300`}
                  disabled={isSubmitting || showSuccessMessage}
                />
                {errors.trailerUrl && (
                  <p className="text-red-400 text-sm mt-2">{errors.trailerUrl}</p>
                )}
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-gray-200 text-sm font-medium mb-3 flex items-center">
                  <Video className="w-4 h-4 mr-2 text-green-400" />
                  URL do Filme Completo
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                  placeholder="https://example.com/movie.mp4"
                  className={`w-full p-4 bg-white/10 backdrop-blur-sm text-white rounded-xl border ${
                    errors.videoUrl ? 'border-red-500' : 'border-white/20'
                  } focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all duration-300`}
                  disabled={isSubmitting || showSuccessMessage}
                />
                {errors.videoUrl && (
                  <p className="text-red-400 text-sm mt-2">{errors.videoUrl}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-6 pt-6 border-t border-white/20">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting || showSuccessMessage}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || showSuccessMessage}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:via-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-orange-500/25 flex items-center justify-center space-x-3"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Adicionando com amor...</span>
                </>
              ) : showSuccessMessage ? (
                <>
                  <Check className="w-6 h-6" />
                  <span>Filme Adicionado!</span>
                  <Sparkles className="w-5 h-5" />
                </>
              ) : (
                <>
                  <Crown className="w-6 h-6" />
                  <span>Adicionar Filme</span>
                  <Plus className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Pride Footer */}
        <div className="relative z-10 p-6 border-t border-white/20">
          <div className="text-center">
            <div className="flex justify-center space-x-1 mb-3">
              {['🎬', '🌈', '👑', '✨', '❤️', '🧡', '💛', '💚', '💙', '💜'].map((emoji, i) => (
                <span key={i} className="text-lg animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>
                  {emoji}
                </span>
              ))}
            </div>
            <p className="text-gray-300 text-sm">
              🎭 Criando conteúdo diverso e inclusivo para nossa comunidade 🎭
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}