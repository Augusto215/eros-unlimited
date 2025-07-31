"use client"

import { useState, useEffect } from "react"
import { Mail, Phone, Camera, Heart, Users, Sparkles, Film, Star, ArrowRight, Send, Play } from "lucide-react"
import Image from "next/image"

export default function Partner() {
  const [hoveredImage, setHoveredImage] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    filmTitle: '',
    genre: '',
    description: '',
    budget: '',
    timeline: ''
  })

  const partnershipBenefits = [
    {
      icon: <Film className="w-8 h-8" />,
      title: "Creative Freedom",
      description: "Express your artistic vision without limitations or censorship"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Global Audience",
      description: "Reach LGBTQ+ communities and indie film lovers worldwide"
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Festival Network",
      description: "Access to our established network of international film festivals"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Passionate Community",
      description: "Connect with artists who share your vision for inclusive storytelling"
    }
  ]

  const partnerImages = [
    {
      id: 1,
      category: "Behind the Scenes",
      description: "Creative process in action"
    },
    {
      id: 2,
      category: "Festival Moments", 
      description: "Celebrating diversity together"
    },
    {
      id: 3,
      category: "Community Events",
      description: "Building bridges through art"
    },
    {
      id: 4,
      category: "Artistic Vision",
      description: "Bringing stories to life"
    },
    {
      id: 5,
      category: "Collaboration",
      description: "Creating magic together"
    }
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Partnership inquiry submitted:', formData)
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 via-pink-800/30 to-purple-600/40" />
        <div className="absolute inset-0">
          <div className="w-full h-full bg-gradient-to-r from-red-500/20 via-orange-500/20 via-yellow-500/20 via-green-500/20 via-blue-500/20 via-indigo-500/20 to-purple-500/20 animate-pulse" />
        </div>
        
        <div className="relative z-10 text-center max-w-6xl mx-auto px-4 pt-20">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            PARTNER WITH US
          </h1>
          <p className="text-2xl md:text-3xl mb-8 text-gray-200 font-light">
            Create • Collaborate • Celebrate
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-red-500 to-purple-500 mx-auto mb-8 rounded-full" />
          <p className="text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Join our vision of creating a dream place where independent artists can expose their creativity, 
            share their films and succeed faster than an arrow crossing a heart.
          </p>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Partnership Vision */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
              Our Partnership Vision
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-xl text-gray-300 leading-relaxed mb-8">
                We are looking for <span className="text-red-400 font-semibold">independent directors and producers</span> who are willing to share their amazing 
                LGBTQ+ themed films and be able to sell them online with our on demand platform.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed">
                If you have a <span className="text-pink-400 font-semibold">daring, sexy, underground, innovative, sensual, experimental, uniquely bizarre, 
                ambiguous, androgynous</span> film that depicts the lives of interesting and unconventional characters - we want to hear from you!
              </p>
            </div>
          </div>

          {/* Call to Action Box */}
          <div className="bg-gradient-to-r from-red-900/30 to-pink-900/30 rounded-2xl p-8 border border-red-500/20 text-center">
            <h3 className="text-3xl font-bold mb-4 text-red-400">Your Film Matters to Us</h3>
            <p className="text-xl text-gray-300 mb-6">
              You can sell it, rent it and create your own audience as anything can happen if you believe in our art. 
              <span className="text-pink-400 font-semibold"> We believe in You.</span>
            </p>
            <p className="text-lg text-gray-400">
              So don't be shy and give it a try. Eros on demand has a vision, and your new movie can be part of this dream.
            </p>
          </div>
        </div>
      </section>

      {/* Partnership Benefits */}
      <section className="py-24 bg-gradient-to-br from-red-900/20 to-purple-900/20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Why Partner With Us?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {partnershipBenefits.map((benefit, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-xl p-8 border border-red-500/20 hover:border-pink-500/40 transition-all duration-300 hover:transform hover:scale-105 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-red-400 mb-4">{benefit.title}</h3>
                <p className="text-gray-300 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Gallery */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Partnership in Action
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {partnerImages.map((img, index) => (
              <div 
                key={img.id}
                className="relative group cursor-pointer"
                onMouseEnter={() => setHoveredImage(index)}
                onMouseLeave={() => setHoveredImage(null)}
              >
                <div className="relative aspect-square rounded-xl overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-red-600 via-pink-600 to-purple-600 flex items-center justify-center">
                    <div className="text-center p-4">
                      <Camera className="w-12 h-12 text-white mx-auto mb-3" />
                      <p className="text-white font-semibold text-sm">{img.category}</p>
                    </div>
                  </div>
                  
                  {hoveredImage === index && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center transition-all duration-300">
                      <div className="text-center text-white p-4">
                        <Play className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">{img.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-400 text-lg">
              Join our community of creative partners and see your vision come to life
            </p>
          </div>
        </div>
      </section>

      {/* Contact & Partnership Form */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Contact Information */}
            <div>
              <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                Let's Collaborate
              </h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">Contact us to collaborate:</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Email</p>
                        <a href="mailto:erosunlimitedart@gmail.com" className="text-red-400 font-semibold text-lg hover:text-pink-400 transition-colors">
                          erosunlimitedart@gmail.com
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Phone</p>
                        <a href="tel:+13233837144" className="text-pink-400 font-semibold text-lg hover:text-purple-400 transition-colors">
                          323 383 71 44
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-900/30 to-pink-900/30 p-6 rounded-xl border border-red-500/20">
                  <h4 className="text-xl font-bold text-red-400 mb-3">Ready to Start?</h4>
                  <p className="text-gray-300 leading-relaxed">
                    Send us your film details, portfolio, or just a message about your project. 
                    We're excited to learn about your creative vision and explore how we can work together.
                  </p>
                </div>
              </div>
            </div>

            {/* Partnership Inquiry Form */}
            <div>
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-xl p-8 border border-purple-500/20">
                <h3 className="text-2xl font-bold text-purple-400 mb-6">Partnership Inquiry</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-red-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-red-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-red-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Film Title</label>
                      <input
                        type="text"
                        value={formData.filmTitle}
                        onChange={(e) => handleInputChange('filmTitle', e.target.value)}
                        className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Genre</label>
                      <input
                        type="text"
                        value={formData.genre}
                        onChange={(e) => handleInputChange('genre', e.target.value)}
                        placeholder="e.g., LGBTQ+ Drama, Experimental"
                        className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-red-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Budget Range</label>
                      <input
                        type="text"
                        value={formData.budget}
                        onChange={(e) => handleInputChange('budget', e.target.value)}
                        placeholder="e.g., $10k - $50k"
                        className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Project Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Tell us about your film, characters, themes, and vision..."
                      rows={4}
                      className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-red-500 focus:outline-none resize-vertical"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Timeline</label>
                    <input
                      type="text"
                      value={formData.timeline}
                      onChange={(e) => handleInputChange('timeline', e.target.value)}
                      placeholder="When do you plan to release?"
                      className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Send className="w-5 h-5" />
                    <span>Send Partnership Inquiry</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-gradient-to-r from-red-900/40 via-pink-900/40 to-purple-900/40">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Ready to Change the World Through Film?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join us in creating a more inclusive, diverse, and beautiful world through the power of independent cinema.
          </p>
          <div className="flex justify-center space-x-4">
            <span className="text-4xl">🎬</span>
            <span className="text-4xl">🌈</span>
            <span className="text-4xl">❤️</span>
            <span className="text-4xl">✨</span>
          </div>
        </div>
      </section>
    </div>
  )
}