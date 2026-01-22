# Configuración de Variables de Entorno en Netlify

## Problema
La API de Google Maps no funciona en producción porque las variables de entorno no se están cargando correctamente.

## Solución

### Paso 1: Configurar Variables de Entorno en Netlify

1. Ve a tu sitio en Netlify: https://app.netlify.com
2. Selecciona tu sitio (dominicantransport)
3. Ve a **Site settings** (Configuración del sitio)
4. En el menú lateral, busca **Environment variables** (Variables de entorno)
5. Haz clic en **Add a variable** (Agregar variable)

### Paso 2: Agregar las Variables

Agrega estas variables (scope: **All scopes** o al menos **Build** y **Production**):

**Supabase (obligatorio):**

Nombre:
```
VITE_SUPABASE_URL
```
Valor:
```
https://bmsgrtncmfafxwnlrxnt.supabase.co
```

Nombre:
```
VITE_SUPABASE_ANON_KEY
```
Valor:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtc2dydG5jbWZhZnh3bmxyeG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzQ2MDAsImV4cCI6MjA3MzYxMDYwMH0.OUmL4oe_uw45zKqmMdlZUJ8G8nuVN2V4pGZbgad9urk
```

**Google Maps (opcional, solo si usas autocompletado/mapa):**

Nombre:
```
VITE_GOOGLE_MAPS_API_KEY
```

Valor:
```
AIzaSyCbiYnzceF5RCEbnOP07NQijBTKtujw56E
```

**Importante:**
- ✅ El nombre DEBE empezar con `VITE_` para que Vite lo incluya en el build
- ✅ El nombre DEBE ser exactamente (mayúsculas): `VITE_GOOGLE_MAPS_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- ✅ Selecciona el scope: **All scopes** (Todos los ámbitos) o al menos **Build** y **Production**

### Paso 3: Re-deploy

Después de agregar la variable:

1. Ve a **Deploys** (Despliegues)
2. Haz clic en **Trigger deploy** (Activar despliegue)
3. Selecciona **Clear cache and deploy site** (Limpiar caché y desplegar sitio)
4. Espera a que termine el build

### Paso 4: Verificar

Después del deploy, abre la consola del navegador (F12) y deberías ver:
```
🔑 API Key detectada: ✅ Sí
```

En lugar de:
```
🔑 API Key detectada: ❌ No
```

## Notas Importantes

- ⚠️ Las variables de entorno en Netlify solo están disponibles durante el **build**, no en runtime
- ⚠️ Si cambias una variable de entorno, DEBES hacer un nuevo deploy
- ⚠️ El caché de Netlify puede causar problemas, por eso es importante hacer "Clear cache and deploy"

## Troubleshooting

Si después de seguir estos pasos sigue sin funcionar:

1. Verifica que el nombre de la variable sea exactamente `VITE_GOOGLE_MAPS_API_KEY`
2. Verifica que el scope incluya al menos "Build"
3. Haz un deploy limpio (Clear cache)
4. Revisa los logs del build en Netlify para ver si hay errores
