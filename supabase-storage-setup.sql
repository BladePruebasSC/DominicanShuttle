-- =====================================================
-- Configuración de Supabase Storage para Dominican Shuttle
-- =====================================================
-- Este archivo configura los buckets de almacenamiento
-- para las imágenes de la aplicación

-- =====================================================
-- CREAR BUCKETS DE ALMACENAMIENTO
-- =====================================================

-- Crear bucket para imágenes generales
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880, -- 5MB en bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
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
-- FUNCIONES AUXILIARES PARA GESTIÓN DE IMÁGENES
-- =====================================================

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

-- =====================================================
-- TRIGGERS PARA LIMPIEZA AUTOMÁTICA
-- =====================================================

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
-- COMENTARIOS
-- =====================================================

COMMENT ON FUNCTION get_public_image_url IS 'Obtiene la URL pública de una imagen almacenada';
COMMENT ON FUNCTION cleanup_orphaned_images IS 'Limpia imágenes huérfanas del storage';
COMMENT ON FUNCTION delete_image_from_storage IS 'Elimina imagen del storage cuando se elimina de la base de datos';
