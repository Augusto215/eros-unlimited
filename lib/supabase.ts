import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Database Types
export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          created_at?: string
        }
      }
      films: {
        Row: {
          id: string
          title: string
          synopsis: string
          genre: string
          duration: number
          release_year: number
          rating: number
          price: number
          poster_url: string | null
          trailer_url: string | null
          video_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          synopsis: string
          genre: string
          duration: number
          release_year: number
          rating: number
          price: number
          poster_url?: string | null
          trailer_url?: string | null
          video_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          synopsis?: string
          genre?: string
          duration?: number
          release_year?: number
          rating?: number
          price?: number
          poster_url?: string | null
          trailer_url?: string | null
          video_url?: string | null
          created_at?: string
        }
      }
      client_films: {
        Row: {
          id: string
          client_id: string
          film_id: string
          purchase_date: string
        }
        Insert: {
          id?: string
          client_id: string
          film_id: string
          purchase_date?: string
        }
        Update: {
          id?: string
          client_id?: string
          film_id?: string
          purchase_date?: string
        }
      }
    }
  }
}