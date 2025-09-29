# Solución al Error: column "category" does not exist

## 🔍 Problema
El error `ERROR: 42703: column "category" does not exist` indica que estás intentando insertar datos en la tabla `tours` antes de que la tabla haya sido creada correctamente.

## ✅ Solución

### Opción 1: Usar el archivo completo (RECOMENDADO)
Usa el archivo `migrations/complete_migration.sql` que contiene todo en un solo archivo:

1. Ve al **SQL Editor** de Supabase
2. Copia y pega **TODO** el contenido de `migrations/complete_migration.sql`
3. Ejecuta la consulta completa

### Opción 2: Ejecutar archivos en orden correcto
Si prefieres usar los archivos separados:

1. **Primero**: Ejecuta `migrations/001_initial_schema_fixed.sql`
2. **Segundo**: Ejecuta `migrations/002_seed_data_fixed.sql`
3. **Tercero**: Ejecuta `supabase-config.sql`

### Opción 3: Verificar tablas existentes
Si ya tienes algunas tablas creadas:

```sql
-- Verificar qué tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Si la tabla tours no existe, crearla:
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
```

## 🚨 Pasos de Emergencia

Si nada funciona, limpia todo y empieza de nuevo:

```sql
-- CUIDADO: Esto elimina TODAS las tablas
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS tours CASCADE;
DROP TABLE IF EXISTS routes CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- Luego ejecuta el archivo completo
```

## ✅ Verificación

Después de ejecutar la migración, verifica que todo esté correcto:

```sql
-- Verificar que la tabla tours existe y tiene la columna category
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tours' 
AND table_schema = 'public';

-- Verificar que hay datos en tours
SELECT COUNT(*) FROM tours;

-- Verificar que la columna category tiene datos
SELECT category, COUNT(*) FROM tours GROUP BY category;
```

## 📋 Checklist

- [ ] Ejecuté el archivo `complete_migration.sql` completo
- [ ] No hay errores en la consola de Supabase
- [ ] La tabla `tours` existe
- [ ] La columna `category` existe en la tabla `tours`
- [ ] Hay 6 tours insertados
- [ ] Puedo hacer consultas a la tabla `tours`

## 🆘 Si el problema persiste

1. **Verifica la consola de Supabase** para ver errores específicos
2. **Revisa los logs** en el dashboard
3. **Asegúrate** de que estás en el proyecto correcto
4. **Verifica** que tienes permisos de administrador

## 📞 Soporte

Si necesitas ayuda adicional:
- Revisa la documentación de Supabase
- Verifica que tu proyecto esté activo
- Asegúrate de que la base de datos esté funcionando

