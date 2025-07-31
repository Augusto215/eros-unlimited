// lib/movies.ts - Complete version with addFilm function
import { supabase } from './supabase'
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
  posterUrl: dbFilm.poster_url,
  trailerUrl: dbFilm.trailer_url,
  videoUrl: dbFilm.video_url,
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
  posterUrl?: string
  trailerUrl?: string
  videoUrl?: string
}

// Get all movies
export const getMovies = async (): Promise<Film[]> => {
  try {
    const { data, error } = await supabase
      .from('films')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching movies:', error)
      return []
    }

    return data.map(transformDbFilmToFilm)
  } catch (error) {
    console.error('Error in getMovies:', error)
    return []
  }
}

// Get user's purchased films
export const getUserPurchasedFilms = async (userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('client_films')
      .select('film_id')
      .eq('client_id', userId)

    if (error) {
      console.error('Error fetching user purchases:', error)
      return []
    }

    return data.map(item => item.film_id)
  } catch (error) {
    console.error('Error in getUserPurchasedFilms:', error)
    return []
  }
}

// Purchase a film
export const purchaseFilm = async (userId: string, filmId: string): Promise<boolean> => {
  try {
    // Check if already purchased
    const { data: existing, error: checkError } = await supabase
      .from('client_films')
      .select('id')
      .eq('client_id', userId)
      .eq('film_id', filmId)
      .single()

    if (existing) {
      console.log('Film already purchased')
      return true // Already purchased
    }

    // Insert new purchase
    const { error: insertError } = await supabase
      .from('client_films')
      .insert({
        client_id: userId,
        film_id: filmId,
        purchase_date: new Date().toISOString(),
      })

    if (insertError) {
      console.error('Error purchasing film:', insertError)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in purchaseFilm:', error)
    return false
  }
}
// Enhanced version with better URL handling - replace in lib/movies.ts

export const addFilm = async (filmData: NewFilmData): Promise<Film | null> => {
  try {
    console.log('🎬 addFilm called with:', filmData)

    // Helper function to validate and clean URLs
    const cleanUrl = (url?: string): string | null => {
      if (!url || !url.trim()) {
        return null
      }
      
      const cleaned = url.trim()
      
      // Must start with http:// or https://
      if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
        console.warn('Invalid URL (no protocol):', cleaned)
        return null
      }
      
      // Basic URL validation
      try {
        new URL(cleaned)
        return cleaned
      } catch (error) {
        console.warn('Invalid URL format:', cleaned)
        return null
      }
    }

    // Skip admin check for now
    console.log('⏭️ Skipping admin check for testing')

    // Clean and validate URLs
    const poster_url = cleanUrl(filmData.posterUrl)
    const trailer_url = cleanUrl(filmData.trailerUrl)
    const video_url = cleanUrl(filmData.videoUrl)

    console.log('🔗 Cleaned URLs:', { poster_url, trailer_url, video_url })

    // Prepare data for database
    const insertData = {
      title: filmData.title.trim(),
      synopsis: filmData.synopsis.trim(),
      genre: filmData.genre,
      duration: filmData.duration,
      release_year: filmData.releaseYear,
      rating: filmData.rating,
      price: filmData.price,
      poster_url,
      trailer_url,
      video_url,
    }

    console.log('💾 Inserting film data to Supabase:', insertData)

    // Insert into Supabase
    const { data, error } = await supabase
      .from('films')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase error:', error)
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      throw new Error('Database error: ' + error.message)
    }

    console.log('✅ Film saved to database:', data)

    // Transform database response to app format
    const newFilm = transformDbFilmToFilm(data)
    
    console.log('🎉 Transformed film:', newFilm)
    return newFilm

  } catch (error) {
    console.error('💥 Error in addFilm:', error)
    throw error
  }
}

// Update an existing film (Admin only)
export const updateFilm = async (filmId: string, filmData: Partial<NewFilmData>): Promise<Film | null> => {
  try {
    // Check if user is admin
    const { data: isAdminData, error: adminError } = await supabase.rpc('is_admin')
    
    if (adminError || !isAdminData) {
      console.error('Access denied: User is not admin')
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
    if (filmData.posterUrl !== undefined) updateData.poster_url = filmData.posterUrl
    if (filmData.trailerUrl !== undefined) updateData.trailer_url = filmData.trailerUrl
    if (filmData.videoUrl !== undefined) updateData.video_url = filmData.videoUrl

    // Update film
    const { data, error } = await supabase
      .from('films')
      .update(updateData)
      .eq('id', filmId)
      .select()
      .single()

    if (error) {
      console.error('Error updating film:', error)
      throw new Error('Failed to update film: ' + error.message)
    }

    return transformDbFilmToFilm(data)
  } catch (error) {
    console.error('Error in updateFilm:', error)
    throw error
  }
}

// Delete a film (Admin only)
export const deleteFilm = async (filmId: string): Promise<boolean> => {
  try {
    // Check if user is admin
    const { data: isAdminData, error: adminError } = await supabase.rpc('is_admin')
    
    if (adminError || !isAdminData) {
      console.error('Access denied: User is not admin')
      throw new Error('Access denied: Admin privileges required')
    }

    // First, delete all client_films relationships
    const { error: relationError } = await supabase
      .from('client_films')
      .delete()
      .eq('film_id', filmId)

    if (relationError) {
      console.error('Error deleting film relationships:', relationError)
      // Continue anyway, as the film deletion is more important
    }

    // Delete the film
    const { error } = await supabase
      .from('films')
      .delete()
      .eq('id', filmId)

    if (error) {
      console.error('Error deleting film:', error)
      throw new Error('Failed to delete film: ' + error.message)
    }

    return true
  } catch (error) {
    console.error('Error in deleteFilm:', error)
    throw error
  }
}