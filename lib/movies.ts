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