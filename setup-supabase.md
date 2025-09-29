# Configuración de Supabase para Dominican Shuttle

Esta guía te ayudará a configurar Supabase para la aplicación Dominican Shuttle.

## Paso 1: Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Anota las siguientes credenciales:
   - Project URL
   - Anon Key
   - Service Role Key

## Paso 2: Aplicar Migraciones

### Opción A: Desde el Dashboard de Supabase

1. Ve al dashboard de tu proyecto
2. Navega a "SQL Editor"
3. Ejecuta los siguientes archivos en orden:
   - `migrations/001_initial_schema.sql`
   - `migrations/002_seed_data.sql`
   - `supabase-config.sql`

### Opción B: Usando Supabase CLI

```bash
# Instalar Supabase CLI
npm install -g supabase

# Inicializar proyecto
supabase init

# Aplicar migraciones
supabase db push
```

## Paso 3: Configurar Variables de Entorno

1. Copia `env.example` a `.env`
2. Actualiza las variables con tus credenciales de Supabase:

```env
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
```

## Paso 4: Instalar Dependencias

```bash
# Instalar dependencias del cliente
cd client
npm install @supabase/supabase-js

# Instalar dependencias del servidor
cd ../server
npm install @supabase/supabase-js
```

## Paso 5: Actualizar el Código

### Cliente (React)

1. Actualiza `client/src/lib/supabase.ts` con tus credenciales
2. Reemplaza las llamadas a la API local con Supabase:

```typescript
// Antes
import { storage } from '@shared/storage';

// Después
import { supabaseUtils } from '@/lib/supabase';
```

### Servidor (Express)

1. Actualiza `server/storage.ts` para usar Supabase
2. Reemplaza `MemStorage` con `SupabaseStorage`

## Paso 6: Configurar Row Level Security (RLS)

Las políticas de seguridad ya están configuradas en `supabase-config.sql`. Verifica que estén activas:

1. Ve a "Authentication" > "Policies" en el dashboard
2. Verifica que todas las tablas tengan RLS habilitado
3. Revisa las políticas creadas

## Paso 7: Configurar Autenticación (Opcional)

Si quieres agregar autenticación de usuarios:

1. Ve a "Authentication" > "Settings"
2. Configura los proveedores que necesites
3. Actualiza las políticas de RLS según sea necesario

## Paso 8: Configurar Storage (Opcional)

Para subir imágenes de vehículos y tours:

1. Ve a "Storage" en el dashboard
2. Crea buckets para:
   - `vehicles` (imágenes de vehículos)
   - `tours` (imágenes de tours)
   - `testimonials` (fotos de clientes)

## Paso 9: Configurar Webhooks (Opcional)

Para notificaciones en tiempo real:

1. Ve a "Database" > "Webhooks"
2. Crea webhooks para:
   - Nuevas reservas
   - Nuevos mensajes de contacto
   - Cambios de estado de reservas

## Paso 10: Probar la Configuración

1. Ejecuta la aplicación:
```bash
npm run dev
```

2. Verifica que:
   - Los vehículos se cargan correctamente
   - Los tours se muestran
   - Las reservas se crean
   - Los testimonios se muestran

## Solución de Problemas

### Error de conexión a la base de datos
- Verifica que `DATABASE_URL` sea correcta
- Asegúrate de que el proyecto de Supabase esté activo

### Error de políticas RLS
- Verifica que las políticas estén configuradas correctamente
- Revisa los logs en el dashboard de Supabase

### Error de tipos TypeScript
- Actualiza `client/src/lib/supabase.ts` con los tipos correctos
- Regenera los tipos desde el dashboard de Supabase

## Estructura de la Base de Datos

### Tablas Principales
- `users` - Usuarios del sistema
- `vehicles` - Flota de vehículos
- `services` - Servicios ofrecidos
- `routes` - Rutas y precios
- `tours` - Tours disponibles
- `bookings` - Reservas de clientes
- `testimonials` - Reseñas de clientes
- `contact_messages` - Mensajes de contacto
- `settings` - Configuraciones del sistema

### Funciones Útiles
- `get_route_price()` - Calcula precios de rutas
- `check_vehicle_availability()` - Verifica disponibilidad
- `notify_new_booking()` - Notifica nuevas reservas

### Vistas Útiles
- `booking_stats` - Estadísticas de reservas
- `available_vehicles` - Vehículos disponibles
- `popular_tours` - Tours populares

## Próximos Pasos

1. Configurar autenticación de usuarios
2. Implementar sistema de pagos
3. Agregar notificaciones en tiempo real
4. Configurar analytics y monitoreo
5. Implementar sistema de reviews
6. Agregar funcionalidades de administración

## Soporte

Para problemas específicos:
- Revisa la documentación de Supabase
- Consulta los logs en el dashboard
- Verifica las políticas de RLS
- Revisa la configuración de variables de entorno
