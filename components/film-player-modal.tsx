"use client"

import { useState, useRef, useEffect } from "react"
import { X, Play, Pause, Volume2, VolumeX, Star, Calendar, Clock, Maximize2, Minimize2, RotateCcw, RotateCw } from "lucide-react"
import { useMoviesTranslation, useTranslation } from "@/hooks/useTranslation"
import type { Film } from "@/lib/types"
import Image from "next/image"
import { getFilmProgress, createProgressSaver } from "@/lib/film-progress"
import { getCurrentUser } from "@/lib/auth"

interface FilmPlayerModalProps {
  film: Film
  isOpen: boolean
  onClose: () => void
  onPurchase?: () => void
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
  const [isLoadingProgress, setIsLoadingProgress] = useState(false)
  const [showContinuePrompt, setShowContinuePrompt] = useState(false)
  const [savedProgress, setSavedProgress] = useState<number | null>(null)
  const [user, setUser] = useState(getCurrentUser())
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const progressSaverRef = useRef<ReturnType<typeof createProgressSaver> | null>(null)

  const videoUrl = film.videoUrl

  // Atualiza o usuário quando houver login/logout
  useEffect(() => {
    const handleUserChange = () => {
      setUser(getCurrentUser())
    }

    window.addEventListener('user-login', handleUserChange)
    window.addEventListener('user-logout', handleUserChange)

    return () => {
      window.removeEventListener('user-login', handleUserChange)
      window.removeEventListener('user-logout', handleUserChange)
    }
  }, [])

  // Carrega o progresso salvo quando o modal abre
  useEffect(() => {
    const loadProgress = async () => {
      if (isOpen && user?.id && film.id) {
        setIsLoadingProgress(true)
        try {
          const savedTime = await getFilmProgress(user.id, film.id)
          if (savedTime && savedTime > 5) { // Só pergunta se tem mais de 5 segundos assistidos
            setSavedProgress(savedTime)
            setShowContinuePrompt(true)
          }
        } catch (error) {
          // console.error('Error loading progress:', error)
        } finally {
          setIsLoadingProgress(false)
        }
      }
    }

    loadProgress()
  }, [isOpen, user?.id, film.id])

  // Aplica o progresso salvo ao vídeo quando ele carrega
  const handleContinueWatching = (continueFromSaved: boolean) => {
    setShowContinuePrompt(false)
    if (continueFromSaved && savedProgress && videoRef.current) {
      const applyProgress = () => {
        if (videoRef.current && videoRef.current.duration > 0) {
          videoRef.current.currentTime = savedProgress
          setCurrentTime(savedProgress)
        }
      }

      if (videoRef.current.duration > 0) {
        applyProgress()
      } else {
        videoRef.current.addEventListener('loadedmetadata', applyProgress, { once: true })
      }
    }
    setSavedProgress(null)
  }

  // Cria o progressSaver apenas quando a modal abre
  useEffect(() => {
    if (isOpen && user?.id && film.id && !showContinuePrompt) {
      progressSaverRef.current = createProgressSaver(user.id, film.id)
      return () => {
        // Salva o progresso final ao fechar
        if (progressSaverRef.current && videoRef.current) {
          progressSaverRef.current.saveNow(videoRef.current.currentTime)
          progressSaverRef.current = null
        }
      }
    }
  }, [isOpen, user?.id, film.id, showContinuePrompt])

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

  // Remove autoplay: não inicia automaticamente ao abrir modal
  useEffect(() => {
    if (isOpen && videoRef.current && videoUrl && !showContinuePrompt) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }, [isOpen, videoUrl, showContinuePrompt])

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

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

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
        case 'ArrowLeft':
          e.preventDefault()
          skipSeconds(-10)
          break
        case 'ArrowRight':
          e.preventDefault()
          skipSeconds(10)
          break
        case 'f':
        case 'F':
          handleFullscreen()
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

