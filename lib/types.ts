export interface Film {
  id: string
  title: string
  synopsis: string
  price: number
  posterUrl: string
  trailerUrl: string
  videoUrl: string
  genre: string
  duration: number
  releaseYear: number
  rating: number
  description: string
}

export interface Client {
  id: string
  name: string
  email: string
  password: string
  avatar?: string
}

export interface ClientFilm {
  id: string
  clientId: string
  filmId: string
  purchaseDate: Date
}
