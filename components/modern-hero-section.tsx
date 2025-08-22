"use client"

import { useState, useEffect } from "react"
import { Play, Plus, Info, Star, Clock, Calendar, Sparkles, ShoppingBag} from "lucide-react"
import { useMoviesTranslation, useTranslation } from "@/hooks/useTranslation"
import type { Film } from "@/lib/types"
import { getCurrentUser } from "@/lib/auth"
import Image from "next/image"

interface ModernHeroSectionProps {
  film: Film
  onPlayClick: () => void
  onAdminClick?: () => void
}

export default function ModernHeroSection({ film, onPlayClick, onAdminClick }: ModernHeroSectionProps) {
  const movies = useMoviesTranslation()
  const { t } = useTranslation()
  const [showVideo, setShowVideo] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Check if user is admin
    const user = getCurrentUser()
    setIsAdmin(user?.role === 'ADMIN')

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    // Video autoplay logic with longer delay
    const videoTimer = setTimeout(() => {
      setShowVideo(true)
      setTimeout(() => setShowVideo(false), 8000)
    }, 3000)

    return () => {
      clearInterval(timer)
      clearTimeout(videoTimer)
    }
  }, [])

  const handleAdminAction = () => {
    if (onAdminClick) {
      onAdminClick()
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background with enhanced visuals */}
      <div className="absolute inset-0">
        {showVideo && film.trailerUrl ? (
          <div className="relative w-full h-full">
            <video 
              autoPlay 
              muted 
              className="w-full h-full object-cover" 
              onEnded={() => setShowVideo(false)}
            >
              <source src={film.trailerUrl} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
          </div>
        ) : (
          <div className="relative w-full h-full">
            <Image 
              src={film.posterUrl || "/placeholder.svg"} 
              alt={film.title} 
              fill 
              className="object-cover" 
              priority 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          </div>
        )}
      </div>

      {/* Animated overlay elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-red-500/10 rounded-full blur-xl animate-bounce" />
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-transparent to-black/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex items-center min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left side - Film Info */}
            <div className="space-y-8">
              {/* Featured Badge */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm border border-pink-500/30 rounded-full px-4 py-2">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <span className="text-pink-400 font-semibold text-sm">{t('movies.featured')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-yellow-400 font-bold">{film.rating}</span>
                </div>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
                  <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-red-400 bg-clip-text text-transparent">
                    {film.title}
                  </span>
                </h1>
                
                {/* Meta info */}
                <div className="flex flex-wrap items-center space-x-6 text-gray-300 mb-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span>{film.releaseYear}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-pink-400" />
                    <span>{film.duration} {t('movies.minutes')}</span>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-3 py-1 rounded-full border border-purple-500/30">
                    <span className="text-purple-300 font-medium">{film.genre}</span>
                  </div>
                </div>
              </div>

              {/* Synopsis */}
              <div className="max-w-2xl">
                <p className="text-lg text-gray-300 leading-relaxed mb-8 text-justify">
                  {film.synopsis}
                </p>
                
                {/* Price */}
                <div className="flex items-center space-x-4 mb-8">
                  <span className="text-gray-400">{t('movies.startingFrom')}</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    USD {film.price.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  style={{ cursor: 'pointer' }}
                  onClick={onPlayClick}
                  className="group flex items-center space-x-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-xl font-bold hover:from-pink-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-pink-500/25"
                >
                  <ShoppingBag className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span>{movies.buy}</span>
                </button>

                {/* <button style={ { cursor: 'pointer'}} className="group flex items-center space-x-3 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-all duration-300 border border-white/20">
                  <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                  <span>Minha Lista</span>
                </button> */}

                {/* <button style={{ cursor: 'pointer' }} className="group flex items-center space-x-3 bg-gray-800/50 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-700/50 transition-all duration-300 border border-gray-600/30">
                  <Info className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span>Mais Info</span>
                </button> */}

                {/* Admin Button */}
                {isAdmin && (
                  <button 
                    onClick={handleAdminAction}
                    className="group flex items-center space-x-3 bg-gradient-to-r from-red-500/80 to-orange-500/80 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold hover:from-red-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 border border-red-500/30"
                  >
                    <Plus className="w-6 h-6 group-hover:rotate-45 transition-transform" />
                    <span>{movies.addNewMovie}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right side - Enhanced Visual Elements */}
            <div className="relative lg:block hidden">
              <div className="relative">
                {/* Main poster with enhanced effects */}
                <div className="relative w-96 aspect-[2/3] mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl blur-xl animate-pulse" />
                  <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-pink-500/30 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                    <Image
                      src={film.posterUrl || "/placeholder.svg"}
                      alt={film.title}
                      fill
                      className="object-contain"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-bounce">
                  <Star className="w-8 h-8 text-white fill-current" />
                </div>

                <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-pink-500/90 to-purple-500/90 backdrop-blur-sm rounded-xl p-4 border border-pink-500/30">
                  <div className="text-white text-center">
                    <div className="text-2xl font-bold">{film.rating}</div>
                    <div className="text-xs text-gray-200">{t('movies.evaluation')}</div>
                  </div>
                </div>

                {/* Time display */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-gray-600/30">
                  <div className="text-white text-sm font-medium">
                    {currentTime.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>

              {/* Background decorative elements */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] -z-10">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-red-500/5 rounded-full blur-3xl animate-spin-slow" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse" />
          </div>
          <span className="text-white/70 text-sm font-medium">{t('movies.scrollToExplore')}</span>
        </div>
      </div>
    </div>
  )
}