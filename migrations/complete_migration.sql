-- =====================================================
-- Dominican Shuttle - Migración Completa para Supabase
-- =====================================================
-- Este archivo contiene TODO lo necesario para configurar la base de datos
-- Ejecutar este archivo completo en una sola vez

-- =====================================================
-- LIMPIAR TABLAS EXISTENTES (OPCIONAL)
-- =====================================================
-- Descomenta las siguientes líneas si quieres limpiar las tablas existentes
-- DROP TABLE IF EXISTS contact_messages CASCADE;
-- DROP TABLE IF EXISTS testimonials CASCADE;
-- DROP TABLE IF EXISTS bookings CASCADE;
-- DROP TABLE IF EXISTS tours CASCADE;
-- DROP TABLE IF EXISTS routes CASCADE;
-- DROP TABLE IF EXISTS services CASCADE;
-- DROP TABLE IF EXISTS vehicles CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS settings CASCADE;

-- =====================================================
-- CREAR TABLAS
-- =====================================================

-- TABLA DE USUARIOS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT UNIQUE,
    full_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'driver')),
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA DE VEHÍCULOS
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('sedan', 'suv', 'van', 'bus')),
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    luggage_capacity INTEGER NOT NULL CHECK (luggage_capacity >= 0),
    base_price DECIMAL(10,2) NOT NULL CHECK (base_price > 0),
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    image_url TEXT,
    license_plate TEXT UNIQUE,
    year INTEGER,
    color TEXT,
    available BOOLEAN DEFAULT true,
    driver_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA DE SERVICIOS
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('airport_transfer', 'private_tour', 'executive_transport', 'special_event', 'group_transport')),
    base_price DECIMAL(10,2) NOT NULL CHECK (base_price > 0),
    duration_hours INTEGER,
    includes JSONB DEFAULT '[]'::jsonb,
    requirements JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA DE RUTAS
CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    distance_km DECIMAL(8,2),
    estimated_duration_minutes INTEGER,
    base_price DECIMAL(10,2) NOT NULL CHECK (base_price > 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(origin, destination)
);

