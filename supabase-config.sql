-- =====================================================
-- Configuración de Supabase para Dominican Shuttle
-- =====================================================
-- Este archivo contiene configuraciones adicionales para Supabase

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS DE SEGURIDAD
-- =====================================================

-- Políticas para usuarios
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Políticas para vehículos (público puede leer, solo admin puede escribir)
CREATE POLICY "Anyone can view vehicles" ON vehicles
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify vehicles" ON vehicles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Políticas para servicios (público puede leer, solo admin puede escribir)
CREATE POLICY "Anyone can view services" ON services
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify services" ON services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Políticas para rutas (público puede leer, solo admin puede escribir)
CREATE POLICY "Anyone can view routes" ON routes
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify routes" ON routes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Políticas para tours (público puede leer, solo admin puede escribir)
CREATE POLICY "Anyone can view tours" ON tours
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify tours" ON tours
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Políticas para reservas
CREATE POLICY "Anyone can create bookings" ON bookings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own bookings" ON bookings
    FOR SELECT USING (customer_email = auth.jwt() ->> 'email');

CREATE POLICY "Admins can view all bookings" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can modify bookings" ON bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Políticas para testimonios (público puede leer y crear, solo admin puede modificar)
CREATE POLICY "Anyone can view testimonials" ON testimonials
    FOR SELECT USING (true);

CREATE POLICY "Anyone can create testimonials" ON testimonials
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can modify testimonials" ON testimonials
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Políticas para mensajes de contacto
CREATE POLICY "Anyone can create contact messages" ON contact_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can view contact messages" ON contact_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can modify contact messages" ON contact_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Políticas para configuraciones (solo admin puede acceder)
CREATE POLICY "Only admins can access settings" ON settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- =====================================================
-- FUNCIONES DE UTILIDAD
-- =====================================================

-- Función para obtener el precio de una ruta
CREATE OR REPLACE FUNCTION get_route_price(
    p_origin TEXT,
    p_destination TEXT,
    p_vehicle_type TEXT DEFAULT 'sedan'
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    route_price DECIMAL(10,2);
    vehicle_multiplier DECIMAL(3,2);
BEGIN
    -- Obtener precio base de la ruta
    SELECT base_price INTO route_price
    FROM routes
    WHERE origin = p_origin 
    AND destination = p_destination 
    AND is_active = true;
    
    -- Si no se encuentra la ruta, retornar 0
    IF route_price IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Aplicar multiplicador según tipo de vehículo
    CASE p_vehicle_type
        WHEN 'sedan' THEN vehicle_multiplier := 1.0;
        WHEN 'suv' THEN vehicle_multiplier := 1.5;
        WHEN 'van' THEN vehicle_multiplier := 2.5;
        WHEN 'bus' THEN vehicle_multiplier := 4.0;
        ELSE vehicle_multiplier := 1.0;
    END CASE;
    
    RETURN route_price * vehicle_multiplier;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar disponibilidad de vehículo
CREATE OR REPLACE FUNCTION check_vehicle_availability(
    p_vehicle_id UUID,
    p_pickup_date TIMESTAMP WITH TIME ZONE,
    p_return_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    conflicting_bookings INTEGER;
BEGIN
    -- Verificar si hay reservas conflictivas
    SELECT COUNT(*) INTO conflicting_bookings
    FROM bookings
    WHERE vehicle_id = p_vehicle_id
    AND status IN ('confirmed', 'in_progress')
    AND (
        (pickup_date <= p_pickup_date AND (return_date IS NULL OR return_date >= p_pickup_date))
        OR
        (p_return_date IS NOT NULL AND pickup_date <= p_return_date AND (return_date IS NULL OR return_date >= p_return_date))
    );
    
    RETURN conflicting_bookings = 0;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- WEBHOOKS Y NOTIFICACIONES
-- =====================================================

-- Función para notificar nuevas reservas
CREATE OR REPLACE FUNCTION notify_new_booking()
RETURNS TRIGGER AS $$
BEGIN
    -- Aquí puedes agregar lógica para enviar notificaciones
    -- Por ejemplo, webhooks, emails, etc.
    
    -- Log de la nueva reserva
    RAISE LOG 'Nueva reserva creada: %', NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para notificar nuevas reservas
CREATE TRIGGER trigger_notify_new_booking
    AFTER INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_booking();

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista para estadísticas de reservas
CREATE OR REPLACE VIEW booking_stats AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
    SUM(estimated_price) as total_revenue,
    AVG(estimated_price) as avg_booking_value
FROM bookings
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Vista para vehículos disponibles
CREATE OR REPLACE VIEW available_vehicles AS
SELECT 
    v.*,
    u.full_name as driver_name,
    u.phone as driver_phone
FROM vehicles v
LEFT JOIN users u ON v.driver_id = u.id
WHERE v.available = true;

-- Vista para tours populares
CREATE OR REPLACE VIEW popular_tours AS
SELECT *
FROM tours
WHERE popular = true AND is_active = true
ORDER BY price ASC;

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================

COMMENT ON FUNCTION get_route_price IS 'Calcula el precio de una ruta según origen, destino y tipo de vehículo';
COMMENT ON FUNCTION check_vehicle_availability IS 'Verifica si un vehículo está disponible en un rango de fechas';
COMMENT ON FUNCTION notify_new_booking IS 'Notifica cuando se crea una nueva reserva';
COMMENT ON VIEW booking_stats IS 'Estadísticas mensuales de reservas';
COMMENT ON VIEW available_vehicles IS 'Vehículos disponibles con información del conductor';
COMMENT ON VIEW popular_tours IS 'Tours marcados como populares y activos';
