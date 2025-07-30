// hooks/useAuth.ts
import { useState, useEffect } from 'react'
import { getCurrentUser, logout, initializeAuth } from '@/lib/auth'
import type { Client } from '@/lib/auth'

export const useAuth = () => {
  const [user, setUser] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to get user from localStorage first (faster)
        const localUser = getCurrentUser()
        if (localUser) {
          setUser(localUser)
          setIsLoading(false)
        }

        // Then verify with Supabase (more reliable)
        const verifiedUser = await initializeAuth()
        setUser(verifiedUser)
      } catch (error) {
        console.error('Auth initialization error:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const updateUser = (newUser: Client | null) => {
    setUser(newUser)
  }

  return {
    user,
    isLoading,
    isLoggingOut,
    logout: handleLogout,
    updateUser,
    isAuthenticated: !!user
  }
}