# Migración de Base de Datos - Supabase

Este documento explica cómo aplicar las migraciones a tu base de datos de Supabase.

## Configuración Inicial

### 1. Configurar Variables de Entorno

Ya se ha actualizado el archivo `env.example` con tus claves de Supabase. Para usar estas claves:

**Opción A: Crear archivo .env manualmente**
```bash
# Copia el archivo env.example a .env
cp env.example .env
```

**Opción B: Configurar en Netlify/Vercel**
Si estás desplegando en Netlify o Vercel, agrega estas variables de entorno en el dashboard:
- `VITE_SUPABASE_URL`: https://bmsgrtncmfafxwnlrxnt.supabase.co
- `VITE_SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtc2dydG5jbWZhZnh3bmxyeG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzQ2MDAsImV4cCI6MjA3MzYxMDYwMH0.OUmL4oe_uw45zKqmMdlZUJ8G8nuVN2V4pGZbgad9urk

## Aplicar Migraciones

### Opción Recomendada: Migración Completa (Todo en Uno)

Ejecuta esta migración que crea todas las tablas si no existen y las adapta con todos los campos necesarios:
```sql
-- Ejecutar en el SQL Editor de Supabase
-- Archivo: migrations/007_complete_schema_with_adaptations.sql
```

Esta migración es **idempotente** y puede ejecutarse múltiples veces sin problemas. Crea las tablas si no existen y agrega los campos faltantes si ya existen.

### Opción Alternativa: Migraciones Separadas

Si prefieres ejecutar las migraciones por separado:

**Paso 1: Migración Inicial**
```sql
-- Ejecutar en el SQL Editor de Supabase
-- Archivo: migrations/001_initial_schema.sql
```

**Paso 2: Migración de Adaptación** (solo si las tablas ya existen)
```sql
-- Ejecutar en el SQL Editor de Supabase
-- Archivo: migrations/006_adapt_tables_to_current_page.sql
```

## Cómo Ejecutar las Migraciones en Supabase

1. **Accede a tu proyecto de Supabase**: https://bmsgrtncmfafxwnlrxnt.supabase.co
2. **Ve al SQL Editor** (en el menú lateral)
3. **Crea una nueva query**
4. **Copia y pega el contenido** del archivo de migración
5. **Ejecuta la query** (botón "Run" o Ctrl+Enter)

## Cambios Realizados

### Tabla `tours`
- ✅ Agregado campo `highlights` (JSONB) - Puntos destacados del tour
- ✅ Agregado campo `rating` (DECIMAL) - Calificación promedio (0-5)
- ✅ Agregado campo `reviews` (INTEGER) - Número de reseñas

### Tabla `testimonials`
- ✅ Agregado campo `source` (TEXT) - Fuente del testimonio (Google, TripAdvisor, etc.)

### Tabla `bookings`
- ✅ Agregado campo `origin_place_id` - ID de Google Places para origen
- ✅ Agregado campo `destination_place_id` - ID de Google Places para destino
- ✅ Agregado campo `origin_coords` (JSONB) - Coordenadas del origen
- ✅ Agregado campo `destination_coords` (JSONB) - Coordenadas del destino

### Tabla `vehicles`
- ✅ Agregado campo `capacity_text` - Texto descriptivo de capacidad
- ✅ Agregado campo `luggage_text` - Texto descriptivo de equipaje

### Nueva Tabla `tour_reviews`
- ✅ Tabla para reseñas específicas de tours
- ✅ Incluye función automática para actualizar rating de tours

## Verificar Migración

Después de ejecutar la migración, verifica que las tablas se hayan actualizado correctamente:

```sql
-- Verificar columnas de tours
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tours';

-- Verificar columnas de testimonials
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'testimonials';

-- Verificar que existe la tabla tour_reviews
SELECT * FROM information_schema.tables 
WHERE table_name = 'tour_reviews';
```

## Próximos Pasos

1. ✅ Ejecutar migración inicial (001_initial_schema.sql)
2. ✅ Ejecutar migración de adaptación (006_adapt_tables_to_current_page.sql)
3. 🔄 Insertar datos de ejemplo (opcional)
4. 🔄 Configurar políticas de seguridad (RLS) en Supabase
5. 🔄 Probar la conexión desde la aplicación

## Notas Importantes

- Las migraciones son **idempotentes**: puedes ejecutarlas múltiples veces sin problemas
- Los campos nuevos tienen valores por defecto, así que no afectarán datos existentes
- La función `update_tour_rating()` se ejecuta automáticamente cuando se agregan reseñas

## Soporte

Si encuentras algún problema al ejecutar las migraciones, verifica:
1. Que tengas permisos de administrador en Supabase
2. Que la extensión `uuid-ossp` esté habilitada
3. Que no haya conflictos con tablas existentes
