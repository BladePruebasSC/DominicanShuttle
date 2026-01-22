-- =====================================================
-- Dominican Shuttle - Seed Flota (Vehículos)
-- =====================================================
-- Inserta/actualiza vehículos principales para la flota.
-- Idempotente: ON CONFLICT (id) DO UPDATE.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Asegurar columnas extendidas (si el schema es previo)
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

INSERT INTO vehicles (
  id,
  name,
  type,
  capacity,
  luggage_capacity,
  capacity_text,
  luggage_text,
  base_price,
  features,
  image_url,
  license_plate,
  year,
  color,
  available
) VALUES
(
  '770e8400-e29b-41d4-a716-446655440201',
  'Sedán Económico',
  'sedan',
  3,
  2,
  '1-3 pasajeros',
  '1-2 maletas',
  35.00,
  '["Aire acondicionado", "Conductor profesional", "Agua gratis", "Asistencia con equipaje"]'::jsonb,
  'https://images.unsplash.com/photo-1550355291-bbee519a034a?q=80&w=1200&auto=format&fit=crop',
  'DTP-SED-001',
  2023,
  'Blanco',
  true
),
(
  '770e8400-e29b-41d4-a716-446655440202',
  'SUV Premium',
  'suv',
  6,
  4,
  '4-6 pasajeros',
  '3-5 maletas',
  60.00,
  '["A/C", "Asientos cómodos", "WiFi (según disponibilidad)", "Cargadores USB"]'::jsonb,
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
  'DTP-SUV-001',
  2024,
  'Negro',
  true
),
(
  '770e8400-e29b-41d4-a716-446655440203',
  'Van Grupal',
  'van',
  12,
  8,
  '7-12 pasajeros',
  '6-10 maletas',
  120.00,
  '["A/C", "Amplio espacio", "Asientos cómodos", "Ideal para familias y grupos"]'::jsonb,
  'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1200&auto=format&fit=crop',
  'DTP-VAN-001',
  2023,
  'Azul',
  true
),
(
  '770e8400-e29b-41d4-a716-446655440204',
  'Autobús Ejecutivo',
  'bus',
  25,
  15,
  '15-25 pasajeros',
  '12-20 maletas',
  200.00,
  '["A/C dual", "Asientos reclinables", "Espacio para grupos", "Conductor profesional"]'::jsonb,
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200&auto=format&fit=crop',
  'DTP-BUS-001',
  2022,
  'Gris',
  true
),
(
  '770e8400-e29b-41d4-a716-446655440205',
  'SUV Lujo (Executive)',
  'suv',
  4,
  3,
  '1-4 pasajeros (VIP)',
  '2-4 maletas',
  150.00,
  '["Vehículo premium", "Conductor ejecutivo", "Agua premium", "Cargadores USB"]'::jsonb,
  'https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=1200&auto=format&fit=crop',
  'DTP-VIP-001',
  2024,
  'Plateado',
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  capacity = EXCLUDED.capacity,
  luggage_capacity = EXCLUDED.luggage_capacity,
  capacity_text = EXCLUDED.capacity_text,
  luggage_text = EXCLUDED.luggage_text,
  base_price = EXCLUDED.base_price,
  features = EXCLUDED.features,
  image_url = EXCLUDED.image_url,
  license_plate = EXCLUDED.license_plate,
  year = EXCLUDED.year,
  color = EXCLUDED.color,
  available = EXCLUDED.available,
  updated_at = NOW();

