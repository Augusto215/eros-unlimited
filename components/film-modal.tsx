"use client"

import { useState } from "react"
import { X, Play, Star } from "lucide-react"
import type { Film } from "@/lib/types"
import Image from "next/image"

interface FilmModalProps {
  film: Film | null
  isOpen: boolean
  isPurchased: boolean
  onClose: () => void
  onPurchase: (filmId: string) => void
  onPlay: (film: Film) => void
}

export default function FilmModal({ film, isOpen, isPurchased, onClose, onPurchase, onPlay }: FilmModalProps) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative">
          {isPlaying ? (
            <div className="aspect-video bg-black">
              <video controls autoPlay className="w-full h-full" onEnded={() => setIsPlaying(false)}>
                <source src={film.videoUrl} type="video/mp4" />
              </video>
            </div>
          ) : (
            <div className="relative aspect-video">
              <Image
                src={film.posterUrl || "/placeholder.svg"}
                alt={film.title}
                fill
                className="object-cover rounded-t-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-white text-3xl font-bold mb-2">{film.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>{film.releaseYear}</span>
                <span>{film.duration} min</span>
                <span className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  {film.rating}
                </span>
                <span className="bg-gray-700 px-2 py-1 rounded">{film.genre}</span>
              </div>
            </div>

            {!isPurchased && (
              <div className="text-right">
                <div className="text-green-400 text-2xl font-bold mb-2">R$ {film.price.toFixed(2)}</div>
              </div>
            )}
          </div>

          <p className="text-gray-300 mb-6 leading-relaxed">{film.synopsis}</p>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            {isPurchased ? (
              <button
                onClick={handlePlay}
                className="flex items-center space-x-2 bg-white text-black px-6 py-3 rounded-md font-semibold hover:bg-white/90 transition-colors"
              >
                <Play className="w-5 h-5" />
                <span>Assistir Agora</span>
              </button>
            ) : (
              <button
                onClick={handlePurchase}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors"
              >
                <span>Comprar por R$ {film.price.toFixed(2)}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
