"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Play, Award, Users, Heart, Globe, Calendar, MapPin, Camera } from "lucide-react"
import Image from "next/image"
import { useAboutTranslation } from "@/hooks/useTranslation"

export default function About() {
  const router = useRouter()
  const about = useAboutTranslation()
  const [activeSection, setActiveSection] = useState(0)

  const awards = [
    "Festival Entretodos - São Paulo",
    "OMovies Festival - Italy",
    "Canadian Diversity Film Festival",
    "DIGO - Festival da Diversidade de Goiás",
    "Los Angeles Neo Noir Festival",
    "Festival Internacional LGBT de Recife - RECIFEST",
    "Festival Internacional de cinema Homossexual - Italia"
  ]

  const films = [
    {
      title: "A Dark Man",
      year: "2015",
      genre: "Video Art, Suspense",
      duration: "14min",
      description: about.premiere
    },
    {
      title: "Homophobic Interlude",
      year: "2016", 
      genre: "Experimental Documentary",
      duration: "17min",
      description: about.exploringThemes
    },
    {
      title: "Scenes of the Apocalypse",
      year: "2016",
      genre: "Experimental Fiction",
      duration: "18min", 
      description: about.visionaryTale
    },
    {
      title: "Delirium",
      year: "2014",
      genre: "Fiction",
      duration: "16min",
      description: about.intimateJourney
    },
    {
      title: "Queens",
      year: "2013",
      genre: "Documentary",
      duration: "19min",
      description: about.celebratingIdentity
    },
    {
      title: "FEB - Soldado de Guerra",
      year: "2012",
      genre: "Documentary", 
      duration: "21min",
      description: about.historicalPerspective
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSection((prev) => (prev + 1) % 4)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-pink-800/30 to-orange-600/40" />
        <div className="absolute inset-0">
          <div className="w-full h-full bg-gradient-to-r from-red-500/20 via-yellow-500/20 via-green-500/20 via-blue-500/20 via-indigo-500/20 to-purple-500/20 animate-pulse" />
        </div>
        
        <div className="relative z-10 text-center max-w-6xl mx-auto px-4 pt-20">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-orange-400 bg-clip-text text-transparent animate-pulse">
            {about.heroTitle}
          </h1>
          <p className="text-2xl md:text-3xl mb-8 text-gray-200 font-light">
            {about.heroSubtitle}
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto mb-8 rounded-full" />
          <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
            "{about.heroQuote}"
          </p>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                {about.ourMissionTitle}
              </h2>
              <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
                <p>
                  {about.missionText1} <span className="text-pink-400 font-semibold">LGBTQ+</span> {about.missionText2}
                </p>
                <p>
                  {about.missionText3} <span className="text-purple-400 font-semibold">{about.missionText4}</span>
                </p>
              </div>
              
              <div className="mt-12 grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-pink-400">{about.love}</h3>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-purple-400">{about.unity}</h3>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-blue-400">{about.freedom}</h3>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative w-full h-96 rounded-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 to-purple-500/30 z-10" />
                <div className="w-full h-full bg-gradient-to-br from-pink-900 via-purple-900 to-blue-900 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🏳️‍🌈</div>
                    <p className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                      A Fantasia de Eros
                    </p>
                    <p className="text-lg text-gray-300 mt-2">...no Alorro</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Statement */}
      <section className="py-20 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8 text-white">{about.ourVisionTitle}</h2>
          <p className="text-xl text-gray-300 leading-relaxed mb-8">
            "{about.visionText1} <span className="text-pink-400 font-semibold">{about.visionText2}</span> {about.visionText3}"
          </p>
          <div className="flex justify-center space-x-4">
            <span className="text-4xl">🌈</span>
            <span className="text-4xl">❤️</span>
            <span className="text-4xl">🎬</span>
            <span className="text-4xl">✨</span>
          </div>
        </div>
      </section>

      {/* Filmography Section */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            {about.filmographyTitle}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {films.map((film, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-purple-500/20 hover:border-pink-500/40 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="flex items-center mb-4">
                  <Camera className="w-6 h-6 text-pink-400 mr-3" />
                  <span className="text-gray-400 text-sm">{film.year}</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{film.title}</h3>
                <p className="text-purple-400 font-semibold mb-2">{film.genre}</p>
                <p className="text-gray-400 mb-4">{film.duration}</p>
                <p className="text-gray-300 text-sm">{film.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-24 bg-gradient-to-br from-purple-900/30 to-pink-900/30">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            {about.recognitionTitle}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {awards.map((award, index) => (
              <div 
                key={index}
                className="flex items-center p-6 bg-gradient-to-r from-gray-900/80 to-gray-800/80 rounded-xl border border-yellow-500/20 hover:border-yellow-400/40 transition-all duration-300"
              >
                <Award className="w-8 h-8 text-yellow-400 mr-4 flex-shrink-0" />
                <span className="text-gray-200 font-medium">{award}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Director's Biography */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {about.directorBioTitle}
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-4 h-4 bg-cyan-400 rounded-full" />
                <h3 className="text-2xl font-bold text-cyan-400">{about.directorName}</h3>
              </div>
              
              <div className="space-y-4 text-gray-300 text-lg">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  <span>{about.bornIn}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  <span>{about.graduated}</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 p-6 rounded-xl border border-cyan-500/20">
                <p className="text-gray-300 leading-relaxed">
                  {about.bioText}
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="relative w-full h-96 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 z-10" />
                <div className="w-full h-full bg-gradient-to-br from-gray-900 via-cyan-900 to-blue-900 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-4xl">🎭</span>
                    </div>
                    <p className="text-xl font-bold text-cyan-400">{about.directorName}</p>
                    <p className="text-gray-300">{about.directorProducer}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-gradient-to-r from-pink-900/40 via-purple-900/40 to-blue-900/40">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8 text-white">{about.joinJourneyTitle}</h2>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            {about.joinJourneyText}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={() => router.push('/')}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
            >
              {about.exploreFilms}
            </button>
            {/* <button className="px-8 py-4 border-2 border-purple-400 text-purple-400 font-bold rounded-xl hover:bg-purple-400 hover:text-white transition-all duration-300">
              {about.contactUs}
            </button> */}
          </div>
        </div>
      </section>
    </div>
  )
}