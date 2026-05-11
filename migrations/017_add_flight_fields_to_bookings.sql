-- =====================================================
-- Dominican Shuttle - Campos de vuelo en bookings
-- =====================================================
-- Guarda datos estructurados de vuelo verificado para operación.

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS flight_number TEXT,
  ADD COLUMN IF NOT EXISTS flight_date DATE,
  ADD COLUMN IF NOT EXISTS flight_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS flight_status TEXT,
  ADD COLUMN IF NOT EXISTS flight_airline TEXT,
  ADD COLUMN IF NOT EXISTS flight_departure_iata TEXT,
  ADD COLUMN IF NOT EXISTS flight_arrival_iata TEXT;

CREATE INDEX IF NOT EXISTS idx_bookings_flight_number ON bookings (flight_number);
CREATE INDEX IF NOT EXISTS idx_bookings_flight_date ON bookings (flight_date);
CREATE INDEX IF NOT EXISTS idx_bookings_flight_verified ON bookings (flight_verified);
