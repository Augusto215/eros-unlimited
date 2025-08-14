import type { Film, Client, ClientFilm } from "./types"

export const mockFilms: Film[] = [
  {
    id: "1",
    title: "A Dark Man Apocalypse",
    description: "",
    synopsis:
      "Pedro is an “in the closet” street poet tormented by the ghost of a woman He thinks was brutally murdered in a motel room. The only peace He finds is when He writes poems in the dark corners of the city bridges. Living in the noisy and crowded Big Apple, the cruelty of nowadays reality and his delusional fantasies gradually turns him into a violent person. Is there any faith in mankind? Pedro thinks there is not, and He is willing to kill tonight to satiate his inner demons.",
    price: 1.99,
    posterUrl: "https://drive.google.com/uc?id=1-PMD7Z8IJ2RORJ1Ml7fnSWc0J1D-ICgs",
    trailerUrl: "https://drive.google.com/uc?export=download&id=1NK07o73VxCm4fipeDIMWkVh0n7cc6kLG", 
    videoUrl: "https://drive.google.com/uc?export=download&id=1WgykngRxzV_Pv3UxA17DfrbNO3BG6ree",
    genre: "Romance",
    duration: 18,
    releaseYear: 2017,
    rating: 4.5,
  },
  {
    id: "2",
    title: "Delirium",
    description: "",
    synopsis: 
    "Is love a Delirium? Is the big city just an illusion? For the young P.J. all this confusion of feelings, anguish and desires are mixed when he sees himself lost in the middle of the crowd. Alone and confused, far away from his forgotten childhood, the memories of his once beloved mother starts to invade his mind and his goal of living in the metropolis. The only escape is the fast sex he finds in erotic cabins and dirty bathrooms downtown… but mother is coming soon to bring him back to reality of life.",
    price: 2.99,
    posterUrl: "https://drive.google.com/uc?id=1qJODzQyakINqOhdG3cels_XzjOeOVhXW",
    trailerUrl: "https://drive.google.com/uc?export=download&id=19vd8fgi8C2OTUWd9iUfpfhVTro6wy2VT",
    videoUrl: "https://drive.google.com/uc?export=download&id=1g_Rqv3S7DLj5fsvNp86S8_j6Tu71fm23",
    genre: "Romance",
    duration: 17,
    releaseYear: 2017,
    rating: 4.2,
  },
  {
    id: "3",
    title: "Interlude – A Gay Movie",
    description: "",
    synopsis: "Xerxes is a Gay, underground and daring Brazilian artist living in the Big Apple of Sao Paulo. His unique lifestyle scares the traditional society, afraid of anything that is different than the already established behavior. Xerxes’s life is in danger now, as a group of merciless skinheads want to destroy him and his outrageous dream of becoming the next Madonna like superstar. A movie about freedom of speech, art and the fight against prejudice in our world today.",
    price: 3.99,
    posterUrl: "https://drive.google.com/uc?id=1k1GpkwuaiExDUo-Dr_Nb70g2L6SCtxrG",
    trailerUrl: "https://drive.google.com/uc?export=download&id=1c5FLyCGVUhlf71YT_5tpeVZnFe3LifyA",
    videoUrl: "https://drive.google.com/uc?export=download&id=1__BLTrPtHkQqjBZ9_QgJqVnkxCx1DcT3",
    genre: "Romance",
    duration: 17,
    releaseYear: 2017,
    rating: 4.0,
  },
  {
    id: "4",
    title: "Scenes of the Apocalypse",
    description: "",
    synopsis: "Pedro just woke up with a horrible sensation that the world is coming to an end soon. With no home, no job and desperate to fall in love, his ghosts of the past are gonna put him in trial. And to worsen things up, He believes He saw a girl being murdered in a vicious way, but, was it just a dream? or is it all part of his unique sense of illusion?",
    price: 2.99,
    posterUrl: "https://drive.google.com/uc?id=1J-ArGsSaXpL8qOZZi7RZXbff06P7Lo4X",
    trailerUrl: "https://drive.google.com/uc?export=download&id=1vAtiCP25tPpuVhN8Mu3W3f_miL09ffwb",
    videoUrl: "https://drive.google.com/uc?export=download&id=1rr4Jixw0knnfGfAZdNEd08BiXNfk7a4H",
    genre: "Drama",
    duration: 18,
    releaseYear: 2016,
    rating: 4.3,
  },
  {
    id: "5",
    title: "Heads of State",
    description: "Uma comédia de ação sobre dois presidentes improváveis.",
    synopsis: "Dois líderes mundiais precisam trabalhar juntos para salvar o mundo de uma conspiração internacional.",
    price: 3.99,
    posterUrl: "https://drive.google.com/uc?id=COLE_SEU_ID_DO_POSTER_AQUI",
    trailerUrl: "https://drive.google.com/uc?export=download&id=COLE_SEU_ID_DO_TRAILER_AQUI",
    videoUrl: "https://drive.google.com/uc?export=download&id=COLE_SEU_ID_DO_FILME_AQUI",
    genre: "Romac",
    duration: 17,
    releaseYear: 2017,
    rating: 3.8,
  },
]

export const mockClients: Client[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@email.com",
    password: "123456",
    avatar: "/placeholder.svg?height=40&width=40&text=JS",
  },
]

export const mockClientFilms: ClientFilm[] = [
  {
    id: "1",
    clientId: "1",
    filmId: "1",
    purchaseDate: new Date("2024-01-15"),
  },
  {
    id: "2",
    clientId: "1",
    filmId: "3",
    purchaseDate: new Date("2024-01-20"),
  },
]
