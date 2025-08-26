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
      return null
    }

    // Get user profile from users table
    const { data: clientData, error: clientError } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .eq('id', authData.user.id)
      .maybeSingle()

    // If client doesn't exist, create one
    if (!clientData) {
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
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('user-login'))
      }
      
      return client
    }

    if (clientError) {
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
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-login'))
    }
    
    return client
    
  } catch (error) {
    return null
  }
}

// Register function
export const register = async (name: string, email: string, password: string): Promise<Client | null> => {
  try {
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
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('Falha ao criar usuário')
    }

    await new Promise(resolve => setTimeout(resolve, 1000))

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
      try {
        await supabase.auth.signOut()
      } catch (e) {
        // Silent error handling for signout
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

    localStorage.setItem('eros_user', JSON.stringify(client))
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-login'))
    }
    
    return client
  } catch (error) {
    throw error
  }
}

// Update user name
export const updateUserName = async (name: string): Promise<Client | null> => {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      throw new Error('Usuário não autenticado')
    }

    // Update in users table
    const { data: updatedData, error: updateError } = await supabase
      .from('users')
      .update({ name })
      .eq('id', currentUser.id)
      .select('id, name, email, role, created_at')
      .single()

    if (updateError) {
      throw new Error('Erro ao atualizar nome: ' + updateError.message)
    }

    const updatedClient: Client = {
      id: updatedData.id,
      name: updatedData.name,
      email: updatedData.email,
      role: updatedData.role,
      created_at: updatedData.created_at,
    }

    // Update localStorage
    localStorage.setItem('eros_user', JSON.stringify(updatedClient))
    
    // Dispatch update event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-updated', { detail: updatedClient }))
    }

    return updatedClient
  } catch (error) {
    throw error
  }
}

// Update user email
export const updateUserEmail = async (newEmail: string): Promise<Client | null> => {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      throw new Error('Usuário não autenticado')
    }

    // Update auth email
    const { error: authError } = await supabase.auth.updateUser({ 
      email: newEmail 
    })

    if (authError) {
      throw new Error('Erro ao atualizar email na autenticação: ' + authError.message)
    }

    // Update in users table
    const { data: updatedData, error: updateError } = await supabase
      .from('users')
      .update({ email: newEmail })
      .eq('id', currentUser.id)
      .select('id, name, email, role, created_at')
      .single()

    if (updateError) {
      throw new Error('Erro ao atualizar email: ' + updateError.message)
    }

    const updatedClient: Client = {
      id: updatedData.id,
      name: updatedData.name,
      email: updatedData.email,
      role: updatedData.role,
      created_at: updatedData.created_at,
    }

    // Update localStorage
    localStorage.setItem('eros_user', JSON.stringify(updatedClient))
    
    // Dispatch update event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-updated', { detail: updatedClient }))
    }

    return updatedClient
  } catch (error) {
    throw error
  }
}

// Update user password
export const updateUserPassword = async (password: string): Promise<void> => {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      throw new Error('Usuário não autenticado')
    }

    // Update auth password
    const { error: authError } = await supabase.auth.updateUser({ 
      password 
    })

    if (authError) {
      throw new Error('Erro ao atualizar senha: ' + authError.message)
    }
  } catch (error) {
    throw error
  }
}

export const verificaSenhaAtual = async (password: string): Promise<boolean> => {
  const user = getCurrentUser()
  if (!user || !user.email) return false

  // Autentica o usuário com a senha atual
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password
  })
  if (signInError) return false

  return true
}

// Logout function
export const logout = async (): Promise<void> => {
  try {
    await supabase.auth.signOut()
    localStorage.removeItem('eros_user')
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-logout'))
    }
  } catch (error) {
    localStorage.removeItem('eros_user')
    
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

    const storedUser = getCurrentUser()
    if (storedUser && storedUser.id === session.user.id) {
      return storedUser
    }

    const { data: clientData, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .eq('id', session.user.id)
      .maybeSingle()

    if (error || !clientData) {
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
    localStorage.removeItem('eros_user')
    return null
  }
}