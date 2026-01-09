-- =====================================================
-- Dominican Shuttle - Migración Completa con Adaptaciones
-- =====================================================
-- Esta migración crea todas las tablas si no existen
-- y las adapta con los campos necesarios para la página actual
-- Puede ejecutarse incluso si las tablas ya existen

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- FUNCIÓN PARA ACTUALIZAR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- TABLA DE USUARIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT UNIQUE,
    full_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'driver')),
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE VEHÍCULOS
-- =====================================================
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('sedan', 'suv', 'van', 'bus')),
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    luggage_capacity INTEGER NOT NULL CHECK (luggage_capacity >= 0),
    base_price DECIMAL(10,2) NOT NULL CHECK (base_price > 0),
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    image_url TEXT,
    license_plate TEXT UNIQUE,
    year INTEGER,
    color TEXT,
    available BOOLEAN DEFAULT true,
    driver_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar campos adicionales si no existen
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vehicles' AND column_name = 'capacity_text'
    ) THEN
        ALTER TABLE vehicles ADD COLUMN capacity_text TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vehicles' AND column_name = 'luggage_text'
    ) THEN
        ALTER TABLE vehicles ADD COLUMN luggage_text TEXT;
    END IF;
END $$;

-- =====================================================
-- TABLA DE TOURS
-- =====================================================
CREATE TABLE IF NOT EXISTS tours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    duration TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    includes JSONB NOT NULL DEFAULT '[]'::jsonb,
    image_url TEXT,
    category TEXT NOT NULL CHECK (category IN ('adventure', 'cultural', 'beach', 'nature', 'city')),
    popular BOOLEAN DEFAULT false,
    max_participants INTEGER,
    min_participants INTEGER DEFAULT 1,
    difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar campos adicionales si no existen
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tours' AND column_name = 'highlights'
    ) THEN
        ALTER TABLE tours ADD COLUMN highlights JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tours' AND column_name = 'rating'
    ) THEN
        ALTER TABLE tours ADD COLUMN rating DECIMAL(3,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tours' AND column_name = 'reviews'
    ) THEN
        ALTER TABLE tours ADD COLUMN reviews INTEGER DEFAULT 0 CHECK (reviews >= 0);
    END IF;
END $$;

-- =====================================================
-- TABLA DE RESERVAS
-- =====================================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    pickup_date TIMESTAMP WITH TIME ZONE NOT NULL,
    return_date TIMESTAMP WITH TIME ZONE,
    passengers INTEGER NOT NULL CHECK (passengers > 0),
    vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('sedan', 'suv', 'van', 'bus')),
    service_type TEXT NOT NULL CHECK (service_type IN ('one_way', 'round_trip')),
    estimated_price DECIMAL(10,2) NOT NULL CHECK (estimated_price > 0),
    final_price DECIMAL(10,2),
    special_requests TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    payment_method TEXT,
    vehicle_id UUID REFERENCES vehicles(id),
    driver_id UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar campos adicionales si no existen
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'origin_place_id'
    ) THEN
        ALTER TABLE bookings ADD COLUMN origin_place_id TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'destination_place_id'
    ) THEN
        ALTER TABLE bookings ADD COLUMN destination_place_id TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'origin_coords'
    ) THEN
        ALTER TABLE bookings ADD COLUMN origin_coords JSONB;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'destination_coords'
    ) THEN
        ALTER TABLE bookings ADD COLUMN destination_coords JSONB;
    END IF;
END $$;

-- =====================================================
-- TABLA DE TESTIMONIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_initials TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT NOT NULL,
    date TEXT NOT NULL,
    verified BOOLEAN DEFAULT true,
    booking_id UUID REFERENCES bookings(id),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar campo source si no existe
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
-- TABLA DE MENSAJES DE CONTACTO
-- =====================================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    service_interest TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'resolved', 'closed')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    assigned_to UUID REFERENCES users(id),
    response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE RESEÑAS DE TOURS
-- =====================================================
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

-- =====================================================
-- FUNCIÓN PARA ACTUALIZAR RATING DE TOURS
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

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para bookings
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_pickup_date ON bookings(pickup_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_origin_place_id ON bookings(origin_place_id);
CREATE INDEX IF NOT EXISTS idx_bookings_destination_place_id ON bookings(destination_place_id);

-- Índices para vehicles
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(type);
CREATE INDEX IF NOT EXISTS idx_vehicles_available ON vehicles(available);

-- Índices para tours
CREATE INDEX IF NOT EXISTS idx_tours_category ON tours(category);
CREATE INDEX IF NOT EXISTS idx_tours_popular ON tours(popular);
CREATE INDEX IF NOT EXISTS idx_tours_rating ON tours(rating DESC);
CREATE INDEX IF NOT EXISTS idx_tours_reviews ON tours(reviews DESC);

-- Índices para testimonials
CREATE INDEX IF NOT EXISTS idx_testimonials_source ON testimonials(source);

-- Índices para contact_messages
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);

-- Índices para tour_reviews
CREATE INDEX IF NOT EXISTS idx_tour_reviews_tour_id ON tour_reviews(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_reviews_rating ON tour_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_tour_reviews_verified ON tour_reviews(verified);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vehicles_updated_at ON vehicles;
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tours_updated_at ON tours;
CREATE TRIGGER update_tours_updated_at BEFORE UPDATE ON tours FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_testimonials_updated_at ON testimonials;
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON contact_messages;
CREATE TRIGGER update_contact_messages_updated_at BEFORE UPDATE ON contact_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tour_reviews_updated_at ON tour_reviews;
CREATE TRIGGER update_tour_reviews_updated_at BEFORE UPDATE ON tour_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGER PARA ACTUALIZAR RATING DE TOURS
-- =====================================================
DROP TRIGGER IF EXISTS trigger_update_tour_rating ON tour_reviews;
CREATE TRIGGER trigger_update_tour_rating
    AFTER INSERT OR UPDATE OR DELETE ON tour_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_tour_rating();

-- =====================================================
-- COMENTARIOS EN TABLAS Y COLUMNAS
-- =====================================================
COMMENT ON TABLE users IS 'Usuarios del sistema (admin, conductores, clientes)';
COMMENT ON TABLE vehicles IS 'Flota de vehículos disponibles';
COMMENT ON TABLE tours IS 'Tours y excursiones disponibles';
COMMENT ON TABLE bookings IS 'Reservas de transporte realizadas por clientes';
COMMENT ON TABLE testimonials IS 'Testimonios y reseñas de clientes';
COMMENT ON TABLE contact_messages IS 'Mensajes de contacto de clientes potenciales';
COMMENT ON TABLE tour_reviews IS 'Reseñas específicas de tours realizados por clientes';

COMMENT ON COLUMN tours.highlights IS 'Puntos destacados del tour (array de strings)';
COMMENT ON COLUMN tours.rating IS 'Calificación promedio del tour (0-5)';
COMMENT ON COLUMN tours.reviews IS 'Número total de reseñas verificadas';
COMMENT ON COLUMN testimonials.source IS 'Fuente del testimonio (Google, TripAdvisor, etc.)';
COMMENT ON COLUMN bookings.origin_place_id IS 'ID de Google Places para el origen';
COMMENT ON COLUMN bookings.destination_place_id IS 'ID de Google Places para el destino';
COMMENT ON COLUMN bookings.origin_coords IS 'Coordenadas del origen (lat, lng)';
COMMENT ON COLUMN bookings.destination_coords IS 'Coordenadas del destino (lat, lng)';
