"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getUserPurchasedFilms, getMovies } from "@/lib/movies"
import { useUserProfileTranslation } from "@/hooks/useTranslation"
import type { Film } from "@/lib/types"
import { 
  User, 
  Crown, 
  Heart, 
  Star, 
  Film as FilmIcon, 
  Calendar, 
  Clock, 
  Sparkles, 
  Rainbow,
  Mail,
  Award,
  PlayCircle,
  TrendingUp,
  Gift
} from "lucide-react"
import Image from "next/image"

interface UserData {
  id: string
  name: string
  email: string
  role: 'CLIENT' | 'ADMIN'
  created_at: string
}

export default function UserProfile() {
  const params = useParams()
  const profileT = useUserProfileTranslation()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [purchasedFilms, setPurchasedFilms] = useState<Film[]>([])
  const [purchasedFilmIds, setPurchasedFilmIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = getCurrentUser()
        if (!user) {
          setError(profileT.userNotFound)
          return
        }

        // Ensure created_at is a string
        const userWithCreatedAt = {
          ...user,
          created_at: user.created_at || new Date().toISOString()
        }

        setUserData(userWithCreatedAt)

        // Load purchased films
        const [purchased, allFilms] = await Promise.all([
          getUserPurchasedFilms(user.id),
          getMovies()
        ])

        setPurchasedFilmIds(purchased)
        
        // Filter films that user has purchased
        const userFilms = allFilms.filter(film => purchased.includes(film.id))
        setPurchasedFilms(userFilms)

      } catch (error) {
        console.error('Error loading user data:', error)
        setError(profileT.errorLoadingData)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [params])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-white text-2xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            {profileT.loading}
          </h2>
        </div>
      </div>
    )
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-red-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-16 h-16 text-red-400" />
          </div>
          <h2 className="text-white text-2xl font-bold mb-2">{profileT.loadError}</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  const totalSpent = purchasedFilms.reduce((sum, film) => sum + film.price, 0)
  const averageRating = purchasedFilms.length > 0 
    ? purchasedFilms.reduce((sum, film) => sum + film.rating, 0) / purchasedFilms.length 
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Rainbow gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-orange-500/5 via-yellow-500/5 via-green-500/5 via-blue-500/5 via-indigo-500/5 to-purple-500/5 animate-pulse"></div>
        
        {/* Floating elements */}
        {[...Array(30)].map((_, i) => (
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
            {i % 5 === 0 ? (
              <Heart className="w-4 h-4 text-pink-400/40" />
            ) : i % 5 === 1 ? (
              <Star className="w-3 h-3 text-yellow-400/40" />
            ) : i % 5 === 2 ? (
              <Sparkles className="w-3 h-3 text-cyan-400/40" />
            ) : i % 5 === 3 ? (
              <FilmIcon className="w-3 h-3 text-purple-400/40" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 opacity-40" />
            )}
          </div>
        ))}

        {/* Large decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-br from-pink-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen p-6 pt-24">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Section */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-8 mb-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
              
              {/* Avatar Section */}
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl">
                  <User className="w-16 h-16 text-white" />
                </div>
                
                {/* Role Badge */}
                <div className="absolute -bottom-2 -right-2">
                  {userData.role === 'ADMIN' ? (
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-2 rounded-full shadow-lg">
                      <Crown className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2 rounded-full shadow-lg">
                      <Heart className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Rainbow ring */}
                <div className="absolute -inset-2 bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-4xl lg:text-5xl font-bold mb-3">
                  <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    {userData.name}
                  </span>
                </h1>
                
                <div className="flex items-center justify-center lg:justify-start space-x-2 mb-4">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{userData.email}</span>
                </div>

                <div className="flex items-center justify-center lg:justify-start space-x-4 mb-6">
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-300 text-sm">
                      {profileT.memberSince} {new Date(userData.created_at).getFullYear()}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                    {userData.role === 'ADMIN' ? (
                      <>
                        <Crown className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-300 text-sm font-medium">{profileT.administrator}</span>
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-300 text-sm font-medium">{profileT.premiumMember}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Pride Message */}
                <div className="flex items-center justify-center lg:justify-start space-x-2">
                  <Rainbow className="w-5 h-5 text-yellow-400 animate-pulse" />
                  <span className="text-gray-300 text-sm italic">
                    {profileT.prideMessage}
                  </span>
                  <Heart className="w-4 h-4 text-pink-400 animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Films */}
            <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-sm border border-pink-400/30 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FilmIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{purchasedFilms.length}</div>
              <div className="text-pink-300 text-sm">{profileT.stats.filmsAcquired}</div>
            </div>

            {/* Total Spent */}
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">USD {totalSpent.toFixed(2)}</div>
              <div className="text-green-300 text-sm">{profileT.stats.totalInvested}</div>
            </div>

            {/* Average Rating */}
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{averageRating.toFixed(1)}</div>
              <div className="text-yellow-300 text-sm">{profileT.stats.averageRating}</div>
            </div>

            {/* Watch Time */}
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-400/30 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {Math.floor(purchasedFilms.reduce((sum, film) => sum + film.duration, 0) / 60)}h
              </div>
              <div className="text-blue-300 text-sm">{profileT.stats.contentTime}</div>
            </div>
          </div>

          {/* Films Collection */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <PlayCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white text-2xl font-bold">
                    <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {profileT.collection.title}
                    </span>
                  </h2>
                  <p className="text-gray-400 text-sm">{profileT.collection.subtitle}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-4 py-2 rounded-full border border-purple-400/30">
                <Award className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300 text-sm font-medium">
                  {purchasedFilms.length} {purchasedFilms.length === 1 ? profileT.collection.filmCount : profileT.collection.filmsCount}
                </span>
              </div>
            </div>

            {purchasedFilms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {purchasedFilms.map((film) => (
                  <div key={film.id} className="group relative">
                    <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-lg transition-all duration-300 group-hover:scale-105">
                      <Image
                        src={film.posterUrl || "/placeholder.svg"}
                        alt={film.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Owned badge */}
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                        <Crown className="w-3 h-3" />
                        <span>{profileT.collection.owned}</span>
                      </div>

                      {/* Film info overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-white font-bold text-sm mb-2 line-clamp-2">{film.title}</h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-yellow-300 text-xs">{film.rating}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-300 text-xs">{film.duration}min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FilmIcon className="w-12 h-12 text-purple-400" />
                </div>
                <h3 className="text-white text-xl font-bold mb-2">{profileT.collection.noFilms}</h3>
                <p className="text-gray-400 mb-6">{profileT.collection.noFilmsDescription}</p>
                <button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105">
                  {profileT.collection.exploreFilms}
                </button>
              </div>
            )}
          </div>

          {/* Footer Pride Message */}
          <div className="text-center mt-8">
            <div className="flex justify-center space-x-1 mb-3">
              {['🏳️‍🌈', '🏳️‍⚧️', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎'].map((emoji, i) => (
                <span key={i} className="text-xl animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>
                  {emoji}
                </span>
              ))}
            </div>
            <p className="text-gray-300 text-sm">
              {profileT.footerMessage}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}