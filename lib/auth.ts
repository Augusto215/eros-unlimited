import { supabase, type Database } from './supabase'
import type { User } from '@supabase/supabase-js'

export type UserRole = 'CLIENT' | 'ADMIN'

export interface Client {
  id: string
  name: string
  email: string
  role: UserRole
  created_at?: string
}

// Get current authenticated user
export const getCurrentUser = (): Client | null => {
  if (typeof window === 'undefined') return null
  
  const userData = localStorage.getItem('eros_user')
  return userData ? JSON.parse(userData) : null
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null
}

// Login function
export const login = async (email: string, password: string): Promise<Client | null> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      console.error('Auth error:', authError)
      return null
    }

    console.log('Authenticated user ID:', authData.user.id)

    // Get user profile from users table
    const { data: clientData, error: clientError } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .eq('id', authData.user.id)
      .maybeSingle() // Use maybeSingle instead of single to avoid errors

    console.log('Client query result:', { clientData, clientError })

    // If client doesn't exist, create one
    if (!clientData) {
      console.log('No client found, creating new client profile...')
      
      const { data: newClientData, error: createError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || 'User',
          email: authData.user.email || email,
          role: 'CLIENT'
        })
        .select('id, name, email, role, created_at')
        .single()

      if (createError) {
        console.error('Error creating client profile:', createError)
        await supabase.auth.signOut()
        return null
      }

      const client: Client = {
        id: newClientData.id,
        name: newClientData.name,
        email: newClientData.email,
        role: newClientData.role,
        created_at: newClientData.created_at,
      }

      localStorage.setItem('eros_user', JSON.stringify(client))
      
      // Dispatch custom event to notify components about login
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('user-login'))
      }
      
      return client
    }

    // If there was an error fetching existing client
    if (clientError) {
      console.error('Client fetch error:', clientError)
      return null
    }

    // Success - client exists
    const client: Client = {
      id: clientData.id,
      name: clientData.name,
      email: clientData.email,
      role: clientData.role,
      created_at: clientData.created_at,
    }

    // Store in localStorage for persistence
    localStorage.setItem('eros_user', JSON.stringify(client))
    
    // Dispatch custom event to notify components about login
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-login'))
    }
    
    return client
    
  } catch (error) {
    console.error('Login error:', error)
    return null
  }
}

// Register function
export const register = async (name: string, email: string, password: string): Promise<Client | null> => {
  try {
    // Create auth user with metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    })

    if (authError) {
      console.error('Auth registration error:', authError)
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('Falha ao criar usuário')
    }

    // Wait for auth to complete
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Create user profile
    const { data: clientData, error: clientError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        name,
        email,
        role: 'CLIENT'
      })
      .select('id, name, email, role, created_at')
      .single()

    if (clientError) {
      console.error('Client creation error:', clientError)
      // Try to sign out the user if profile creation fails
      try {
        await supabase.auth.signOut()
      } catch (e) {
        console.error('Error signing out after failed registration:', e)
      }
      throw new Error('Falha ao criar perfil do usuário: ' + clientError.message)
    }

    const client: Client = {
      id: clientData.id,
      name: clientData.name,
      email: clientData.email,
      role: clientData.role,
      created_at: clientData.created_at,
    }

    // Store in localStorage
    localStorage.setItem('eros_user', JSON.stringify(client))
    
    // Dispatch custom event to notify components about login
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-login'))
    }
    
    return client
  } catch (error) {
    console.error('Registration error:', error)
    throw error
  }
}

// Logout function
export const logout = async (): Promise<void> => {
  try {
    await supabase.auth.signOut()
    localStorage.removeItem('eros_user')
    
    // Dispatch custom event to notify components about logout
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-logout'))
    }
  } catch (error) {
    console.error('Logout error:', error)
    // Even if Supabase logout fails, remove local data
    localStorage.removeItem('eros_user')
    
    // Still dispatch the event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-logout'))
    }
  }
}

// Initialize auth state on app load
export const initializeAuth = async (): Promise<Client | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      localStorage.removeItem('eros_user')
      return null
    }

    // Check localStorage first
    const storedUser = getCurrentUser()
    if (storedUser && storedUser.id === session.user.id) {
      return storedUser
    }

    // Fetch fresh user data
    const { data: clientData, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .eq('id', session.user.id)
      .maybeSingle()

    if (error || !clientData) {
      console.error('Error fetching client data:', error)
      await logout()
      return null
    }

    const client: Client = {
      id: clientData.id,
      name: clientData.name,
      email: clientData.email,
      role: clientData.role,
      created_at: clientData.created_at,
    }

    localStorage.setItem('eros_user', JSON.stringify(client))
    return client
  } catch (error) {
    console.error('Auth initialization error:', error)
    localStorage.removeItem('eros_user')
    return null
  }
}