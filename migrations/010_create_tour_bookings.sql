-- =====================================================
-- Dominican Shuttle - Crear tabla de reservas de tours
-- =====================================================
-- Tabla separada para reservas de tours (no transporte).
-- Idempotente.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS tour_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  tour_name TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  tour_date TIMESTAMP WITH TIME ZONE NOT NULL,
  participants INTEGER NOT NULL DEFAULT 1 CHECK (participants > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_tour_bookings_customer_email ON tour_bookings (customer_email);
CREATE INDEX IF NOT EXISTS idx_tour_bookings_tour_id ON tour_bookings (tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_bookings_tour_date ON tour_bookings (tour_date);

-- Trigger updated_at (usa función existente si ya está creada por 007)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    DROP TRIGGER IF EXISTS set_updated_at_tour_bookings ON tour_bookings;
    CREATE TRIGGER set_updated_at_tour_bookings
      BEFORE UPDATE ON tour_bookings
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

