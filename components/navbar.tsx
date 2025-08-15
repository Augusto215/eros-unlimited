"use client"

import Link from "next/link"
import { User } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { getCurrentUser, logout } from "@/lib/auth"
import type { Client } from "@/lib/auth"

export default function Navbar() {
  const [user, setUser] = useState<Client | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    
    const loadUser = () => {
      try {
        const currentUser = getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error loading user:', error)
        setUser(null)
      }
    }

    loadUser()

    // Listen for storage changes (when user logs in from another tab or component)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'eros_user') {
        loadUser()
      }
    }

    // Listen for custom login event
    const handleLoginEvent = () => {
      loadUser()
    }

    // Listen for custom logout event
    const handleLogoutEvent = () => {
      setUser(null)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('user-login', handleLoginEvent)
    window.addEventListener('user-logout', handleLogoutEvent)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('user-login', handleLoginEvent)
      window.removeEventListener('user-logout', handleLogoutEvent)
    }
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Helper function to determine if a link is active
  const getLinkClasses = (href: string) => {
    const isActive = pathname === href
    return `text-white/80 hover:text-white transition-colors ${
      isActive ? 'font-bold text-white border-b-2 border-pink-400' : ''
    }`
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-white text-2xl font-bold">
            Eros Unlimited
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link href="/" className={getLinkClasses("/")}>
              Home
            </Link>
            <Link href="/about" className={getLinkClasses("/about")}>
              About
            </Link>
            <Link href="/partner" className={getLinkClasses("/partner")}>
              Partner
            </Link>
            <Link href="/releases" className={getLinkClasses("/releases")}>
              Releases
            </Link>

            { user && (
              <Link href="/my-movies" className={getLinkClasses("/my-movies")}>
                My movies
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {!mounted ? (
            <div className="text-white/80 text-sm">...</div>
          ) : user ? (
            <div className="flex items-center space-x-2">
              <Link href={`/users/${user.id}`} className="flex items-center space-x-2 text-white/80 hover:text-white">
                <User className="w-6 h-6" />
                <span className="hidden md:inline">{user.name}</span>
              </Link>

              <button 
                onClick={handleLogout} 
                disabled={isLoggingOut}
                className="text-white/80 hover:text-white text-sm disabled:opacity-50"
              >
                {isLoggingOut ? "Saindo..." : "Sair"}
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-white/80 hover:text-white">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}


// const [leaveTimeout, setLeaveTimeout] = useState<NodeJS.Timeout | null>(null)

//   const handleMouseEnter = () => {
//     setIsHovered(true)

//     // Cancelar timeout de saída se existir
//     if (leaveTimeout) {
//       clearTimeout(leaveTimeout)
//       setLeaveTimeout(null)
//     }
    
//     // Delay trailer display like Netflix
//     const timeout = setTimeout(() => {
//       if (film.trailerUrl) {
//         setShowTrailer(true)
//       }
//     }, 1000) // 1 second delay
    
//     setHoverTimeout(timeout)
//   }

//   const handleMouseLeave = () => {
//     if (hoverTimeout) {
//       clearTimeout(hoverTimeout)
//       setHoverTimeout(null)
//     }

//     // Delay para evitar efeito bugado ao sair do trailer
//     const timeout = setTimeout(() => {
//       setIsHovered(false)
//       setShowTrailer(false)
//     }, 300) // 300ms delay para suavizar a transição
    
//     setLeaveTimeout(timeout)
//   }