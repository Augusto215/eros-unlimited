// lib/movies.ts - Complete version with addFilm function
import { supabase } from './supabase'
import { mockFilms } from './mock-data'
import { logMissingTranslations } from './translation-sync'
import type { Film } from './types'

// Transform database film to app Film type
const transformDbFilmToFilm = (dbFilm: any): Film => ({
  id: dbFilm.id,
  title: dbFilm.title,
  synopsis: dbFilm.synopsis,
  description: dbFilm.description || dbFilm.synopsis,
  genre: dbFilm.genre,
  duration: dbFilm.duration,
  releaseYear: dbFilm.release_year,
  rating: dbFilm.rating,
  price: dbFilm.price,
  launch: dbFilm.launch,
  main: dbFilm.main,
  posterUrl: dbFilm.poster_url,
  trailerUrl: dbFilm.trailer_url,
  videoUrl: dbFilm.movie_url,
  created_at: dbFilm.created_at,
})

// Interface for new film data
export interface NewFilmData {
  title: string
  synopsis: string
  genre: string
  duration: number
  releaseYear: number
  rating: number
  price: number
  launch: boolean
  main: boolean
  posterUrl?: string
  trailerUrl?: string
  videoUrl?: string
}

// Get all movies with translation detection
export const getMovies = async (): Promise<Film[]> => {
  try {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return mockFilms
    }

    if (!data || data.length === 0) {
      return mockFilms
    }

    const films = data.map(transformDbFilmToFilm)
    return films
  } catch (error) {
    return mockFilms
  }
}

// Get user's purchased films
export const getUserPurchasedFilms = async (userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('movie_id')
      .eq('user_id', userId)

    if (error) {
      return []
    }

    return data?.map(item => item.movie_id)
  } catch (error) {
    return []
  }
}

// Purchase a film
export const purchaseFilm = async (userId: string, filmId: string): Promise<boolean> => {
  try {
    // Check if already purchased
    const { data: existing, error: checkError } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('movie_id', filmId)
      .single()

    if (existing) {
      return true // Already purchased
    }

    // Insert new purchase
    const { error: insertError } = await supabase
      .from('purchases')
      .insert({
        user_id: userId,
        movie_id: filmId,
        purchase_date: new Date().toISOString(),
      })

    if (insertError) {
      return false
    }

    return true
  } catch (error) {
    return false
  }
}
// Enhanced version with better URL handling - replace in lib/movies.ts

export const addFilm = async (filmData: NewFilmData): Promise<Film | null> => {
  try {

    // Helper function to validate and clean URLs
    const cleanUrl = (url?: string): string | null => {
      if (!url || !url.trim()) {
        return null
      }
      
      const cleaned = url.trim()
      
      // Must start with http:// or https://
      if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
        return null
      }
      
      // Basic URL validation
      try {
        new URL(cleaned)
        return cleaned
      } catch (error) {
        return null
      }
    }

    // Clean and validate URLs
    const poster_url = cleanUrl(filmData.posterUrl)
    const trailer_url = cleanUrl(filmData.trailerUrl)
    const movie_url = cleanUrl(filmData.videoUrl)

    // Prepare data for database
    const insertData = {
      title: filmData.title.trim(),
      synopsis: filmData.synopsis.trim(),
      genre: filmData.genre,
      duration: filmData.duration,
      release_year: filmData.releaseYear,
      rating: filmData.rating,
      price: filmData.price,
      launch: filmData.launch,
      main: filmData.main,
      poster_url,
      trailer_url,
      movie_url,
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('movies')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      throw new Error('Database error: ' + error.message)
    }

    // Transform database response to app format
    const newFilm = transformDbFilmToFilm(data)
    return newFilm

  } catch (error) {
    throw error
  }
}

// Update an existing film (Admin only)
export const updateFilm = async (filmId: string, filmData: Partial<NewFilmData>): Promise<Film | null> => {
  try {
    // Check if user is admin
    const { data: isAdminData, error: adminError } = await supabase.rpc('is_admin')
    
    if (adminError || !isAdminData) {
      throw new Error('Access denied: Admin privileges required')
    }

    // Prepare update data
    const updateData: any = {}
    if (filmData.title !== undefined) updateData.title = filmData.title
    if (filmData.synopsis !== undefined) updateData.synopsis = filmData.synopsis
    if (filmData.genre !== undefined) updateData.genre = filmData.genre
    if (filmData.duration !== undefined) updateData.duration = filmData.duration
    if (filmData.releaseYear !== undefined) updateData.release_year = filmData.releaseYear
    if (filmData.rating !== undefined) updateData.rating = filmData.rating
    if (filmData.price !== undefined) updateData.price = filmData.price
    if (filmData.launch !== undefined) updateData.launch = filmData.launch
    if (filmData.posterUrl !== undefined) updateData.poster_url = filmData.posterUrl
    if (filmData.trailerUrl !== undefined) updateData.trailer_url = filmData.trailerUrl
    if (filmData.videoUrl !== undefined) updateData.movie_url = filmData.videoUrl

    // Update film
    const { data, error } = await supabase
      .from('movies')
      .update(updateData)
      .eq('id', filmId)
      .select()
      .single()

    if (error) {
      throw new Error('Failed to update film: ' + error.message)
    }

    return transformDbFilmToFilm(data)
  } catch (error) {
    throw error
  }
}

// Delete a film (Admin only)
export const deleteFilm = async (filmId: string): Promise<boolean> => {
  try {
    // Check if user is admin
    const { data: isAdminData, error: adminError } = await supabase.rpc('is_admin')
    
    if (adminError || !isAdminData) {
      throw new Error('Access denied: Admin privileges required')
    }

    // First, delete all purchases relationships
    const { error: relationError } = await supabase
      .from('purchases')
      .delete()
      .eq('movie_id', filmId)

    if (relationError) {
      // Continue anyway, as the film deletion is more important
    }

    // Delete the film
    const { error } = await supabase
      .from('movies')
      .delete()
      .eq('id', filmId)

    if (error) {
      throw new Error('Failed to delete film: ' + error.message)
    }

    return true
  } catch (error) {
    throw error
  }
}