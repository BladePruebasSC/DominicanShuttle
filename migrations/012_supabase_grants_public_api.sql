-- =====================================================
-- Supabase PostgREST GRANTS (para que /rest/v1 vea tablas)
-- =====================================================
-- Si PostgREST devuelve 404 en /rest/v1/bookings, suele ser porque:
-- 1) la tabla no existe en schema public, o
-- 2) el rol anon/authenticated no tiene GRANTs sobre la tabla.
--
-- Este script habilita los permisos mínimos para que la app funcione en Netlify
-- (sin backend). Ajusta con RLS más adelante para mayor seguridad.

-- Permitir usar el schema public
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Lectura pública para catálogo
GRANT SELECT ON TABLE public.tours TO anon, authenticated;
GRANT SELECT ON TABLE public.vehicles TO anon, authenticated;

-- Reservas: permitir crear (y leer para dashboard, por ahora)
GRANT SELECT, INSERT ON TABLE public.bookings TO anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.tour_bookings TO anon, authenticated;

-- (Opcional) si luego quieres cambiar estados desde dashboard sin backend:
-- GRANT UPDATE ON TABLE public.bookings TO anon, authenticated;
-- GRANT UPDATE ON TABLE public.tour_bookings TO anon, authenticated;

