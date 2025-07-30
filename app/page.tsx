"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { initializeAuth, getCurrentUser } from "@/lib/auth"
import { getMovies, getUserPurchasedFilms, purchaseFilm } from "@/lib/movies"
import type { Film } from "@/lib/types"
import HeroSection from "@/components/hero-section"
import HomeContent from "@/components/home-content"
import FilmModal from "@/components/film-modal"
import PaymentModal from "@/components/payment-modal"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [heroFilm, setHeroFilm] = useState<Film | null>(null)
  const [purchasedFilmIds, setPurchasedFilmIds] = useState<string[]>([])
  const [userId, setUserId] = useState('')
  const router = useRouter()

  useEffect(() => {
    const initApp = async () => {
      try {
        // Check authentication
        const user = await initializeAuth()
        if (!user) {
          router.push("/login")
          return
        }

        setUserId(user.id)

        // Load films and user purchases
        const [films, purchases] = await Promise.all([
          getMovies(),
          getUserPurchasedFilms(user.id)
        ])

        if (films.length > 0) {
          setHeroFilm(films[0]) // Use first film as hero
        }

        setPurchasedFilmIds(purchases)
      } catch (error) {
        console.error('Error initializing app:', error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    initApp()
  }, [router])

  const handleFilmClick = (film: Film) => {
    setSelectedFilm(film)
    setIsModalOpen(true)
  }

  const handleHeroPlay = () => {
    if (heroFilm) {
      setSelectedFilm(heroFilm)
      setIsModalOpen(true)
    }
  }

  const handlePurchaseClick = (filmId: string) => {
    // Close film modal and open payment modal
    setIsModalOpen(false)
    setIsPaymentModalOpen(true)
  }

  const handlePaymentSuccess = async (filmId: string) => {
    const user = getCurrentUser()
    if (!user) return

    try {
      const success = await purchaseFilm(user.id, filmId)
      if (success) {
        setPurchasedFilmIds(prev => [...prev, filmId])
        setIsPaymentModalOpen(false)
        
        // Show success message
        console.log('Film purchased successfully!')
        
        // Optional: Show a success toast/notification here
      } else {
        console.error('Failed to purchase film')
      }
    } catch (error) {
      console.error('Error purchasing film:', error)
    }
  }

  const handlePlay = (film: Film) => {
    // This would typically open a video player
    console.log("Playing film:", film.title)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  if (!heroFilm) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Nenhum filme disponível</div>
      </div>
    )
  }

  // Check if selected film is purchased
  const isSelectedFilmPurchased = selectedFilm ? purchasedFilmIds.includes(selectedFilm.id) : false

  return (
    <div className="min-h-screen bg-black">
      <HeroSection film={heroFilm} onPlayClick={handleHeroPlay} />
      <HomeContent 
        onFilmClick={handleFilmClick}
        purchasedFilmIds={purchasedFilmIds}
      />

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
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  )
}