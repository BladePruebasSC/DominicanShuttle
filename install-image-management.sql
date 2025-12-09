-- =====================================================
-- SCRIPT DE INSTALACIÓN COMPLETA - GESTIÓN DE IMÁGENES
-- Dominican Shuttle
-- =====================================================
-- 
-- Este script instala todo el sistema de gestión de imágenes
-- en una sola ejecución. Incluye:
-- - Tablas de base de datos
-- - Funciones auxiliares
-- - Políticas de seguridad
-- - Configuración de Storage
-- - Datos iniciales
-- - Verificaciones
--
-- USO: Ejecutar este archivo completo en Supabase SQL Editor
-- =====================================================

-- Ejecutar la migración completa
\i migrations/004_complete_image_management.sql

-- =====================================================
-- VERIFICACIÓN POST-INSTALACIÓN
-- =====================================================

-- Verificar estructura de tablas
SELECT 
    'Tablas creadas:' as status,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('tour_images', 'vehicle_images', 'homepage_images', 'image_settings');

-- Verificar funciones creadas
SELECT 
    'Funciones creadas:' as status,
    COUNT(*) as count
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'get_tour_primary_image',
    'get_vehicle_primary_image', 
    'get_homepage_section_images',
    'cleanup_orphaned_images',
    'delete_image_from_storage'
);

-- Verificar políticas RLS
SELECT 
    'Políticas RLS:' as status,
    COUNT(*) as count
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('tour_images', 'vehicle_images', 'homepage_images', 'image_settings');

-- Verificar configuraciones iniciales
SELECT 
    'Configuraciones:' as status,
    COUNT(*) as count,
    string_agg(setting_key, ', ') as settings
FROM image_settings;

-- Verificar bucket de storage
SELECT 
    'Storage bucket:' as status,
    CASE 
        WHEN EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'images') 
        THEN '✅ Creado' 
        ELSE '❌ No encontrado' 
    END as bucket_status;

-- =====================================================
-- INSTRUCCIONES POST-INSTALACIÓN
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 INSTALACIÓN COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '=====================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 PRÓXIMOS PASOS:';
    RAISE NOTICE '';
    RAISE NOTICE '1. 🔧 CONFIGURAR SUPABASE STORAGE:';
    RAISE NOTICE '   - Ir a Supabase Dashboard > Storage';
    RAISE NOTICE '   - Verificar que el bucket "images" esté creado';
    RAISE NOTICE '   - Configurar políticas de acceso si es necesario';
    RAISE NOTICE '';
    RAISE NOTICE '2. 🔑 CONFIGURAR VARIABLES DE ENTORNO:';
    RAISE NOTICE '   - VITE_SUPABASE_URL=tu_url_de_supabase';
    RAISE NOTICE '   - VITE_SUPABASE_ANON_KEY=tu_clave_anonima';
    RAISE NOTICE '';
    RAISE NOTICE '3. 👤 CONFIGURAR USUARIOS ADMINISTRADORES:';
    RAISE NOTICE '   - Asegurar que los usuarios tengan role = "admin"';
    RAISE NOTICE '   - Verificar políticas RLS para administradores';
    RAISE NOTICE '';
    RAISE NOTICE '4. 🚀 ACCEDER AL DASHBOARD:';
    RAISE NOTICE '   - Navegar a /admin en tu aplicación';
    RAISE NOTICE '   - Comenzar a subir y gestionar imágenes';
    RAISE NOTICE '';
    RAISE NOTICE '5. 🧪 PROBAR FUNCIONALIDADES:';
    RAISE NOTICE '   - Subir una imagen de prueba';
    RAISE NOTICE '   - Verificar que se guarde en la base de datos';
    RAISE NOTICE '   - Comprobar que aparezca en el dashboard';
    RAISE NOTICE '';
    RAISE NOTICE '📚 DOCUMENTACIÓN:';
    RAISE NOTICE '   - Ver DASHBOARD_SETUP.md para detalles completos';
    RAISE NOTICE '   - Consultar logs de Supabase si hay problemas';
    RAISE NOTICE '';
    RAISE NOTICE '✅ ¡Sistema de gestión de imágenes listo para usar!';
END $$;
