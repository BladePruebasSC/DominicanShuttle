-- =====================================================
-- Dominican Shuttle - Migración para Adaptar Tablas a la Página Actual
-- =====================================================
-- Esta migración adapta las tablas existentes a cómo está la página ahora
-- Agrega campos faltantes y ajusta estructuras según los componentes

-- =====================================================
-- ACTUALIZAR TABLA TOURS
-- =====================================================
-- Agregar campos que se usan en la página de tours
DO $$
BEGIN
    -- Agregar campo highlights si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tours' AND column_name = 'highlights'
    ) THEN
        ALTER TABLE tours ADD COLUMN highlights JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Agregar campo rating si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tours' AND column_name = 'rating'
    ) THEN
        ALTER TABLE tours ADD COLUMN rating DECIMAL(3,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5);
    END IF;

    -- Agregar campo reviews (número de reseñas) si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tours' AND column_name = 'reviews'
    ) THEN
        ALTER TABLE tours ADD COLUMN reviews INTEGER DEFAULT 0 CHECK (reviews >= 0);
    END IF;
END $$;

-- =====================================================
-- ACTUALIZAR TABLA TESTIMONIALS
-- =====================================================
-- Agregar campo source (Google, TripAdvisor, etc.)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'testimonials' AND column_name = 'source'
    ) THEN
        ALTER TABLE testimonials ADD COLUMN source TEXT DEFAULT 'Google' CHECK (source IN ('Google', 'TripAdvisor', 'Facebook', 'Other'));
    END IF;
END $$;

-- =====================================================
-- ACTUALIZAR TABLA VEHICLES
-- =====================================================
-- Asegurar que todos los campos necesarios existan
DO $$
BEGIN
    -- Agregar campo capacity_text si no existe (para mostrar "1-3 pax")
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vehicles' AND column_name = 'capacity_text'
    ) THEN
        ALTER TABLE vehicles ADD COLUMN capacity_text TEXT;
    END IF;

    -- Agregar campo luggage_text si no existe (para mostrar "1-3 maletas")
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vehicles' AND column_name = 'luggage_text'
    ) THEN
        ALTER TABLE vehicles ADD COLUMN luggage_text TEXT;
    END IF;
END $$;

-- =====================================================
-- ACTUALIZAR TABLA BOOKINGS
-- =====================================================
-- Asegurar que todos los campos necesarios existan
DO $$
BEGIN
    -- Agregar campo origin_place_id si no existe (para Google Places)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'origin_place_id'
    ) THEN
        ALTER TABLE bookings ADD COLUMN origin_place_id TEXT;
    END IF;

    -- Agregar campo destination_place_id si no existe (para Google Places)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'destination_place_id'
    ) THEN
        ALTER TABLE bookings ADD COLUMN destination_place_id TEXT;
    END IF;

    -- Agregar campo origin_coords si no existe (lat, lng)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'origin_coords'
    ) THEN
        ALTER TABLE bookings ADD COLUMN origin_coords JSONB;
    END IF;

    -- Agregar campo destination_coords si no existe (lat, lng)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'destination_coords'
    ) THEN
        ALTER TABLE bookings ADD COLUMN destination_coords JSONB;
    END IF;
END $$;

-- =====================================================
-- CREAR TABLA DE RESEÑAS (REVIEWS) - Si no existe
-- =====================================================
-- Tabla separada para reseñas de tours (diferente de testimonials)
CREATE TABLE IF NOT EXISTS tour_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    verified BOOLEAN DEFAULT false,
    source TEXT DEFAULT 'website' CHECK (source IN ('website', 'Google', 'TripAdvisor', 'Facebook')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para tour_reviews
CREATE INDEX IF NOT EXISTS idx_tour_reviews_tour_id ON tour_reviews(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_reviews_rating ON tour_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_tour_reviews_verified ON tour_reviews(verified);

-- Trigger para actualizar updated_at en tour_reviews
CREATE TRIGGER update_tour_reviews_updated_at 
    BEFORE UPDATE ON tour_reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- CREAR FUNCIÓN PARA ACTUALIZAR RATING DE TOURS
-- =====================================================
CREATE OR REPLACE FUNCTION update_tour_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE tours
    SET 
        rating = (
            SELECT COALESCE(AVG(rating::DECIMAL), 0)
            FROM tour_reviews
            WHERE tour_id = COALESCE(NEW.tour_id, OLD.tour_id)
            AND verified = true
        ),
        reviews = (
            SELECT COUNT(*)
            FROM tour_reviews
            WHERE tour_id = COALESCE(NEW.tour_id, OLD.tour_id)
            AND verified = true
        )
    WHERE id = COALESCE(NEW.tour_id, OLD.tour_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar rating cuando se inserta/actualiza/elimina una reseña
CREATE TRIGGER trigger_update_tour_rating
    AFTER INSERT OR UPDATE OR DELETE ON tour_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_tour_rating();

-- =====================================================
-- COMENTARIOS EN NUEVAS COLUMNAS
-- =====================================================
COMMENT ON COLUMN tours.highlights IS 'Puntos destacados del tour (array de strings)';
COMMENT ON COLUMN tours.rating IS 'Calificación promedio del tour (0-5)';
COMMENT ON COLUMN tours.reviews IS 'Número total de reseñas verificadas';
COMMENT ON COLUMN testimonials.source IS 'Fuente del testimonio (Google, TripAdvisor, etc.)';
COMMENT ON COLUMN bookings.origin_place_id IS 'ID de Google Places para el origen';
COMMENT ON COLUMN bookings.destination_place_id IS 'ID de Google Places para el destino';
COMMENT ON COLUMN bookings.origin_coords IS 'Coordenadas del origen (lat, lng)';
COMMENT ON COLUMN bookings.destination_coords IS 'Coordenadas del destino (lat, lng)';
COMMENT ON TABLE tour_reviews IS 'Reseñas específicas de tours realizados por clientes';

-- =====================================================
-- ACTUALIZAR ÍNDICES EXISTENTES
-- =====================================================
-- Índice para tours por rating y popular
CREATE INDEX IF NOT EXISTS idx_tours_rating ON tours(rating DESC);
CREATE INDEX IF NOT EXISTS idx_tours_reviews ON tours(reviews DESC);

-- Índice para testimonials por source
CREATE INDEX IF NOT EXISTS idx_testimonials_source ON testimonials(source);

-- Índice para bookings por place_id
CREATE INDEX IF NOT EXISTS idx_bookings_origin_place_id ON bookings(origin_place_id);
CREATE INDEX IF NOT EXISTS idx_bookings_destination_place_id ON bookings(destination_place_id);
