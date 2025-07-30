"use client"

import Link from "next/link"
import { User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { getCurrentUser, logout } from "@/lib/auth"
import type { Client } from "@/lib/auth"

export default function Navbar() {
  const [user, setUser] = useState<Client | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-white text-2xl font-bold">
            Eros Unlimited
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link href="/about" className="text-white/80 hover:text-white transition-colors">
              About
            </Link>
            <Link href="/partner" className="text-white/80 hover:text-white transition-colors">
              Partner
            </Link>
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