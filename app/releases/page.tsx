"use client"

import { useEffect, useState } from "react"
import { getMovies, getUserPurchasedFilms } from "@/lib/movies"
import { getCurrentUser } from "@/lib/auth"
import type { Film } from "@/lib/types"
import ModernHomeContent from "@/components/modern-home-content"
import FilmModal from "@/components/film-modal"
import PaymentModal from "@/components/payment-modal"
import { Calendar, TrendingUp, Sparkles } from "lucide-react"

export default function ReleasesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [films, setFilms] = useState<Film[]>([])
  const [purchasedFilmIds, setPurchasedFilmIds] = useState<string[]>([])
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = getCurrentUser()
        const filmsData = await getMovies()
        
        if (user) {
          setUserId(user.id)
          const purchases = await getUserPurchasedFilms(user.id)
          setPurchasedFilmIds(purchases)
        }
        
        // Sort films by release year (newest first) for releases page
        const sortedFilms = filmsData.sort((a, b) => b.releaseYear - a.releaseYear)
        setFilms(sortedFilms)
      } catch (error) {
        console.error('Error loading releases data:', error)
        // Fallback to mock data
        try {
          const filmsData = await getMovies()
          const sortedFilms = filmsData.sort((a, b) => b.releaseYear - a.releaseYear)
          setFilms(sortedFilms)
        } catch (fallbackError) {
          console.error('Error loading fallback data:', fallbackError)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleFilmClick = (film: Film) => {
    setSelectedFilm(film)
    setIsModalOpen(true)
  }

  const handlePurchaseClick = (filmId: string) => {
    setIsModalOpen(false)
    setIsPaymentModalOpen(true)
  }

  const handlePlay = (film: Film) => {
    console.log("Playing film:", film.title)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center overflow-hidden pt-20">
        <div className="relative">
          <div className="absolute inset-0 w-96 h-96">
            <div className="absolute top-0 left-0 w-32 h-32 bg-pink-500/30 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-20 right-0 w-24 h-24 bg-purple-500/30 rounded-full blur-lg animate-bounce"></div>
            <div className="absolute bottom-0 left-20 w-28 h-28 bg-red-500/30 rounded-full blur-xl animate-pulse delay-300"></div>
          </div>
          
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-white text-2xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              EROS UNLIMITED
            </h2>
            <p className="text-gray-300 animate-pulse">Carregando lançamentos...</p>
          </div>
        </div>
      </div>
    )
  }

  // Get recent releases (last 2 years)
  const currentYear = new Date().getFullYear()
  const recentReleases = films.filter(film => film.releaseYear >= currentYear - 1)
  const upcomingReleases = films.filter(film => film.releaseYear > currentYear)
  const thisYearReleases = films.filter(film => film.releaseYear === currentYear)

  const isSelectedFilmPurchased = selectedFilm ? purchasedFilmIds.includes(selectedFilm.id) : false

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-pink-900/20 relative overflow-hidden pt-20">
      {/* Background Animation Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-red-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 pt-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="px-4 mb-12">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-red-400 bg-clip-text text-transparent">
                  Lançamentos
                </span>
              </h1>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Descubra os mais novos filmes e próximos lançamentos da nossa coleção exclusiva
              </p>
            </div>
          </div>

          {/* Recent Releases */}
          {recentReleases.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center space-x-3 mb-6 px-4">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-white text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Lançamentos Recentes
                </h2>
                <div className="h-1 w-16 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full" />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 px-4">
                {recentReleases.slice(0, 10).map((film) => (
                  <div key={film.id} className="cursor-pointer group" onClick={() => handleFilmClick(film)}>
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                      <img 
                        src={film.posterUrl || "/placeholder.svg"} 
                        alt={film.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="font-bold text-sm mb-1 line-clamp-1">{film.title}</h3>
                        <p className="text-xs text-gray-300">{film.releaseYear}</p>
                      </div>
                      
                      {/* Year badge */}
                      <div className="absolute top-3 right-3 bg-pink-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-bold">
                        {film.releaseYear}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* This Year Releases */}
          {thisYearReleases.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center space-x-3 mb-6 px-4">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-white text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Lançamentos de {currentYear}
                </h2>
                <div className="h-1 w-16 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full" />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 px-4">
                {thisYearReleases.slice(0, 10).map((film) => (
                  <div key={film.id} className="cursor-pointer group" onClick={() => handleFilmClick(film)}>
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                      <img 
                        src={film.posterUrl || "/placeholder.svg"} 
                        alt={film.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="font-bold text-sm mb-1 line-clamp-1">{film.title}</h3>
                        <p className="text-xs text-gray-300">{film.releaseYear}</p>
                      </div>
                      
                      {/* New badge */}
                      <div className="absolute top-3 right-3 bg-green-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center space-x-1">
                        <Sparkles className="w-3 h-3" />
                        <span>NOVO</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Films by Year */}
          <div className="mb-16">
            <div className="flex items-center space-x-3 mb-6 px-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-white text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Todos os Lançamentos
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" />
            </div>
            
            <ModernHomeContent 
              films={films}
              onFilmClick={handleFilmClick}
              purchasedFilmIds={purchasedFilmIds}
            />
          </div>
        </div>
      </div>

      {/* Film Details Modal */}
      <FilmModal
        film={selectedFilm}
        isOpen={isModalOpen}
        isPurchased={isSelectedFilmPurchased}
        onClose={() => setIsModalOpen(false)}
        onPurchase={handlePurchaseClick}
        onPlay={handlePlay}
      />

      {/* Payment Modal */}
      <PaymentModal
        film={selectedFilm}
        isOpen={isPaymentModalOpen}
        userId={userId}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={async (filmId: string) => {
          setPurchasedFilmIds(prev => [...prev, filmId])
          setIsPaymentModalOpen(false)
        }}
      />
    </div>
  )
}
