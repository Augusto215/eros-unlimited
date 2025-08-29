"use client"

import { useState } from "react"
import { X, Play, Star, Clock, Calendar, Film, Heart, Crown, Sparkles } from "lucide-react"
import { useMoviesTranslation, useTranslation } from "@/hooks/useTranslation"
import type { Film as FilmType } from "@/lib/types"
import Image from "next/image"

interface FilmModalProps {
  film: FilmType | null
  isOpen: boolean
  isPurchased: boolean
  onClose: () => void
  onPurchase: (filmId: string) => void
  onPlay: (film: FilmType) => void
}

export default function FilmModal({ film, isOpen, isPurchased, onClose, onPurchase, onPlay }: FilmModalProps) {
  const movies = useMoviesTranslation()
  const { t, locale } = useTranslation()
  const [isPlaying, setIsPlaying] = useState(false)

  if (!isOpen || !film) return null

  const handlePlay = () => {
    if (isPurchased) {
      setIsPlaying(true)
      onPlay(film)
    }
  }

  const handlePurchase = () => {
    onPurchase(film.id)
  }

  const getLocalizedTitle = (film: FilmType, locale: string) => {
    if (locale === "pt-BR") return film.title_pt || film.title
    if (locale === "es") return film.title_es || film.title
    if (locale === "zh") return film.title_zh || film.title
    return film.title
  }
  
  const getLocalizedSynopsis = (film: FilmType, locale: string) => {
    if (locale === "pt-BR") return film.synopsis_pt || film.synopsis
    if (locale === "es") return film.synopsis_es || film.synopsis
    if (locale === "zh") return film.synopsis_zh || film.synopsis
    return film.synopsis
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-xl rounded-2xl max-w-6xl w-full mx-4 max-h-[95vh] overflow-y-auto border border-white/20 shadow-2xl">
        {/* Header Video/Image Section */}
        <div className="relative">
          {isPlaying ? (
            <div className="aspect-video bg-black rounded-t-2xl overflow-hidden">
              <video 
                controls 
                autoPlay 
                className="w-full h-full" 
                onEnded={() => setIsPlaying(false)}
              >
                <source src={film.videoUrl} type="video/mp4" />
              </video>
            </div>
          ) : (
            <div className="relative aspect-video rounded-t-2xl overflow-hidden">
              <Image
                src={film.posterUrl || "/placeholder.svg"}
                alt={getLocalizedTitle(film, locale)}
                fill
                className="object-contain"
              />
              {/* Rainbow gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-purple-900/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-cyan-500/10" />
              
              {/* Floating decorative elements */}
              <div className="absolute top-4 left-4">
                <div className="flex space-x-2">
                  <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                  <Heart className="w-5 h-5 text-pink-400 animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/90 transition-all duration-300 transform hover:scale-110 border border-white/20"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Purchase Status Badge */}
          {isPurchased && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center space-x-2 backdrop-blur-sm border border-green-400/30">
              <Crown className="w-4 h-4" />
              <span>{t('movies.youOwnThisMovie')}</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-8">
          {/* Title and Meta Info */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {getLocalizedTitle(film, locale)}
                </span>
              </h1>
              
              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-300 font-medium">{film.releaseYear}</span>
                </div>
                
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <Clock className="w-4 h-4 text-green-400" />
                  <span className="text-green-300 font-medium">{film.duration} {t('movies.minutes')}</span>
                </div>
                
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-yellow-300 font-bold">{film.rating}</span>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-400/30">
                  <span className="text-purple-300 font-medium">{t(`genre.${film.genre}`)}</span>
                </div>
              </div>
            </div>

            {/* Price Section */}
            {!isPurchased && (
              <div className="lg:ml-8 mt-4 lg:mt-0">
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 rounded-2xl p-6 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <span className="text-gray-300 text-sm">{t('movies.specialPrice')}</span>
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    USD {film.price.toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Synopsis */}
          <div className="mb-8">
            <h3 className="text-white text-xl font-semibold mb-4 flex items-center">
              <Film className="w-5 h-5 mr-2 text-purple-400" />
              {movies.synopsis}
            </h3>
            <p className="text-gray-300 text-lg leading-relaxed bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              {getLocalizedSynopsis(film, locale)}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {isPurchased ? (
              <>
                {/* Play Button */}
                <button
                  onClick={handlePlay}
                  className="flex-1 flex items-center justify-center space-x-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-pink-500/25"
                >
                  <Play className="w-6 h-6" />
                  <span style={{ cursor: 'pointer' }}>{t('movies.watchNowButton')}</span>
                </button>
                
                {/* Add to Favorites */}
                <button className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  <Heart className="w-6 h-6 text-red-400" />
                  <span>{t('movies.favorite')}</span>
                </button>
              </>
            ) : (
              <>
                {/* Purchase Button */}
                <button
                  onClick={handlePurchase}
                  className="flex-1 flex items-center justify-center space-x-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
                >
                  <Crown className="w-6 h-6" />
                  <span>{t('movies.buyFor')} USD {film.price.toFixed(2)}</span>
                </button>
                
                {/* Wishlist Button */}
                {/* <button className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  <Heart className="w-6 h-6 text-pink-400" />
                  <span>Lista de Desejos</span>
                </button> */}
              </>
            )}
          </div>

          {/* Security Notice */}
          {!isPurchased && (
            <div className="mt-6 flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-xl backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span className="text-blue-300 text-sm font-medium">
                ✨ {t('movies.securePayment')}
              </span>
            </div>
          )}
        </div>

        {/* Decorative Footer */}
        <div className="px-8 pb-6">
          <div className="flex justify-center space-x-2">
            {['🎬', '🌈', '❤️', '✨', '🎭', '🏳️‍🌈', '💖', '🎪'].map((emoji, i) => (
              <span 
                key={i} 
                className="text-xl animate-pulse" 
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                {emoji}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}