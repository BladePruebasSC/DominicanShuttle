-- =====================================================
-- Dominican Shuttle - Gestión de Imágenes
-- =====================================================
-- Esta migración crea las tablas necesarias para gestionar
-- imágenes de tours, vehículos y página principal

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
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Triggers para las nuevas tablas
CREATE TRIGGER update_tour_images_updated_at BEFORE UPDATE ON tour_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicle_images_updated_at BEFORE UPDATE ON vehicle_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_homepage_images_updated_at BEFORE UPDATE ON homepage_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_image_settings_updated_at BEFORE UPDATE ON image_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCIONES AUXILIARES
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
('hero_slider_interval', '5000', 'Intervalo del slider en milisegundos')
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- COMENTARIOS EN TABLAS
-- =====================================================

COMMENT ON TABLE tour_images IS 'Imágenes asociadas a tours y excursiones';
COMMENT ON TABLE vehicle_images IS 'Imágenes de la flota de vehículos';
COMMENT ON TABLE homepage_images IS 'Imágenes para las diferentes secciones de la página principal';
COMMENT ON TABLE image_settings IS 'Configuraciones para la gestión de imágenes';

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