-- TABLA DE TOURS
CREATE TABLE IF NOT EXISTS tours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    duration TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    includes JSONB NOT NULL DEFAULT '[]'::jsonb,
    image_url TEXT,
    category TEXT NOT NULL CHECK (category IN ('adventure', 'cultural', 'beach', 'nature', 'city')),
    popular BOOLEAN DEFAULT false,
    max_participants INTEGER,
    min_participants INTEGER DEFAULT 1,
    difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA DE RESERVAS
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    pickup_date TIMESTAMP WITH TIME ZONE NOT NULL,
    return_date TIMESTAMP WITH TIME ZONE,
    passengers INTEGER NOT NULL CHECK (passengers > 0),
    vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('sedan', 'suv', 'van', 'bus')),
    service_type TEXT NOT NULL CHECK (service_type IN ('one_way', 'round_trip')),
    estimated_price DECIMAL(10,2) NOT NULL CHECK (estimated_price > 0),
    final_price DECIMAL(10,2),
    special_requests TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    payment_method TEXT,
    vehicle_id UUID REFERENCES vehicles(id),
    driver_id UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA DE TESTIMONIOS
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_initials TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT NOT NULL,
    date TEXT NOT NULL,
    verified BOOLEAN DEFAULT true,
    booking_id UUID REFERENCES bookings(id),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA DE MENSAJES DE CONTACTO
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    service_interest TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'resolved', 'closed')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    assigned_to UUID REFERENCES users(id),
    response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA DE CONFIGURACIONES
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREAR ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_pickup_date ON bookings(pickup_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(type);
CREATE INDEX IF NOT EXISTS idx_vehicles_available ON vehicles(available);
CREATE INDEX IF NOT EXISTS idx_tours_category ON tours(category);
CREATE INDEX IF NOT EXISTS idx_tours_popular ON tours(popular);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_routes_origin_destination ON routes(origin, destination);

-- =====================================================
-- CREAR FUNCIONES
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
-- CREAR TRIGGERS
-- =====================================================

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tours_updated_at BEFORE UPDATE ON tours FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_messages_updated_at BEFORE UPDATE ON contact_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INSERTAR DATOS INICIALES
-- =====================================================

-- USUARIOS INICIALES
INSERT INTO users (username, password, email, full_name, role, phone, is_active) VALUES
('admin', '$2b$10$rQZ8K9vL2mN3pQ4rS5tU6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'admin@dominicantransportpro.com', 'Administrador Sistema', 'admin', '+1 (809) 444-8800', true),
('driver1', '$2b$10$rQZ8K9vL2mN3pQ4rS5tU6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'driver1@dominicantransportpro.com', 'Carlos Rodríguez', 'driver', '+1 (809) 444-8801', true),
('driver2', '$2b$10$rQZ8K9vL2mN3pQ4rS5tU6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'driver2@dominicantransportpro.com', 'María González', 'driver', '+1 (809) 444-8802', true);

-- VEHÍCULOS
INSERT INTO vehicles (name, type, capacity, luggage_capacity, base_price, features, image_url, license_plate, year, color, available) VALUES
('Sedán Económico', 'sedan', 3, 2, 35.00, '["Aire acondicionado", "Conductor profesional", "Agua gratis"]', 'https://us.as.com/autos/wp-content/uploads/2024/06/Civic-2025-1024x576.jpg', 'ABC-1234', 2023, 'Blanco', true),
('SUV Premium', 'suv', 6, 4, 60.00, '["Vehículo de lujo", "Asientos de cuero", "WiFi gratis", "Sistema de sonido"]', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', 'DEF-5678', 2024, 'Negro', true),
('Van Grupal', 'van', 12, 8, 120.00, '["Amplio espacio", "Sistema de sonido", "Refrigerios incluidos", "Asientos cómodos"]', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', 'GHI-9012', 2023, 'Azul', true),
('Autobús Ejecutivo', 'bus', 25, 15, 200.00, '["Asientos reclinables", "Aire acondicionado dual", "Entretenimiento", "Baño a bordo"]', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', 'JKL-3456', 2022, 'Gris', true),
('Mercedes-Benz Clase E', 'suv', 4, 3, 150.00, '["Vehículo de lujo premium", "Conductor con traje", "Agua premium", "Cargadores USB"]', 'https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', 'MNO-7890', 2024, 'Plateado', true),
('Autobús de Lujo', 'bus', 45, 30, 350.00, '["Asientos de cuero", "WiFi premium", "Sistema de entretenimiento", "Refrigerador", "Baño VIP"]', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', 'PQR-1357', 2023, 'Dorado', true);

-- SERVICIOS
INSERT INTO services (name, description, type, base_price, duration_hours, includes, requirements, is_active) VALUES
('Traslado Aeropuerto', 'Servicio directo desde/hacia todos los aeropuertos de República Dominicana', 'airport_transfer', 35.00, 1, '["Transporte directo", "Conductor profesional", "Agua gratis", "Asistencia con equipaje"]', '["Reserva previa", "Información de vuelo"]', true),
('Tour Privado', 'Explora los mejores destinos con nuestros tours personalizados', 'private_tour', 85.00, 8, '["Guía turístico", "Transporte privado", "Entradas incluidas", "Almuerzo"]', '["Reserva con anticipación", "Confirmación de disponibilidad"]', true),
('Transporte Ejecutivo', 'Servicios premium para empresarios y ejecutivos', 'executive_transport', 120.00, 4, '["Vehículo de lujo", "Conductor bilingüe", "WiFi", "Servicio 24/7"]', '["Reserva previa", "Información corporativa"]', true),
('Evento Especial', 'Transporte para bodas, celebraciones y eventos corporativos', 'special_event', 200.00, 6, '["Vehículo decorado", "Conductor con traje", "Servicio personalizado", "Flexibilidad horaria"]', '["Reserva con anticipación", "Detalles del evento"]', true),
('Grupo Grande', 'Transporte para grupos de cualquier tamaño', 'group_transport', 180.00, 3, '["Vehículo amplio", "Conductor experimentado", "Precio por grupo", "Flexibilidad de horarios"]', '["Mínimo 15 personas", "Reserva previa"]', true);

-- RUTAS
INSERT INTO routes (origin, destination, distance_km, estimated_duration_minutes, base_price, is_active) VALUES
('Punta Cana Airport (PUJ)', 'Punta Cana Hotels', 15.5, 25, 35.00, true),
('Punta Cana Airport (PUJ)', 'Bávaro', 20.0, 30, 40.00, true),
('Punta Cana Airport (PUJ)', 'Cap Cana', 25.0, 35, 45.00, true),
('Santo Domingo Airport (SDQ)', 'Zona Colonial', 18.0, 30, 45.00, true),
('Santo Domingo Airport (SDQ)', 'Malecón', 22.0, 35, 50.00, true),
('Puerto Plata Airport (POP)', 'Centro Puerto Plata', 12.0, 20, 40.00, true),
('Puerto Plata Airport (POP)', 'Playa Dorada', 8.0, 15, 35.00, true),
('La Romana Airport (LRM)', 'Casa de Campo', 10.0, 15, 40.00, true),
('La Romana Airport (LRM)', 'Bayahibe', 25.0, 35, 50.00, true),
('Punta Cana', 'Santo Domingo', 180.0, 180, 120.00, true),
('Punta Cana', 'Puerto Plata', 250.0, 240, 150.00, true),
('Santo Domingo', 'Puerto Plata', 200.0, 200, 130.00, true);

-- TOURS
INSERT INTO tours (name, description, duration, price, includes, image_url, category, popular, max_participants, min_participants, difficulty_level, is_active) VALUES
('Isla Saona Paradise', 'Descubre el paraíso tropical de Isla Saona con sus playas de arena blanca y aguas cristalinas. Una experiencia única en el Caribe dominicano.', '8 horas', 85.00, '["Transporte ida y vuelta", "Almuerzo bufet en la playa", "Bebidas incluidas", "Equipo de snorkeling", "Guía turístico bilingüe"]', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', 'beach', true, 50, 2, 'easy', true),
('27 Charcos de Damajagua', 'Aventura extrema en las cascadas más famosas de República Dominicana. Saltos, toboganes naturales y piscinas de agua dulce.', '10 horas', 95.00, '["Transporte especializado", "Equipo de seguridad completo", "Guía certificado", "Almuerzo típico dominicano", "Fotos profesionales"]', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', 'adventure', false, 30, 4, 'hard', true),
('Zona Colonial Santo Domingo', 'Explora la primera ciudad del Nuevo Mundo. Historia, cultura y arquitectura colonial en el corazón de América.', '6 horas', 70.00, '["Transporte cómodo", "Guía historiador", "Entradas a monumentos", "Almuerzo en restaurante típico", "Mapa turístico"]', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', 'cultural', false, 25, 2, 'easy', true),
('Cayo Levantado (Bacardí Island)', 'Isla paradisíaca en la Bahía de Samaná. Relájate en playas vírgenes y disfruta de la naturaleza caribeña.', '7 horas', 75.00, '["Transporte marítimo", "Almuerzo caribeño", "Bebidas tropicales", "Tiempo libre en la playa", "Equipo de playa"]', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', 'beach', true, 40, 2, 'easy', true),
('Parque Nacional del Este', 'Aventura ecológica en uno de los parques más diversos del Caribe. Cuevas, playas vírgenes y vida silvestre.', '9 horas', 90.00, '["Transporte 4x4", "Guía naturalista", "Almuerzo eco-friendly", "Equipo de exploración", "Entrada al parque"]', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', 'nature', false, 20, 4, 'medium', true),
('Hoyo Azul + Zipline Scape Park', 'Combinación perfecta de aventura y naturaleza. Cenote natural y emocionantes tirolinas en la jungla.', '5 horas', 65.00, '["Transporte al parque", "Equipo de tirolina", "Acceso al Hoyo Azul", "Instructor certificado", "Refreshment incluido"]', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600', 'adventure', true, 35, 2, 'medium', true);

-- TESTIMONIOS
INSERT INTO testimonials (customer_name, customer_initials, rating, review, date, verified, is_featured) VALUES
('Alicia H.', 'AH', 5, 'Excelente servicio! El transfer fue puntual, muy cómodo, y el conductor súper amable. Hizo que nuestro viaje en Punta Cana fuera libre de estrés. Lo recomiendo 100%.', 'Agosto 2025', true, true),
('Nathan Mapp', 'NM', 5, 'Estaba escéptico al principio, pero el servicio superó mis expectativas. Pago por adelantado, comunicación excelente por WhatsApp, y conductores profesionales. $35 por una van fue un precio justo.', 'Septiembre 2025', true, true),
('Shanda Young', 'SY', 5, 'Viajé con un grupo grande y el servicio fue excepcional. La comunicación fue excelente, el servicio profesional y la hospitalidad excepcional. Definitivamente los usaré otra vez.', 'Agosto 2025', true, true),
('Wilbur Smith', 'WS', 5, 'Excellent service! The transfer was on time, very comfortable, and the driver was professional and friendly. Made our trip in Punta Cana stress-free. Highly recommend', 'Agosto 2025', true, true),
('Mariela Mazziotti', 'MM', 5, 'Great service! Punctual, safe, and friendly transfer from-to Punta Cana airport, and tours. Thanks!', 'Agosto 2025', true, true),
('Nathalie Velasco', 'NV', 5, 'I am extremely satisfied with this transportation service. The airport pick up and drop off went by really quick and smooth. The drivers were very professional, friendly and helpful. Will recommend and use them again!', 'Agosto 2025', true, true);

-- CONFIGURACIONES DEL SISTEMA
INSERT INTO settings (key, value, description) VALUES
('company_name', '"Dominican Transport Pro"', 'Nombre de la empresa'),
('company_phone', '"+1 (809) 444-8800"', 'Teléfono principal de la empresa'),
('company_email', '"info@dominicantransportpro.com"', 'Email principal de la empresa'),
('company_whatsapp', '"18094448800"', 'Número de WhatsApp de la empresa'),
('notification_phone', '"+1 (809) 444-8800"', 'Número para notificaciones'),
('currency', '"USD"', 'Moneda principal'),
('timezone', '"America/Santo_Domingo"', 'Zona horaria'),
('booking_confirmation_enabled', 'true', 'Habilitar confirmación automática de reservas'),
('whatsapp_notifications_enabled', 'true', 'Habilitar notificaciones por WhatsApp'),
('email_notifications_enabled', 'true', 'Habilitar notificaciones por email'),
('max_advance_booking_days', '90', 'Máximo días de anticipación para reservas'),
('min_advance_booking_hours', '2', 'Mínimo horas de anticipación para reservas'),
('default_booking_status', '"pending"', 'Estado por defecto de nuevas reservas'),
('auto_confirm_booking', 'false', 'Confirmar automáticamente las reservas'),
('require_payment_confirmation', 'false', 'Requerir confirmación de pago'),
('support_languages', '["es", "en"]', 'Idiomas soportados'),
('business_hours', '{"start": "06:00", "end": "22:00", "timezone": "America/Santo_Domingo"}', 'Horario de atención'),
('emergency_contact', '"+1 (809) 444-8800"', 'Contacto de emergencia 24/7');

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================

COMMENT ON TABLE users IS 'Usuarios del sistema (admin, conductores, clientes)';
COMMENT ON TABLE vehicles IS 'Flota de vehículos disponibles';
COMMENT ON TABLE services IS 'Servicios ofrecidos por la empresa';
COMMENT ON TABLE routes IS 'Rutas y precios entre destinos';
COMMENT ON TABLE tours IS 'Tours y excursiones disponibles';
COMMENT ON TABLE bookings IS 'Reservas de transporte realizadas por clientes';
COMMENT ON TABLE testimonials IS 'Testimonios y reseñas de clientes';
COMMENT ON TABLE contact_messages IS 'Mensajes de contacto de clientes potenciales';
COMMENT ON TABLE settings IS 'Configuraciones del sistema';

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que todas las tablas se crearon correctamente
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('users', 'vehicles', 'services', 'routes', 'tours', 'bookings', 'testimonials', 'contact_messages', 'settings');
    
    IF table_count = 9 THEN
        RAISE NOTICE '✅ Todas las tablas se crearon correctamente';
    ELSE
        RAISE EXCEPTION '❌ Error: Solo se crearon % de 9 tablas esperadas', table_count;
    END IF;
END $$;

-- Verificar que se insertaron datos
DO $$
DECLARE
    user_count INTEGER;
    vehicle_count INTEGER;
    tour_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO vehicle_count FROM vehicles;
    SELECT COUNT(*) INTO tour_count FROM tours;
    
    RAISE NOTICE '✅ Datos insertados: % usuarios, % vehículos, % tours', user_count, vehicle_count, tour_count;
END $$;

RAISE NOTICE '🎉 Migración completada exitosamente!';

