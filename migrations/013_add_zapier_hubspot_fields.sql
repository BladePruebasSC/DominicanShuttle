-- =====================================================
-- Dominican Shuttle - Campos Zapier/HubSpot
-- =====================================================
-- Agrega columnas de integración (idempotente).

DO $$
BEGIN
  -- bookings
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'lead_source'
  ) THEN
    ALTER TABLE bookings ADD COLUMN lead_source TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'zapier_lead_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN zapier_lead_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'hubspot_deal_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN hubspot_deal_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'hubspot_contact_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN hubspot_contact_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'confirmed_at'
  ) THEN
    ALTER TABLE bookings ADD COLUMN confirmed_at TIMESTAMP;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'paid_at'
  ) THEN
    ALTER TABLE bookings ADD COLUMN paid_at TIMESTAMP;
  END IF;

  -- tour_bookings
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tour_bookings' AND column_name = 'lead_source'
  ) THEN
    ALTER TABLE tour_bookings ADD COLUMN lead_source TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tour_bookings' AND column_name = 'zapier_lead_id'
  ) THEN
    ALTER TABLE tour_bookings ADD COLUMN zapier_lead_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tour_bookings' AND column_name = 'hubspot_deal_id'
  ) THEN
    ALTER TABLE tour_bookings ADD COLUMN hubspot_deal_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tour_bookings' AND column_name = 'hubspot_contact_id'
  ) THEN
    ALTER TABLE tour_bookings ADD COLUMN hubspot_contact_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tour_bookings' AND column_name = 'confirmed_at'
  ) THEN
    ALTER TABLE tour_bookings ADD COLUMN confirmed_at TIMESTAMP;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tour_bookings' AND column_name = 'paid_at'
  ) THEN
    ALTER TABLE tour_bookings ADD COLUMN paid_at TIMESTAMP;
  END IF;

  -- contact_messages
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_messages' AND column_name = 'lead_source'
  ) THEN
    ALTER TABLE contact_messages ADD COLUMN lead_source TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_messages' AND column_name = 'zapier_lead_id'
  ) THEN
    ALTER TABLE contact_messages ADD COLUMN zapier_lead_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_messages' AND column_name = 'hubspot_deal_id'
  ) THEN
    ALTER TABLE contact_messages ADD COLUMN hubspot_deal_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_messages' AND column_name = 'hubspot_contact_id'
  ) THEN
    ALTER TABLE contact_messages ADD COLUMN hubspot_contact_id TEXT;
  END IF;
END $$;

