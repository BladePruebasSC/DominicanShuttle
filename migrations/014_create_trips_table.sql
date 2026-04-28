-- =====================================================
-- Dominican Shuttle - Crear tabla trips (HyperTrack)
-- =====================================================
-- Tabla para registrar el ciclo de viaje asociado a una reserva.
-- Compatible con automatizaciones Make + HyperTrack.
-- Idempotente.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  hypertrack_trip_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'arriving', 'completed', 'cancelled')),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_real INTEGER,
  client_shared BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asegurar columnas si la tabla ya existía con estructura parcial
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trips' AND column_name = 'booking_id'
  ) THEN
    ALTER TABLE trips ADD COLUMN booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trips' AND column_name = 'hypertrack_trip_id'
  ) THEN
    ALTER TABLE trips ADD COLUMN hypertrack_trip_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trips' AND column_name = 'status'
  ) THEN
    ALTER TABLE trips ADD COLUMN status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'in_progress', 'arriving', 'completed', 'cancelled'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trips' AND column_name = 'start_time'
  ) THEN
    ALTER TABLE trips ADD COLUMN start_time TIMESTAMP WITH TIME ZONE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trips' AND column_name = 'end_time'
  ) THEN
    ALTER TABLE trips ADD COLUMN end_time TIMESTAMP WITH TIME ZONE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trips' AND column_name = 'duration_real'
  ) THEN
    ALTER TABLE trips ADD COLUMN duration_real INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trips' AND column_name = 'client_shared'
  ) THEN
    ALTER TABLE trips ADD COLUMN client_shared BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trips' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE trips ADD COLUMN metadata JSONB;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trips' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE trips ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trips' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE trips ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Índices útiles para automatizaciones y dashboard
CREATE INDEX IF NOT EXISTS idx_trips_booking_id ON trips (booking_id);
CREATE INDEX IF NOT EXISTS idx_trips_hypertrack_trip_id ON trips (hypertrack_trip_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips (status);
CREATE INDEX IF NOT EXISTS idx_trips_created_at ON trips (created_at DESC);

-- Trigger updated_at (usa función existente si ya fue creada en otra migración)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    DROP TRIGGER IF EXISTS set_updated_at_trips ON trips;
    CREATE TRIGGER set_updated_at_trips
      BEFORE UPDATE ON trips
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

