# Dashboard de Administración de Imágenes - Dominican Shuttle

Este documento explica cómo configurar y usar el dashboard de administración de imágenes para Dominican Shuttle.

## 🚀 Características

- **Gestión de Imágenes de Tours**: Sube y administra imágenes para tus tours y excursiones
- **Gestión de Imágenes de Vehículos**: Administra la galería de tu flota de vehículos
- **Gestión de Imágenes de Página Principal**: Configura imágenes para diferentes secciones del sitio
- **Subida a Supabase Storage**: Integración completa con Supabase para almacenamiento
- **Interfaz Intuitiva**: Dashboard moderno y fácil de usar

## 📋 Requisitos Previos

1. **Supabase configurado** con las migraciones aplicadas
2. **Bucket de Storage** configurado en Supabase
3. **Autenticación** configurada para administradores

## 🛠️ Configuración

### 1. Aplicar Migraciones de Base de Datos

Ejecuta las siguientes migraciones en tu proyecto Supabase:

```sql
-- 1. Migración inicial (si no está aplicada)
\i migrations/001_initial_schema_fixed.sql

-- 2. Migración de gestión de imágenes
\i migrations/003_image_management.sql

-- 3. Configuración de Storage
\i supabase-storage-setup.sql
```

### 2. Configurar Supabase Storage

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **Storage** en el menú lateral
3. Crea un bucket llamado `images` con las siguientes configuraciones:
   - **Public**: ✅ Habilitado
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`, `image/gif`

### 3. Configurar Políticas RLS

Las políticas ya están incluidas en el archivo `supabase-storage-setup.sql`, pero puedes verificar que estén aplicadas:

```sql
-- Verificar políticas de storage
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

### 4. Configurar Variables de Entorno

Asegúrate de que tu archivo `.env` tenga las variables de Supabase configuradas:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

## 🎯 Uso del Dashboard

### Acceder al Dashboard

Navega a `/admin` en tu aplicación para acceder al dashboard de administración.

### Gestión de Imágenes de Tours

1. **Subir Imagen**:
   - Selecciona un archivo de imagen
   - Completa los metadatos (texto alternativo, leyenda, orden)
   - Marca como imagen principal si es necesario
   - Guarda la imagen

2. **Administrar Imágenes**:
   - Ve todas las imágenes subidas
   - Edita metadatos
   - Elimina imágenes no deseadas
   - Reordena imágenes

### Gestión de Imágenes de Vehículos

Similar a los tours, pero enfocado en la flota de vehículos:
- Sube imágenes de diferentes ángulos
- Organiza por tipo de vehículo
- Marca imágenes principales

### Gestión de Imágenes de Página Principal

Para diferentes secciones del sitio:
- **Hero**: Imágenes principales del slider
- **Servicios**: Imágenes de la sección de servicios
- **Testimonios**: Imágenes de fondo para testimonios
- **Acerca de**: Imágenes para la sección "Acerca de"
- **Galería**: Imágenes para la galería general

## 🔧 Estructura de Archivos

```
client/src/
├── pages/
│   └── admin-dashboard.tsx     # Dashboard principal
├── hooks/
│   └── use-images.ts           # Hooks para gestión de imágenes
├── lib/
│   └── imageService.ts         # Servicio para Supabase
└── components/ui/              # Componentes de UI

migrations/
├── 001_initial_schema_fixed.sql
└── 003_image_management.sql    # Nuevas tablas de imágenes

supabase-storage-setup.sql      # Configuración de Storage
```

## 📊 Tablas de Base de Datos

### `tour_images`
- Almacena imágenes asociadas a tours
- Campos: `id`, `tour_id`, `image_url`, `alt_text`, `caption`, `is_primary`, `display_order`

### `vehicle_images`
- Almacena imágenes de vehículos
- Campos: `id`, `vehicle_id`, `image_url`, `alt_text`, `caption`, `is_primary`, `display_order`

### `homepage_images`
- Almacena imágenes para la página principal
- Campos: `id`, `section`, `image_url`, `alt_text`, `caption`, `title`, `subtitle`, `display_order`, `is_active`

### `image_settings`
- Configuraciones del sistema de imágenes
- Campos: `id`, `setting_key`, `setting_value`, `description`

## 🔒 Seguridad

- **RLS Habilitado**: Todas las tablas tienen Row Level Security
- **Políticas de Storage**: Solo administradores pueden subir/eliminar imágenes
- **Validación de Tipos**: Solo se permiten formatos de imagen específicos
- **Límites de Tamaño**: Máximo 5MB por imagen

## 🚨 Solución de Problemas

### Error: "Bucket no encontrado"
- Verifica que el bucket `images` esté creado en Supabase Storage
- Ejecuta el script `supabase-storage-setup.sql`

### Error: "Política de acceso denegado"
- Verifica que el usuario tenga rol de administrador
- Revisa las políticas RLS en Supabase

### Error: "Formato de archivo no permitido"
- Solo se permiten: JPEG, PNG, WebP, GIF
- Verifica el tipo MIME del archivo

### Imágenes no se cargan
- Verifica la configuración de CORS en Supabase
- Revisa las variables de entorno
- Verifica la conectividad con Supabase

## 🔄 Mantenimiento

### Limpiar Imágenes Huérfanas

Ejecuta esta función para eliminar imágenes no referenciadas:

```sql
SELECT cleanup_orphaned_images();
```

### Backup de Configuraciones

```sql
-- Exportar configuraciones
SELECT * FROM image_settings;
```

## 📈 Próximas Mejoras

- [ ] Compresión automática de imágenes
- [ ] Generación de miniaturas
- [ ] Redimensionamiento automático
- [ ] Integración con CDN
- [ ] Análisis de uso de imágenes
- [ ] Optimización automática

## 🤝 Contribución

Para contribuir al desarrollo del dashboard:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Implementa los cambios
4. Prueba exhaustivamente
5. Envía un Pull Request

## 📞 Soporte

Si encuentras problemas o tienes preguntas:

1. Revisa este documento
2. Verifica los logs de Supabase
3. Consulta la documentación de Supabase Storage
4. Abre un issue en el repositorio
