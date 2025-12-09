-- =====================================================
-- Dominican Shuttle - Migración Completa de Gestión de Imágenes
-- =====================================================
-- Esta migración incluye todas las tablas, funciones, políticas y configuraciones
-- necesarias para el sistema completo de gestión de imágenes

-- =====================================================
-- TABLA DE IMÁGENES DE TOURS
-- =====================================================
CREATE TABLE IF NOT EXISTS tour_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    caption TEXT,
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE IMÁGENES DE VEHÍCULOS
-- =====================================================
CREATE TABLE IF NOT EXISTS vehicle_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    caption TEXT,
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE IMÁGENES DE LA PÁGINA PRINCIPAL
-- =====================================================
CREATE TABLE IF NOT EXISTS homepage_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section TEXT NOT NULL CHECK (section IN ('hero', 'services', 'testimonials', 'about', 'gallery')),
    image_url TEXT NOT NULL,
    alt_text TEXT,
    caption TEXT,
    title TEXT,
    subtitle TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE CONFIGURACIÓN DE IMÁGENES
-- =====================================================
CREATE TABLE IF NOT EXISTS image_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para tour_images
CREATE INDEX IF NOT EXISTS idx_tour_images_tour_id ON tour_images(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_images_primary ON tour_images(tour_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_tour_images_order ON tour_images(tour_id, display_order);

-- Índices para vehicle_images
CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id ON vehicle_images(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_primary ON vehicle_images(vehicle_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_order ON vehicle_images(vehicle_id, display_order);

-- Índices para homepage_images
CREATE INDEX IF NOT EXISTS idx_homepage_images_section ON homepage_images(section);
CREATE INDEX IF NOT EXISTS idx_homepage_images_active ON homepage_images(is_active);
CREATE INDEX IF NOT EXISTS idx_homepage_images_order ON homepage_images(section, display_order);

-- =====================================================
-- FUNCIÓN PARA ACTUALIZAR UPDATED_AT
-- =====================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Triggers para las nuevas tablas
CREATE TRIGGER update_tour_images_updated_at BEFORE UPDATE ON tour_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicle_images_updated_at BEFORE UPDATE ON vehicle_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_homepage_images_updated_at BEFORE UPDATE ON homepage_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_image_settings_updated_at BEFORE UPDATE ON image_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCIONES AUXILIARES PARA GESTIÓN DE IMÁGENES
-- =====================================================

-- Función para obtener la imagen principal de un tour
CREATE OR REPLACE FUNCTION get_tour_primary_image(tour_uuid UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT image_url 
        FROM tour_images 
        WHERE tour_id = tour_uuid AND is_primary = true 
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql;

-- Función para obtener la imagen principal de un vehículo
CREATE OR REPLACE FUNCTION get_vehicle_primary_image(vehicle_uuid UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT image_url 
        FROM vehicle_images 
        WHERE vehicle_id = vehicle_uuid AND is_primary = true 
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql;

-- Función para obtener imágenes de una sección de la página principal
CREATE OR REPLACE FUNCTION get_homepage_section_images(section_name TEXT)
RETURNS TABLE (
    id UUID,
    image_url TEXT,
    alt_text TEXT,
    caption TEXT,
    title TEXT,
    subtitle TEXT,
    display_order INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        hi.id,
        hi.image_url,
        hi.alt_text,
        hi.caption,
        hi.title,
        hi.subtitle,
        hi.display_order
    FROM homepage_images hi
    WHERE hi.section = section_name 
    AND hi.is_active = true
    ORDER BY hi.display_order ASC;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener URL pública de una imagen
CREATE OR REPLACE FUNCTION get_public_image_url(bucket_name TEXT, file_path TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT storage.objects.name
    FROM storage.objects
    WHERE storage.objects.bucket_id = bucket_name
    AND storage.objects.name = file_path
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para limpiar imágenes huérfanas
CREATE OR REPLACE FUNCTION cleanup_orphaned_images()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  image_record RECORD;
BEGIN
  -- Buscar imágenes en storage que no están referenciadas en las tablas
  FOR image_record IN
    SELECT name FROM storage.objects
    WHERE bucket_id = 'images'
    AND name NOT IN (
      SELECT DISTINCT image_url FROM tour_images
      UNION
      SELECT DISTINCT image_url FROM vehicle_images
      UNION
      SELECT DISTINCT image_url FROM homepage_images
    )
  LOOP
    -- Eliminar imagen huérfana
    DELETE FROM storage.objects
    WHERE bucket_id = 'images' AND name = image_record.name;
    
    deleted_count := deleted_count + 1;
  END LOOP;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para eliminar imagen de storage cuando se elimina de la base de datos
CREATE OR REPLACE FUNCTION delete_image_from_storage()
RETURNS TRIGGER AS $$
DECLARE
  image_path TEXT;
BEGIN
  -- Extraer la ruta del archivo de la URL
  IF OLD.image_url IS NOT NULL THEN
    image_path := split_part(OLD.image_url, '/', -2) || '/' || split_part(OLD.image_url, '/', -1);
    
    -- Eliminar de storage
    DELETE FROM storage.objects
    WHERE bucket_id = 'images' AND name = image_path;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS PARA LIMPIEZA AUTOMÁTICA DE STORAGE
-- =====================================================

-- Triggers para eliminar imágenes de storage automáticamente
CREATE TRIGGER delete_tour_image_from_storage
  AFTER DELETE ON tour_images
  FOR EACH ROW EXECUTE FUNCTION delete_image_from_storage();

CREATE TRIGGER delete_vehicle_image_from_storage
  AFTER DELETE ON vehicle_images
  FOR EACH ROW EXECUTE FUNCTION delete_image_from_storage();

CREATE TRIGGER delete_homepage_image_from_storage
  AFTER DELETE ON homepage_images
  FOR EACH ROW EXECUTE FUNCTION delete_image_from_storage();

-- =====================================================
-- CONFIGURACIÓN DE STORAGE
-- =====================================================

-- Crear bucket para imágenes generales
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880, -- 5MB en bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS en las tablas de imágenes
ALTER TABLE tour_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para lectura pública de imágenes
CREATE POLICY "Imágenes de tours son visibles públicamente" ON tour_images FOR SELECT USING (true);
CREATE POLICY "Imágenes de vehículos son visibles públicamente" ON vehicle_images FOR SELECT USING (true);
CREATE POLICY "Imágenes de página principal son visibles públicamente" ON homepage_images FOR SELECT USING (is_active = true);

-- Políticas para administradores (asumiendo que tienes un sistema de roles)
CREATE POLICY "Administradores pueden gestionar imágenes de tours" ON tour_images FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

CREATE POLICY "Administradores pueden gestionar imágenes de vehículos" ON vehicle_images FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

CREATE POLICY "Administradores pueden gestionar imágenes de página principal" ON homepage_images FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

CREATE POLICY "Administradores pueden gestionar configuraciones de imágenes" ON image_settings FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

-- =====================================================
-- POLÍTICAS DE ALMACENAMIENTO
-- =====================================================

-- Política para permitir lectura pública de imágenes
CREATE POLICY "Imágenes son visibles públicamente" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- Política para permitir subida de imágenes a administradores
CREATE POLICY "Administradores pueden subir imágenes" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Política para permitir actualización de imágenes a administradores
CREATE POLICY "Administradores pueden actualizar imágenes" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'images' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Política para permitir eliminación de imágenes a administradores
CREATE POLICY "Administradores pueden eliminar imágenes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar configuraciones por defecto
INSERT INTO image_settings (setting_key, setting_value, description) VALUES
('max_image_size_mb', '5', 'Tamaño máximo de imagen en MB'),
('allowed_formats', '["jpg", "jpeg", "png", "webp"]', 'Formatos de imagen permitidos'),
('image_quality', '85', 'Calidad de compresión de imágenes'),
('thumbnail_size', '{"width": 300, "height": 200}', 'Tamaño de miniaturas'),
('hero_slider_autoplay', 'true', 'Autoplay del slider hero'),
('hero_slider_interval', '5000', 'Intervalo del slider en milisegundos'),
('max_images_per_tour', '10', 'Máximo de imágenes por tour'),
('max_images_per_vehicle', '8', 'Máximo de imágenes por vehículo'),
('max_images_per_section', '20', 'Máximo de imágenes por sección de página principal'),
('auto_optimize_images', 'true', 'Optimización automática de imágenes'),
('generate_thumbnails', 'true', 'Generación automática de miniaturas')
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- COMENTARIOS EN TABLAS Y FUNCIONES
-- =====================================================

COMMENT ON TABLE tour_images IS 'Imágenes asociadas a tours y excursiones';
COMMENT ON TABLE vehicle_images IS 'Imágenes de la flota de vehículos';
COMMENT ON TABLE homepage_images IS 'Imágenes para las diferentes secciones de la página principal';
COMMENT ON TABLE image_settings IS 'Configuraciones para la gestión de imágenes';

COMMENT ON FUNCTION get_tour_primary_image IS 'Obtiene la URL de la imagen principal de un tour';
COMMENT ON FUNCTION get_vehicle_primary_image IS 'Obtiene la URL de la imagen principal de un vehículo';
COMMENT ON FUNCTION get_homepage_section_images IS 'Obtiene todas las imágenes activas de una sección de la página principal';
COMMENT ON FUNCTION get_public_image_url IS 'Obtiene la URL pública de una imagen almacenada';
COMMENT ON FUNCTION cleanup_orphaned_images IS 'Limpia imágenes huérfanas del storage';
COMMENT ON FUNCTION delete_image_from_storage IS 'Elimina imagen del storage cuando se elimina de la base de datos';

-- =====================================================
-- VERIFICACIÓN DE INSTALACIÓN
-- =====================================================

-- Verificar que todas las tablas se crearon correctamente
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('tour_images', 'vehicle_images', 'homepage_images', 'image_settings');
    
    IF table_count = 4 THEN
        RAISE NOTICE '✅ Todas las tablas de imágenes se crearon correctamente';
    ELSE
        RAISE WARNING '⚠️  Algunas tablas no se crearon. Verificar errores.';
    END IF;
END $$;

-- Verificar que el bucket de storage se creó
DO $$
DECLARE
    bucket_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM storage.buckets WHERE id = 'images'
    ) INTO bucket_exists;
    
    IF bucket_exists THEN
        RAISE NOTICE '✅ Bucket de imágenes creado correctamente';
    ELSE
        RAISE WARNING '⚠️  Bucket de imágenes no encontrado. Verificar configuración.';
    END IF;
END $$;

-- Verificar configuraciones iniciales
DO $$
DECLARE
    settings_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO settings_count FROM image_settings;
    
    IF settings_count > 0 THEN
        RAISE NOTICE '✅ Configuraciones iniciales insertadas: % registros', settings_count;
    ELSE
        RAISE WARNING '⚠️  No se insertaron configuraciones iniciales.';
    END IF;
END $$;

-- =====================================================
-- MENSAJE FINAL
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 Migración completa de gestión de imágenes finalizada exitosamente!';
    RAISE NOTICE '📋 Próximos pasos:';
    RAISE NOTICE '   1. Verificar que el bucket "images" esté configurado en Supabase Storage';
    RAISE NOTICE '   2. Configurar las variables de entorno de Supabase';
    RAISE NOTICE '   3. Acceder al dashboard en /admin';
    RAISE NOTICE '   4. Comenzar a subir y gestionar imágenes';
END $$;
