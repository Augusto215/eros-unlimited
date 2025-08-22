"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Play, Film as FilmIcon, User } from "lucide-react"
import { initializeAuth, getCurrentUser } from "@/lib/auth"
import { getMovies, getUserPurchasedFilms } from "@/lib/movies"
import { useMyMoviesTranslation } from "@/hooks/useTranslation"
import type { Film } from "@/lib/types"

export default function MyMovies() {
  const router = useRouter()
  const t = useMyMoviesTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [films, setFilms] = useState<Film[]>([])
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const initApp = async () => {
      try {
        await initializeAuth()
        const user = getCurrentUser()
        
        if (!user) {
          // Redirect to login if not authenticated
          router.push('/')
          return
        }

        setUserId(user.id)
        
        // Load all films and user purchases
        const [allFilms, purchases] = await Promise.all([
          getMovies(),
          getUserPurchasedFilms(user.id)
        ])
        
        // Filter only purchased films
        const purchasedFilms = allFilms.filter(film => 
          purchases.includes(film.id)
        )
        
        setFilms(purchasedFilms)
        
      } catch (error) {
        console.error('Error loading user movies:', error)
        // Redirect to home on error
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }

    initApp()
  }, [router])

  const handleFilmClick = (film: Film) => {
    // Since all films here are purchased, go directly to play
    handlePlay(film)
  }

  const handlePlay = (film: Film) => {
    // Since all films here are purchased, go directly to play
    if (film.videoUrl) {
      window.open(film.videoUrl, '_blank')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 flex items-center justify-center">
        <div className="flex items-center space-x-4 text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <span className="text-xl">{t.loading}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900">
      {/* Header */}
      <div className="container mx-auto px-4 pt-8 pb-12">
        <div className="mb-8 pt-14">
          <div className="px-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center">
              <User className="w-8 h-8 mr-3 text-pink-400" />
              {t.title}
            </h1>
            <p className="text-white/70 text-lg">
              {films.length > 0 
                ? `${films.length} ${films.length === 1 ? t.filmCount.singular : t.filmCount.plural}`
                : t.noFilms
              }
            </p>
          </div>
        </div>

        {/* Films Grid */}
        {films.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {films.map((film) => (
              <div
                key={film.id}
                className="group relative cursor-pointer transform transition-all duration-300 hover:scale-105"
                onClick={() => handleFilmClick(film)}
              >
                {/* Poster */}
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-800 shadow-lg border border-white/10">
                  {film.posterUrl ? (
                    <img
                      src={film.posterUrl}
                      alt={film.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                      <FilmIcon className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Hover Overlay with Play Button */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePlay(film)
                      }}
                      className="flex items-center justify-center w-16 h-16 bg-pink-500 hover:bg-pink-600 rounded-full transform transition-all duration-300 hover:scale-110 shadow-lg"
                      aria-label={t.playButton}
                    >
                      <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                    </button>
                  </div>

                  {/* Film Title on Hover */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-white font-semibold text-sm line-clamp-2">
                      {film.title}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-8 mb-6 border border-white/20">
              <FilmIcon className="w-16 h-16 text-white/60" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              {t.empty.title}
            </h2>
            <p className="text-white/70 text-center mb-8 max-w-md">
              {t.empty.description}
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-xl font-bold hover:from-pink-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {t.empty.exploreButton}
            </button>
          </div>
        )}
      </div>

      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-purple-900/20" />
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/5 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 1}px`,
                height: `${Math.random() * 4 + 1}px`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}