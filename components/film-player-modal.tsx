"use client"

import { useState, useRef, useEffect } from "react"
import { X, Play, Pause, Volume2, VolumeX, ShoppingBag, Star, Calendar, Clock, Maximize2, Minimize2 } from "lucide-react"
import { useMoviesTranslation, useTranslation } from "@/hooks/useTranslation"
import type { Film } from "@/lib/types"
import Image from "next/image"


interface FilmPlayerModalProps {
  film: Film
  isOpen: boolean
  onClose: () => void
  onPurchase?: () => void // Função de compra opcional
}

export default function FilmPlayerModal({ 
  film, 
  isOpen, 
  onClose, 
  onPurchase 
}: FilmPlayerModalProps) {
  const movies = useMoviesTranslation()
  const { t } = useTranslation()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Sempre carrega o filme completo
  const videoUrl = film.videoUrl
  console.log("Video URL:", videoUrl)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && videoRef.current && videoUrl) {
      videoRef.current.play().catch(() => {
        setIsPlaying(false)
      })
      setIsPlaying(true)
    }
  }, [isOpen, videoUrl])

  // Atualiza tempo e duração
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)
    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', updateDuration)
    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', updateDuration)
    }
  }, [videoUrl, isOpen])

  // Fullscreen
  // Referência para o container do player
  const playerContainerRef = useRef<HTMLDivElement>(null)

  const handleFullscreen = () => {
    const videoContainer = playerContainerRef.current
    if (!videoContainer) return
    if (!isFullscreen) {
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen()
      }
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

  // Atualiza estado ao sair da tela cheia
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  // Formata tempo mm:ss
  const formatTime = (sec: number) => {
    if (isNaN(sec)) return '00:00'
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case ' ':
          e.preventDefault()
          togglePlayPause()
          break
        case 'm':
        case 'M':
          toggleMute()
          break
      }
    }
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isOpen])

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
    setIsPlaying(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm overflow-y-auto">
      {/* Modal Container */}
      <div 
        className="relative w-full min-h-full flex items-center justify-center p-4"
        onMouseMove={handleMouseMove}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className={`absolute top-6 right-6 z-20 bg-black/60 backdrop-blur-sm rounded-full p-3 border border-white/20 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Main Content */}
        <div className="w-full max-w-7xl mx-auto py-12">
          {/* Video Player */}
          <div ref={playerContainerRef} className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
            {videoUrl ? (
              <>
                <video 
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  muted={isMuted}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  onClick={togglePlayPause}
                >
                  <source src={videoUrl} type="video/mp4" />
                </video>

                {/* Video Controls Overlay */}
                <div className={`absolute inset-0 transition-opacity duration-300 ${
                  showControls ? 'opacity-100' : 'opacity-0'
                }`}>
                  {/* Center Play/Pause Button */}
                  <button
                    onClick={togglePlayPause}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 bg-black/70 rounded-full backdrop-blur-sm hover:bg-black/80 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white ml-1" />
                    )}
                  </button>

                  {/* Bottom Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <div className="flex items-center justify-between w-full">
                      {/* Left Controls */}
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={togglePlayPause}
                          className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5 text-white" />
                          ) : (
                            <Play className="w-5 h-5 text-white ml-0.5" />
                          )}
                        </button>

                        <button
                          onClick={toggleMute}
                          className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                          {isMuted ? (
                            <VolumeX className="w-5 h-5 text-white" />
                          ) : (
                            <Volume2 className="w-5 h-5 text-white" />
                          )}
                        </button>
                      </div>

                      {/* Progress Bar + Time */}
                      <div className="flex items-center space-x-4 flex-1 mx-6">
                        <span className="text-white text-xs font-mono min-w-[40px]">{formatTime(currentTime)}</span>
                        <input
                          type="range"
                          min={0}
                          max={duration || 0}
                          step={0.1}
                          value={currentTime}
                          onChange={e => {
                            const time = Number(e.target.value)
                            setCurrentTime(time)
                            if (videoRef.current) videoRef.current.currentTime = time
                          }}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none accent-pink-500"
                        />
                        <span className="text-white text-xs font-mono min-w-[40px]">{formatTime(duration)}</span>
                      </div>

                      {/* Fullscreen */}
                      <div className="flex items-center">
                        <button
                          onClick={handleFullscreen}
                          className="p-2 hover:bg-white/20 rounded-full transition-colors"
                          aria-label="Tela cheia"
                        >
                          {isFullscreen ? (
                            <Minimize2 className="w-5 h-5 text-white" />
                          ) : (
                            <Maximize2 className="w-5 h-5 text-white" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Fallback when no video URL */
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <div className="text-center text-white">
                  <Play className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg">{t('movies.noVideoAvailable')}</p>
                </div>
              </div>
            )}
          </div>

          {/* Film Information Panel */}
          <div className="mt-6 bg-black/60 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Poster */}
              <div className="lg:col-span-1">
                <div className="relative aspect-[2/3] max-w-xs mx-auto lg:mx-0">
                  <Image
                    src={film.posterUrl || "/placeholder.svg"}
                    alt={film.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              </div>

              {/* Film Details */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {film.title}
                  </h2>
                  
                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-4">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>{film.rating}</span>
                    </div>
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
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{t('movies.synopsis')}</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {film.synopsis}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}