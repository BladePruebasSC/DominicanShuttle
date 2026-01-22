-- =====================================================
-- Dominican Shuttle - Seed Tours (Punta Cana)
-- =====================================================
-- Inserta/actualiza los tours más importantes saliendo desde Punta Cana.
-- Es idempotente: si se ejecuta varias veces, actualiza los registros por ID.

-- Asegurar extensión para UUID (por si este seed se ejecuta aislado)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Asegurar columnas extendidas (compatibilidad con DBs que tengan schema previo)
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
-- TOURS TOP - PUNTA CANA
-- =====================================================
INSERT INTO tours (
  id,
  name,
  description,
  duration,
  price,
  includes,
  highlights,
  image_url,
  category,
  popular,
  max_participants,
  min_participants,
  difficulty_level,
  is_active,
  rating,
  reviews
) VALUES
(
  '880e8400-e29b-41d4-a716-446655440101',
  'Isla Catalina + Snorkel',
  'Excursión de día completo a Isla Catalina con paradas de snorkeling en arrecifes y tiempo libre en la playa. Ideal si estás en Punta Cana y quieres mar cristalino y vida marina.',
  '9 horas',
  89.00,
  '["Transporte ida y vuelta desde Punta Cana", "Paseo en catamarán o lancha", "Snorkeling (equipo incluido)", "Almuerzo tipo buffet", "Bebidas incluidas", "Guía turístico"]'::jsonb,
  '["Isla Catalina", "Arrecifes para snorkeling", "Playa y relax", "Fotos increíbles"]'::jsonb,
  'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80',
  'beach',
  true,
  60,
  2,
  'easy',
  true,
  4.8,
  420
),
(
  '880e8400-e29b-41d4-a716-446655440102',
  'Catamarán Party Bávaro (Snorkel + Piscina Natural)',
  'Navega por la costa de Bávaro en catamarán con música, bebidas, snorkeling y parada en la piscina natural. La excursión clásica de Punta Cana.',
  '4 horas',
  59.00,
  '["Transporte desde hoteles en Punta Cana/Bávaro", "Catamarán", "Equipo de snorkeling", "Bar abierto (bebidas)", "Animación a bordo", "Parada piscina natural"]'::jsonb,
  '["Snorkeling", "Piscina natural", "Bar abierto", "Fiesta en catamarán"]'::jsonb,
  'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1400&q=80',
  'beach',
  true,
  80,
  2,
  'easy',
  true,
  4.7,
  980
),
(
  '880e8400-e29b-41d4-a716-446655440103',
  'Buggies Aventura (Cueva + Playa Macao)',
  'Aventura en buggies/ATV por caminos rurales, visita a cueva y parada en Playa Macao. Perfecto para quienes quieren adrenalina en Punta Cana.',
  '4 horas',
  65.00,
  '["Transporte desde hoteles", "Buggy/ATV (doble o individual según selección)", "Casco y equipo básico", "Guía", "Parada en cueva", "Visita a Playa Macao"]'::jsonb,
  '["Off-road", "Playa Macao", "Cueva", "Paisajes rurales"]'::jsonb,
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=80',
  'adventure',
  true,
  60,
  1,
  'medium',
  true,
  4.6,
  760
),
(
  '880e8400-e29b-41d4-a716-446655440104',
  'Monkeyland + Safari Cultural',
  'Visita Monkeyland para interactuar con monos ardilla en su hábitat, combinada con un recorrido cultural/safari por el campo dominicano.',
  '6 horas',
  79.00,
  '["Transporte desde Punta Cana", "Entrada a Monkeyland", "Guía", "Degustación de café/cacao", "Paradas culturales"]'::jsonb,
  '["Monkeyland", "Café y cacao", "Safari cultural", "Fotos y naturaleza"]'::jsonb,
  'https://images.unsplash.com/photo-1456926631375-92c8ce872def?auto=format&fit=crop&w=1400&q=80',
  'nature',
  true,
  40,
  2,
  'easy',
  true,
  4.7,
  610
),
(
  '880e8400-e29b-41d4-a716-446655440105',
  'Avistamiento de Ballenas (Samaná) desde Punta Cana',
  'Excursión de día completo a Samaná en temporada para ver ballenas jorobadas, con paradas panorámicas y experiencia guiada.',
  '12 horas',
  149.00,
  '["Transporte ida y vuelta desde Punta Cana", "Paseo en barco", "Guía especializado", "Almuerzo", "Entradas/permiso (según operador)"]'::jsonb,
  '["Ballenas jorobadas (temporada)", "Bahía de Samaná", "Paseo en barco", "Naturaleza"]'::jsonb,
  'https://images.unsplash.com/photo-1454997423871-b5215756e54d?auto=format&fit=crop&w=1400&q=80',
  'nature',
  false,
  60,
  2,
  'easy',
  true,
  4.8,
  210
),
(
  '880e8400-e29b-41d4-a716-446655440106',
  'Coco Bongo Punta Cana (Entrada)',
  'Show nocturno con acrobacias, música y ambiente de fiesta en el famoso Coco Bongo. Ideal para una noche en Punta Cana.',
  '3 horas',
  99.00,
  '["Entrada al show", "Bebidas incluidas (según tipo de entrada)", "Asistencia en puerta"]'::jsonb,
  '["Show en vivo", "Acrobacias", "Música", "Noche inolvidable"]'::jsonb,
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1400&q=80',
  'city',
  true,
  200,
  1,
  'easy',
  true,
  4.6,
  540
),
(
  '880e8400-e29b-41d4-a716-446655440107',
  'Cena Crucero (Caribbean Night)',
  'Crucero nocturno con cena, música y vista al mar Caribe. Una opción romántica y elegante en Punta Cana.',
  '3.5 horas',
  110.00,
  '["Crucero nocturno", "Cena", "Música/entretenimiento", "Bebidas (según paquete)"]'::jsonb,
  '["Atardecer y noche caribeña", "Cena a bordo", "Música en vivo", "Ambiente romántico"]'::jsonb,
  'https://images.unsplash.com/photo-1521337581100-8ca9a73a5b3c?auto=format&fit=crop&w=1400&q=80',
  'city',
  false,
  120,
  2,
  'easy',
  true,
  4.5,
  190
),
(
  '880e8400-e29b-41d4-a716-446655440108',
  'Horseback Riding en Playa Macao',
  'Paseo a caballo guiado por senderos y costa, con parada en la playa. Experiencia tranquila y fotogénica cerca de Punta Cana.',
  '2.5 horas',
  55.00,
  '["Transporte desde hoteles (según zona)", "Paseo a caballo guiado", "Equipo básico", "Guía"]'::jsonb,
  '["Paseo a caballo", "Playa Macao", "Fotos", "Naturaleza"]'::jsonb,
  'https://images.unsplash.com/photo-1501706362039-c6e13d9b7f25?auto=format&fit=crop&w=1400&q=80',
  'nature',
  false,
  30,
  1,
  'easy',
  true,
  4.4,
  260
),
(
  '880e8400-e29b-41d4-a716-446655440109',
  'Tour Santo Domingo (Zona Colonial) desde Punta Cana',
  'Viaje de un día a Santo Domingo para conocer la Zona Colonial, museos y lugares históricos. Perfecto si quieres cultura saliendo desde Punta Cana.',
  '11 horas',
  99.00,
  '["Transporte ida y vuelta desde Punta Cana", "Guía", "Paradas históricas", "Almuerzo", "Entradas (según itinerario)"]'::jsonb,
  '["Zona Colonial", "Historia y cultura", "Monumentos", "Recorrido guiado"]'::jsonb,
  'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1400&q=80',
  'cultural',
  true,
  40,
  2,
  'easy',
  true,
  4.7,
  330
),
(
  '880e8400-e29b-41d4-a716-446655440110',
  'Dolphin Encounter Punta Cana',
  'Experiencia guiada para interactuar con delfines (opciones según disponibilidad del parque). Ideal para familias en Punta Cana.',
  '2 horas',
  129.00,
  '["Entrada/experiencia con delfines", "Instrucción y seguridad", "Chaleco/uso de instalaciones (según parque)"]'::jsonb,
  '["Delfines", "Ideal para familias", "Experiencia guiada", "Recuerdo inolvidable"]'::jsonb,
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80',
  'nature',
  true,
  25,
  1,
  'easy',
  true,
  4.5,
  410
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  duration = EXCLUDED.duration,
  price = EXCLUDED.price,
  includes = EXCLUDED.includes,
  highlights = EXCLUDED.highlights,
  image_url = EXCLUDED.image_url,
  category = EXCLUDED.category,
  popular = EXCLUDED.popular,
  max_participants = EXCLUDED.max_participants,
  min_participants = EXCLUDED.min_participants,
  difficulty_level = EXCLUDED.difficulty_level,
  is_active = EXCLUDED.is_active,
  rating = EXCLUDED.rating,
  reviews = EXCLUDED.reviews,
  updated_at = NOW();

