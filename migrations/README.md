# Migraciones de Dominican Shuttle para Supabase

Este directorio contiene las migraciones SQL necesarias para configurar la base de datos de Supabase para la aplicación Dominican Shuttle.

## Archivos de Migración

### 001_initial_schema.sql
- Crea todas las tablas necesarias para la aplicación
- Define índices para optimización de consultas
- Configura triggers para actualización automática de timestamps
- Incluye comentarios y documentación

### 002_seed_data.sql
- Inserta datos iniciales para el funcionamiento de la aplicación
- Incluye usuarios, vehículos, servicios, rutas, tours y testimonios
- Configura las configuraciones del sistema

## Tablas Creadas

1. **users** - Usuarios del sistema (admin, conductores, clientes)
2. **vehicles** - Flota de vehículos disponibles
3. **services** - Servicios ofrecidos por la empresa
4. **routes** - Rutas y precios entre destinos
5. **tours** - Tours y excursiones disponibles
6. **bookings** - Reservas de transporte realizadas por clientes
7. **testimonials** - Testimonios y reseñas de clientes
8. **contact_messages** - Mensajes de contacto de clientes potenciales
9. **settings** - Configuraciones del sistema

## Cómo Aplicar las Migraciones

### Opción 1: Desde el Dashboard de Supabase
1. Ve al dashboard de tu proyecto en Supabase
2. Navega a "SQL Editor"
3. Copia y pega el contenido de `001_initial_schema.sql`
4. Ejecuta la consulta
5. Repite el proceso con `002_seed_data.sql`

### Opción 2: Desde la línea de comandos
```bash
# Instalar Supabase CLI
npm install -g supabase

# Inicializar proyecto (si no está inicializado)
supabase init

# Aplicar migraciones
supabase db push
```

### Opción 3: Usando psql directamente
```bash
# Conectar a la base de datos
psql "postgresql://postgres:[password]@[host]:5432/postgres"

# Ejecutar migraciones
\i migrations/001_initial_schema.sql
\i migrations/002_seed_data.sql
```

## Configuración de Variables de Entorno

Después de aplicar las migraciones, configura las siguientes variables de entorno:

```env
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
```

## Datos Iniciales

### Usuarios por Defecto
- **admin**: admin@dominicantransportpro.com (password: password123)
- **driver1**: driver1@dominicantransportpro.com (password: password123)
- **driver2**: driver2@dominicantransportpro.com (password: password123)

### Vehículos
- 6 vehículos de diferentes tipos (sedán, SUV, van, autobús)
- Precios desde $35 hasta $350 USD
- Capacidades desde 3 hasta 45 pasajeros

### Tours
- 6 tours populares en República Dominicana
- Categorías: playa, aventura, cultural, naturaleza
- Precios desde $65 hasta $95 USD

### Rutas
- 12 rutas principales entre aeropuertos y destinos
- Precios dinámicos basados en distancia
- Tiempos estimados de viaje

## Notas Importantes

1. **Seguridad**: Las contraseñas están hasheadas con bcrypt
2. **IDs**: Todos los IDs son UUIDs generados automáticamente
3. **Precios**: Todos los precios están en USD
4. **Imágenes**: Las URLs de imágenes son ejemplos (reemplazar con URLs reales)
5. **Testimonios**: Los testimonios son reales de clientes

## Próximos Pasos

1. Aplicar las migraciones a tu instancia de Supabase
2. Configurar las variables de entorno en tu aplicación
3. Actualizar el código para usar Supabase en lugar del almacenamiento en memoria
4. Configurar Row Level Security (RLS) si es necesario
5. Configurar webhooks para notificaciones en tiempo real

## Soporte

Para cualquier problema con las migraciones, revisa:
- Los logs de Supabase
- La documentación de Supabase
- Los comentarios en los archivos SQL
