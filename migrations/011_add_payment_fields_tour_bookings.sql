-- =====================================================
-- Dominican Shuttle - Campos de pago (reservas de tours)
-- =====================================================
-- Agrega campos para total y preferencia de pago (sin procesar pagos aún).
-- Idempotente.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tour_bookings' AND column_name = 'total_price'
  ) THEN
    ALTER TABLE tour_bookings ADD COLUMN total_price DECIMAL(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tour_bookings' AND column_name = 'currency'
  ) THEN
    ALTER TABLE tour_bookings ADD COLUMN currency TEXT DEFAULT 'USD';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tour_bookings' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE tour_bookings ADD COLUMN payment_method TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tour_bookings' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE tour_bookings ADD COLUMN payment_status TEXT DEFAULT 'pending';
  END IF;
END $$;

