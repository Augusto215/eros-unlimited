import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface Purchase {
  id: string
  user_id: string
  movie_id: string
  amount: number
  payment_id: string
  payment_method: string
  status: string
  purchased_at: string
}

// Busca todos os IDs de filmes comprados por um usuário
export const getUserPurchasedFilmIds = async (userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('movie_id')
      .eq('user_id', userId)
      .eq('status', 'completed')

    if (error) throw error

    return data?.map(purchase => purchase.movie_id) || []
  } catch (error) {
    console.error('Error fetching purchased films:', error)
    return []
  }
}

// Busca detalhes completos dos filmes comprados
export const getUserPurchasedFilms = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        movies (*)
      `)
      .eq('user_id', userId)
      .eq('status', 'completed')

    if (error) throw error

    return data?.map(purchase => purchase.movies) || []
  } catch (error) {
    console.error('Error fetching purchased films with details:', error)
    return []
  }
}

// Verifica se um usuário comprou um filme específico
export const hasUserPurchasedFilm = async (userId: string, filmId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('movie_id', filmId)
      .eq('status', 'completed')
      .single()

    return !error && !!data
  } catch (error) {
    return false
  }
}