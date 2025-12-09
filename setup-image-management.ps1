# =====================================================
# SCRIPT DE CONFIGURACIÓN AUTOMÁTICA
# Dominican Shuttle - Gestión de Imágenes
# =====================================================

Write-Host "🚀 Configurando sistema de gestión de imágenes para Dominican Shuttle..." -ForegroundColor Green
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "migrations/004_complete_image_management.sql")) {
    Write-Host "❌ Error: No se encontró el archivo de migración." -ForegroundColor Red
    Write-Host "   Asegúrate de ejecutar este script desde la raíz del proyecto." -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Verificando archivos necesarios..." -ForegroundColor Blue

# Lista de archivos que deben existir
$requiredFiles = @(
    "migrations/004_complete_image_management.sql",
    "client/src/pages/admin-dashboard.tsx",
    "client/src/lib/imageService.ts",
    "client/src/hooks/use-images.ts",
    "DASHBOARD_SETUP.md"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "❌ Archivos faltantes:" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "   - $file" -ForegroundColor Red
    }
    exit 1
}

Write-Host "✅ Todos los archivos necesarios están presentes" -ForegroundColor Green
Write-Host ""

# Mostrar instrucciones de instalación
Write-Host "📋 INSTRUCCIONES DE INSTALACIÓN:" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 🗄️  APLICAR MIGRACIÓN EN SUPABASE:" -ForegroundColor Yellow
Write-Host "   a) Ve a tu proyecto en Supabase Dashboard" -ForegroundColor White
Write-Host "   b) Navega a SQL Editor" -ForegroundColor White
Write-Host "   c) Copia y pega el contenido de: migrations/004_complete_image_management.sql" -ForegroundColor White
Write-Host "   d) Ejecuta el script" -ForegroundColor White
Write-Host ""
Write-Host "2. 🪣  CONFIGURAR SUPABASE STORAGE:" -ForegroundColor Yellow
Write-Host "   a) Ve a Storage en el menú lateral" -ForegroundColor White
Write-Host "   b) Verifica que el bucket 'images' esté creado" -ForegroundColor White
Write-Host "   c) Si no existe, créalo con estas configuraciones:" -ForegroundColor White
Write-Host "      - Nombre: images" -ForegroundColor Gray
Write-Host "      - Público: ✅ Habilitado" -ForegroundColor Gray
Write-Host "      - Límite de tamaño: 5MB" -ForegroundColor Gray
Write-Host "      - Tipos MIME: image/jpeg, image/png, image/webp, image/gif" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 🔑  CONFIGURAR VARIABLES DE ENTORNO:" -ForegroundColor Yellow
Write-Host "   Asegúrate de que tu archivo .env tenga:" -ForegroundColor White
Write-Host "   VITE_SUPABASE_URL=tu_url_de_supabase" -ForegroundColor Gray
Write-Host "   VITE_SUPABASE_ANON_KEY=tu_clave_anonima" -ForegroundColor Gray
Write-Host ""
Write-Host "4. 👤  CONFIGURAR USUARIOS ADMINISTRADORES:" -ForegroundColor Yellow
Write-Host "   Asegúrate de que los usuarios tengan role = 'admin' en la tabla users" -ForegroundColor White
Write-Host ""
Write-Host "5. 🚀  PROBAR EL DASHBOARD:" -ForegroundColor Yellow
Write-Host "   a) Inicia tu aplicación: npm run dev" -ForegroundColor White
Write-Host "   b) Navega a /admin" -ForegroundColor White
Write-Host "   c) Intenta subir una imagen de prueba" -ForegroundColor White
Write-Host ""

# Verificar si existe package.json para mostrar comandos de desarrollo
if (Test-Path "package.json") {
    Write-Host "📦 COMANDOS DE DESARROLLO:" -ForegroundColor Cyan
    Write-Host "=========================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Para iniciar el servidor de desarrollo:" -ForegroundColor White
    Write-Host "  npm run dev" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para construir para producción:" -ForegroundColor White
    Write-Host "  npm run build" -ForegroundColor Green
    Write-Host ""
}

# Mostrar estructura de archivos creados
Write-Host "📁 ARCHIVOS CREADOS:" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🗄️  Base de Datos:" -ForegroundColor Yellow
Write-Host "   - migrations/004_complete_image_management.sql" -ForegroundColor White
Write-Host "   - install-image-management.sql" -ForegroundColor White
Write-Host ""
Write-Host "🎨 Frontend:" -ForegroundColor Yellow
Write-Host "   - client/src/pages/admin-dashboard.tsx" -ForegroundColor White
Write-Host "   - client/src/lib/imageService.ts" -ForegroundColor White
Write-Host "   - client/src/hooks/use-images.ts" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentación:" -ForegroundColor Yellow
Write-Host "   - DASHBOARD_SETUP.md" -ForegroundColor White
Write-Host ""

# Verificar si el dashboard está integrado en App.tsx
if (Test-Path "client/src/App.tsx") {
    $appContent = Get-Content "client/src/App.tsx" -Raw
    if ($appContent -match "admin-dashboard" -and $appContent -match "/admin") {
        Write-Host "✅ Dashboard integrado en App.tsx" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Dashboard no está integrado en App.tsx" -ForegroundColor Yellow
        Write-Host "   Asegúrate de agregar la ruta /admin" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎉 ¡CONFIGURACIÓN COMPLETADA!" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 RESUMEN DE LO QUE SE HA CREADO:" -ForegroundColor Cyan
Write-Host "• Dashboard completo de administración de imágenes" -ForegroundColor White
Write-Host "• Sistema de subida a Supabase Storage" -ForegroundColor White
Write-Host "• Gestión de metadatos (títulos, descripciones, orden)" -ForegroundColor White
Write-Host "• Políticas de seguridad y permisos" -ForegroundColor White
Write-Host "• Funciones auxiliares para optimización" -ForegroundColor White
Write-Host "• Documentación completa" -ForegroundColor White
Write-Host ""
Write-Host "🚀 ¡Listo para usar! Navega a /admin para comenzar." -ForegroundColor Green
Write-Host ""
Write-Host "💡 Para más información, consulta DASHBOARD_SETUP.md" -ForegroundColor Blue
