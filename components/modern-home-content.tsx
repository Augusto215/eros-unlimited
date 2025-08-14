"use client"

import { useState, useRef } from "react"
import { ChevronLeft, ChevronRight, Play, Star, Clock, ShoppingBag, Crown, TrendingUp, Film as FilmIcon, Sparkles } from "lucide-react"
import type { Film } from "@/lib/types"
import Image from "next/image"

interface ModernHomeContentProps {
  films: Film[]
  onFilmClick: (film: Film) => void
  purchasedFilmIds: string[]
}

interface FilmRowProps {
  title: string
  films: Film[]
  purchasedFilmIds: string[]
  onFilmClick: (film: Film) => void
  icon?: React.ReactNode
  accentColor?: string
}

function ModernFilmCard({ film, isPurchased, onFilmClick }: {
  film: Film
  isPurchased: boolean
  onFilmClick: (film: Film) => void
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative group cursor-pointer transition-all duration-500 hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onFilmClick(film)}
    >
      <div className="relative aspect-[2/3] w-56 rounded-xl overflow-hidden shadow-lg">
        {/* Main image */}
        <Image 
          src={film.posterUrl || "/placeholder.svg"} 
          alt={film.title} 
          fill 
          className="object-cover transition-transform duration-500 group-hover:scale-110" 
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Purchase status badge */}
        {isPurchased && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
            <Crown className="w-3 h-3" />
            <span>POSSUI</span>
          </div>
        )}

        {/* Rating badge */}
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center space-x-1">
          <Star className="w-3 h-3 text-yellow-400 fill-current" />
          <span>{film.rating}</span>
        </div>

        {/* Hover overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-4 transition-opacity duration-300">
            {/* Film info */}
            <div className="space-y-3">
              <h3 className="text-white font-bold text-lg line-clamp-2 leading-tight">
                {film.title}
              </h3>
              
              <div className="flex items-center space-x-3 text-sm">
                <span className="text-purple-300 font-medium">{film.genre}</span>
                <div className="flex items-center space-x-1 text-gray-300">
                  <Clock className="w-3 h-3" />
                  <span>{film.duration}min</span>
                </div>
              </div>

              <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed">
                {film.synopsis}
              </p>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                    <Play className="w-4 h-4 text-white" />
                  </button>
                  <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                    <ShoppingBag className="w-4 h-4 text-white" />
                  </button>
                </div>

                {!isPurchased && (
                  <div className="text-right">
                    <div className="text-green-400 font-bold text-lg">
                      R$ {film.price.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ModernFilmRow({ title, films, purchasedFilmIds, onFilmClick, icon, accentColor = "pink" }: FilmRowProps) {
  const [scrollPosition, setScrollPosition] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400
      const newPosition = direction === "left" 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount
      
      scrollContainerRef.current.scrollTo({
        left: newPosition,
        behavior: "smooth",
      })
      setScrollPosition(newPosition)
    }
  }

  const accentColors = {
    pink: "from-pink-400 to-purple-400",
    green: "from-green-400 to-emerald-400", 
    blue: "from-blue-400 to-cyan-400",
    orange: "from-orange-400 to-red-400"
  }

  return (
    <div className="mb-12">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6 px-4">
        <div className="flex items-center space-x-3">
          {icon && (
            <div className={`w-8 h-8 bg-gradient-to-r ${accentColors[accentColor as keyof typeof accentColors]} rounded-lg flex items-center justify-center`}>
              {icon}
            </div>
          )}
          <h2 className={`text-white text-2xl font-bold bg-gradient-to-r ${accentColors[accentColor as keyof typeof accentColors]} bg-clip-text text-transparent`}>
            {title}
          </h2>
          <div className={`h-1 w-16 bg-gradient-to-r ${accentColors[accentColor as keyof typeof accentColors]} rounded-full`} />
        </div>
        
        <button className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
          Ver todos
        </button>
      </div>

      {/* Films container */}
      <div className="relative group px-4">
        {/* Navigation buttons */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 backdrop-blur-sm text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/90 hover:scale-110"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 backdrop-blur-sm text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/90 hover:scale-110"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Films scroll container */}
        <div
          ref={scrollContainerRef}
          className="flex space-x-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {films.map((film) => (
            <ModernFilmCard
              key={film.id}
              film={film}
              isPurchased={purchasedFilmIds.includes(film.id)}
              onFilmClick={onFilmClick}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ModernHomeContent({ films, onFilmClick, purchasedFilmIds }: ModernHomeContentProps) {
  if (films.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-pink-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <FilmIcon className="w-16 h-16 text-pink-400" />
          </div>
          <h2 className="text-white text-2xl font-bold mb-2">Biblioteca em Construção</h2>
          <p className="text-gray-400">Nenhum filme disponível no momento</p>
        </div>
      </div>
    )
  }

  const purchasedFilms = films.filter((film) => purchasedFilmIds.includes(film.id))
  const availableFilms = films.filter((film) => !purchasedFilmIds.includes(film.id))
  const recommendedFilms = films.slice(0, 6) // Primeiros 6 filmes como recomendados

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/10 to-pink-900/10 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-2/3 left-1/2 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 pt-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="px-4 mb-12">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-red-400 bg-clip-text text-transparent">
                  Catálogo EROS
                </span>
              </h1>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Descubra uma seleção exclusiva de filmes premium para uma experiência cinematográfica única
              </p>
            </div>
          </div>

          {/* Purchased Films Section - Only show if user has purchased films */}
          {purchasedFilms.length > 0 && (
            <ModernFilmRow
              title="Meus Filmes"
              films={purchasedFilms}
              purchasedFilmIds={purchasedFilmIds}
              onFilmClick={onFilmClick}
              icon={<Crown className="w-4 h-4 text-white" />}
              accentColor="green"
            />
          )}

          {/* Available Films Section - Show all films if no purchases, or only available if user has purchases */}
          {(purchasedFilms.length === 0 ? films : availableFilms).length > 0 && (
            <ModernFilmRow
              title={purchasedFilms.length === 0 ? "Catálogo de Filmes" : "Filmes Disponíveis"}
              films={purchasedFilms.length === 0 ? films : availableFilms}
              purchasedFilmIds={purchasedFilmIds}
              onFilmClick={onFilmClick}
              icon={<ShoppingBag className="w-4 h-4 text-white" />}
              accentColor="blue"
            />
          )}

          {/* Recommended Section - Only show if there are enough films and user has purchases */}
          {recommendedFilms.length > 3 && purchasedFilms.length > 0 && (
            <ModernFilmRow
              title="Recomendados para Você"
              films={recommendedFilms}
              purchasedFilmIds={purchasedFilmIds}
              onFilmClick={onFilmClick}
              icon={<Sparkles className="w-4 h-4 text-white" />}
              accentColor="orange"
            />
          )}

          {/* Trending Section - Only show if there are enough films and user has purchases */}
          {films.length > 4 && purchasedFilms.length > 0 && (
            <ModernFilmRow
              title="Em Alta"
              films={films.slice(1, 7)} // Filmes do índice 1 ao 6
              purchasedFilmIds={purchasedFilmIds}
              onFilmClick={onFilmClick}
              icon={<TrendingUp className="w-4 h-4 text-white" />}
              accentColor="pink"
            />
          )}
        </div>
      </div>

      {/* Floating action elements */}
      <div className="fixed bottom-8 right-8 z-20">
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-full p-4 shadow-lg hover:shadow-pink-500/25 transition-all duration-300 cursor-pointer">
          <FilmIcon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}