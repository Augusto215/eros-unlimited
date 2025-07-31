"use client"

import { useState } from "react"
import { X, Plus, Upload, Film } from "lucide-react"
import { addFilm, type NewFilmData } from "@/lib/movies"

interface FilmFormData {
  title: string
  synopsis: string
  genre: string
  duration: number | string
  releaseYear: number | string
  rating: number | string
  price: number | string
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
  const [formData, setFormData] = useState<FilmFormData>({
    title: '',
    synopsis: '',
    genre: '',
    duration: 0,
    releaseYear: new Date().getFullYear(),
    rating: 0,
    price: 0,
    posterUrl: '',
    trailerUrl: '',
    videoUrl: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<FilmFormData>>({})

  if (!isOpen) return null

  const genres = [
    'Ação', 'Aventura', 'Animação', 'Comédia', 'Crime', 'Drama', 
    'Fantasia', 'Ficção Científica', 'Horror', 'Mistério', 'Romance', 
    'Thriller', 'Guerra', 'Western', 'Musical', 'Documentário'
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i)

  const handleInputChange = (field: keyof FilmFormData, value: string | number) => {
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

    if (isNaN(duration) || duration <= 0) {
      newErrors.duration = 'Duração deve ser maior que 0'
    }

    if (isNaN(releaseYear) || releaseYear < 1900 || releaseYear > currentYear) {
      newErrors.releaseYear = 'Ano de lançamento inválido'
    }

    if (isNaN(rating) || rating < 0 || rating > 10) {
      newErrors.rating = 'Avaliação deve estar entre 0 e 10'
    }

    if (isNaN(price) || price < 0) {
      newErrors.price = 'Preço deve ser maior ou igual a 0'
    }

    // URL validation disabled for testing - just leave URLs empty if you don't want to use them
    // URLs are optional, so no validation needed for now

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Form submitted with data:', formData)
    
    if (!validateForm()) {
      console.log('Form validation failed')
      return
    }

    console.log('Form validation passed')
    setIsSubmitting(true)

    try {
      console.log('Starting film addition process...')
      
      // Call the real API to add the film
      const filmToAdd = {
        title: formData.title,
        synopsis: formData.synopsis,
        genre: formData.genre,
        duration: Number(formData.duration),
        releaseYear: Number(formData.releaseYear),
        rating: Number(formData.rating),
        price: Number(formData.price),
        posterUrl: formData.posterUrl.trim() || undefined,
        trailerUrl: formData.trailerUrl.trim() || undefined,
        videoUrl: formData.videoUrl.trim() || undefined,
      }

      console.log('Film data to add:', filmToAdd)

      const newFilm = await addFilm(filmToAdd)

      console.log('Film addition result:', newFilm)

      if (newFilm) {
        console.log('Film added successfully:', newFilm)
        
        // Reset form
        setFormData({
          title: '',
          synopsis: '',
          genre: '',
          duration: 0,
          releaseYear: new Date().getFullYear(),
          rating: 0,
          price: 0,
          posterUrl: '',
          trailerUrl: '',
          videoUrl: ''
        })

        // Clear errors
        setErrors({})

        // Notify parent component and close modal
        console.log('Calling onFilmAdded callback')
        onFilmAdded()
        console.log('Closing modal')
        onClose()
      } else {
        console.error('No film returned from addFilm function')
        setErrors({
          title: 'Erro inesperado ao adicionar filme'
        })
      }
    } catch (error: any) {
      console.error('Error adding film:', error)
      
      // Show error to user
      setErrors({
        title: error.message || 'Erro ao adicionar filme. Tente novamente.'
      })
    } finally {
      console.log('Setting isSubmitting to false')
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Film className="w-6 h-6 text-blue-400" />
            <h2 className="text-white text-2xl font-bold">Adicionar Novo Filme</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-white p-2 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-4">Informações Básicas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ex: Inception"
                  className={`w-full p-3 bg-gray-700 text-white rounded-md border ${
                    errors.title ? 'border-red-500' : 'border-gray-600'
                  } focus:border-blue-500 focus:outline-none`}
                  disabled={isSubmitting}
                />
                {errors.title && (
                  <p className="text-red-400 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* Genre */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Gênero *
                </label>
                <select
                  value={formData.genre}
                  onChange={(e) => handleInputChange('genre', e.target.value)}
                  className={`w-full p-3 bg-gray-700 text-white rounded-md border ${
                    errors.genre ? 'border-red-500' : 'border-gray-600'
                  } focus:border-blue-500 focus:outline-none`}
                  disabled={isSubmitting}
                >
                  <option value="">Selecione um gênero</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
                {errors.genre && (
                  <p className="text-red-400 text-sm mt-1">{errors.genre}</p>
                )}
              </div>

              {/* Release Year */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Ano de Lançamento *
                </label>
                <select
                  value={formData.releaseYear}
                  onChange={(e) => handleInputChange('releaseYear', parseInt(e.target.value))}
                  className={`w-full p-3 bg-gray-700 text-white rounded-md border ${
                    errors.releaseYear ? 'border-red-500' : 'border-gray-600'
                  } focus:border-blue-500 focus:outline-none`}
                  disabled={isSubmitting}
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {errors.releaseYear && (
                  <p className="text-red-400 text-sm mt-1">{errors.releaseYear}</p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Duração (minutos) *
                </label>
                <input
                  type="number"
                  value={formData.duration === 0 ? '' : formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value ? parseInt(e.target.value) : 0)}
                  placeholder="Ex: 148"
                  min="1"
                  className={`w-full p-3 bg-gray-700 text-white rounded-md border ${
                    errors.duration ? 'border-red-500' : 'border-gray-600'
                  } focus:border-blue-500 focus:outline-none`}
                  disabled={isSubmitting}
                />
                {errors.duration && (
                  <p className="text-red-400 text-sm mt-1">{errors.duration}</p>
                )}
              </div>

              {/* Rating */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Avaliação (0-10) *
                </label>
                <input
                  type="number"
                  value={formData.rating === 0 ? '' : formData.rating}
                  onChange={(e) => handleInputChange('rating', e.target.value ? parseFloat(e.target.value) : 0)}
                  placeholder="Ex: 8.8"
                  min="0"
                  max="10"
                  step="0.1"
                  className={`w-full p-3 bg-gray-700 text-white rounded-md border ${
                    errors.rating ? 'border-red-500' : 'border-gray-600'
                  } focus:border-blue-500 focus:outline-none`}
                  disabled={isSubmitting}
                />
                {errors.rating && (
                  <p className="text-red-400 text-sm mt-1">{errors.rating}</p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Preço (R$) *
                </label>
                <input
                  type="number"
                  value={formData.price === 0 ? '' : formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value ? parseFloat(e.target.value) : 0)}
                  placeholder="Ex: 15.99"
                  min="0"
                  step="0.01"
                  className={`w-full p-3 bg-gray-700 text-white rounded-md border ${
                    errors.price ? 'border-red-500' : 'border-gray-600'
                  } focus:border-blue-500 focus:outline-none`}
                  disabled={isSubmitting}
                />
                {errors.price && (
                  <p className="text-red-400 text-sm mt-1">{errors.price}</p>
                )}
              </div>

              {/* Synopsis */}
              <div className="md:col-span-2">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Sinopse *
                </label>
                <textarea
                  value={formData.synopsis}
                  onChange={(e) => handleInputChange('synopsis', e.target.value)}
                  placeholder="Descreva a história do filme..."
                  rows={4}
                  className={`w-full p-3 bg-gray-700 text-white rounded-md border ${
                    errors.synopsis ? 'border-red-500' : 'border-gray-600'
                  } focus:border-blue-500 focus:outline-none resize-vertical`}
                  disabled={isSubmitting}
                />
                {errors.synopsis && (
                  <p className="text-red-400 text-sm mt-1">{errors.synopsis}</p>
                )}
              </div>
            </div>
          </div>

          {/* Media URLs */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              URLs de Mídia
            </h3>
            
            <div className="space-y-4">
              {/* Poster URL */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  URL do Poster
                </label>
                <input
                  type="url"
                  value={formData.posterUrl}
                  onChange={(e) => handleInputChange('posterUrl', e.target.value)}
                  placeholder="https://example.com/poster.jpg"
                  className={`w-full p-3 bg-gray-700 text-white rounded-md border ${
                    errors.posterUrl ? 'border-red-500' : 'border-gray-600'
                  } focus:border-blue-500 focus:outline-none`}
                  disabled={isSubmitting}
                />
                {errors.posterUrl && (
                  <p className="text-red-400 text-sm mt-1">{errors.posterUrl}</p>
                )}
              </div>

              {/* Trailer URL */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  URL do Trailer
                </label>
                <input
                  type="url"
                  value={formData.trailerUrl}
                  onChange={(e) => handleInputChange('trailerUrl', e.target.value)}
                  placeholder="https://example.com/trailer.mp4"
                  className={`w-full p-3 bg-gray-700 text-white rounded-md border ${
                    errors.trailerUrl ? 'border-red-500' : 'border-gray-600'
                  } focus:border-blue-500 focus:outline-none`}
                  disabled={isSubmitting}
                />
                {errors.trailerUrl && (
                  <p className="text-red-400 text-sm mt-1">{errors.trailerUrl}</p>
                )}
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  URL do Filme Completo
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                  placeholder="https://example.com/movie.mp4"
                  className={`w-full p-3 bg-gray-700 text-white rounded-md border ${
                    errors.videoUrl ? 'border-red-500' : 'border-gray-600'
                  } focus:border-blue-500 focus:outline-none`}
                  disabled={isSubmitting}
                />
                {errors.videoUrl && (
                  <p className="text-red-400 text-sm mt-1">{errors.videoUrl}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gray-600 text-white rounded-md font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Adicionando...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Adicionar Filme</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}