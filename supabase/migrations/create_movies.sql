CREATE TABLE movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  genre VARCHAR(100),
  release_year INTEGER,
  duration_minutes INTEGER,
  poster_url TEXT,
  trailer_url TEXT,
  movie_url TEXT,
  rating DECIMAL(3,1) CHECK (rating >= 0.0 AND rating <= 10.0),
  price DECIMAL(10,2) DEFAULT 9.99 CHECK (price >= 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX idx_movies_title ON movies(title);
CREATE INDEX idx_movies_genre ON movies(genre);
CREATE INDEX idx_movies_release_year ON movies(release_year);
CREATE INDEX idx_movies_is_active ON movies(is_active);
CREATE INDEX idx_movies_price ON movies(price);

-- 3. TRIGGER PARA ATUALIZAR updated_at AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_movies_updated_at 
BEFORE UPDATE ON movies
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
