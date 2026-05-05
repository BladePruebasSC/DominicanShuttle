-- =====================================================
-- Dominican Shuttle - Crear tabla feedback post-viaje
-- =====================================================
-- Guarda encuestas internas asociadas a reservas.
-- Idempotente y lista para automatizaciones (Make/Zapier).

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  improvement TEXT,
  source TEXT DEFAULT 'internal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asegurar columnas si la tabla ya existe parcialmente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feedback' AND column_name = 'booking_id'
  ) THEN
    ALTER TABLE feedback ADD COLUMN booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feedback' AND column_name = 'rating'
  ) THEN
    ALTER TABLE feedback ADD COLUMN rating INTEGER CHECK (rating >= 1 AND rating <= 5);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feedback' AND column_name = 'comment'
  ) THEN
    ALTER TABLE feedback ADD COLUMN comment TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feedback' AND column_name = 'improvement'
  ) THEN
    ALTER TABLE feedback ADD COLUMN improvement TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feedback' AND column_name = 'source'
  ) THEN
    ALTER TABLE feedback ADD COLUMN source TEXT DEFAULT 'internal';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feedback' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE feedback ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_feedback_booking_id ON feedback (booking_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback (rating);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback (created_at DESC);