  const handleVideoAreaClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const target = e.target as HTMLElement
    if (
      target.tagName === 'BUTTON' ||
      target.closest('button')
    ) return
    setShowControls(prev => !prev)
    if (!showControls) {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    } else {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
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

  const skipSeconds = (sec: number) => {
    if (videoRef.current) {
      let newTime = videoRef.current.currentTime + sec
      if (newTime < 0) newTime = 0
      if (newTime > duration) newTime = duration
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
      // Salva o progresso ao pular (só se o usuário estiver logado)
      if (user?.id) {
        progressSaverRef.current?.saveNow(newTime)
      }
    }
  }

  const handleClose = () => {
    // Salva o progresso final antes de fechar (só se o usuário estiver logado)
    if (videoRef.current && progressSaverRef.current && user?.id) {
      progressSaverRef.current.saveNow(videoRef.current.currentTime)
    }
    
    if (videoRef.current) {
      videoRef.current.pause()
    }
    setIsPlaying(false)
    setShowContinuePrompt(false)
    setSavedProgress(null)
    onClose()
  }

  if (!isOpen) return null

  // Calcula a porcentagem assistida
  const watchedPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full min-h-full flex items-center justify-center p-4"
        onMouseMove={handleMouseMove}
      >
        <button
          onClick={handleClose}
          className={`absolute top-6 right-6 z-20 bg-black/60 backdrop-blur-sm rounded-full p-3 border border-white/20 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <div className="w-full max-w-7xl mx-auto py-12">
          {/* Continue Watching Prompt */}
          {showContinuePrompt && savedProgress && (
            <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-gray-900 rounded-lg p-8 max-w-md border border-purple-500/30">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Continuar assistindo?
                </h3>
                <p className="text-gray-300 mb-6">
                  Você parou em {formatTime(savedProgress)}. Deseja continuar de onde parou?
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleContinueWatching(true)}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors"
                  >
                    Continuar de {formatTime(savedProgress)}
                  </button>
                  <button
                    onClick={() => handleContinueWatching(false)}
                    className="flex-1 bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Começar do início
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading Progress Indicator */}
          {isLoadingProgress && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-lg px-6 py-3 z-10">
              <p className="text-white text-sm animate-pulse">Carregando progresso...</p>
            </div>
          )}

          {/* Aviso para usuário não logado */}
          {!user && isOpen && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-yellow-600/20 backdrop-blur-sm rounded-lg px-6 py-3 z-10 border border-yellow-500/30">
              <p className="text-yellow-200 text-sm">
                Faça login para salvar seu progresso
              </p>
            </div>
          )}

          <div
            ref={playerContainerRef}
            className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-2xl"
            onClick={handleVideoAreaClick}
            onMouseMove={handleMouseMove}
            role="presentation"
            tabIndex={-1}
            style={{ touchAction: 'manipulation' }}
          >
            {videoUrl ? (
              <>
                <video 
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  muted={isMuted}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => {
                    setIsPlaying(false)
                    // Salva como 100% assistido quando terminar (só se logado)
                    if (user?.id) {
                      progressSaverRef.current?.saveNow(duration)
                    }
                  }}
                  onClick={togglePlayPause}
                >
                  <source src={videoUrl} type="video/mp4" />
                </video>

                <div className={`absolute inset-0 transition-opacity duration-300 ${
                  showControls ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center">
                    <button
                      onClick={() => skipSeconds(-10)}
                      className="p-4 bg-black/70 rounded-full backdrop-blur-sm hover:bg-black/80 transition-colors mr-16"
                      aria-label="Voltar 10 segundos"
                    >
                      <RotateCcw className="w-8 h-8 text-white" />
                    </button>
                    <button
                      onClick={togglePlayPause}
                      className="p-4 bg-black/70 rounded-full backdrop-blur-sm hover:bg-black/80 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-8 h-8 text-white" />
                      ) : (
                        <Play className="w-8 h-8 text-white ml-1" />
                      )}
                    </button>
                    <button
                      onClick={() => skipSeconds(10)}
                      className="p-4 bg-black/70 rounded-full backdrop-blur-sm hover:bg-black/80 transition-colors ml-16"
                      aria-label="Avançar 10 segundos"
                    >
                      <RotateCw className="w-8 h-8 text-white" />
                    </button>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <div className="flex items-center justify-between w-full">
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

                      <div className="flex items-center space-x-4 flex-1 mx-6">
                        <span className="text-white text-xs font-mono min-w-[40px]">{formatTime(currentTime)}</span>
                        <div className="relative flex-1 group">
                          <div className="relative w-full h-2 bg-gray-700 rounded-lg overflow-visible">
                            <div 
                              className="absolute left-0 top-0 h-full bg-pink-500 rounded-lg transition-all duration-100"
                              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                            />
                            <div 
                              className="absolute top-1/2 w-4 h-4 bg-pink-500 rounded-full shadow-lg transition-all duration-100 hover:scale-125 group-hover:scale-125"
                              style={{ 
                                left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                                transform: 'translate(-50%, -50%)'
                              }}
                            >
                              <div className="absolute inset-1 bg-white rounded-full opacity-30" />
                            </div>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={duration || 0}
                            step={0.1}
                            value={currentTime}
                            onChange={e => {
                              const time = Number(e.target.value)
                              setCurrentTime(time)
                              if (videoRef.current) {
                                videoRef.current.currentTime = time
                                // Salva o progresso ao mover manualmente (só se logado)
                                if (user?.id) {
                                  progressSaverRef.current?.saveNow(time)
                                }
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            style={{
                              background: 'transparent',
                              WebkitAppearance: 'none',
                              appearance: 'none',
                            }}
                          />
                        </div>
                        <span className="text-white text-xs font-mono min-w-[40px]">{formatTime(duration)}</span>
                      </div>

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

              <div className="lg:col-span-2 space-y-4">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {film.title}
                  </h2>
                  
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