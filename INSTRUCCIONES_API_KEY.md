# 🔑 Instrucciones para Configurar Google Maps API

## ✅ Paso 1: Crear/Verificar el archivo `.env` (local)

En local, crea tu `.env` en la raíz del proyecto (mismo nivel que `package.json`).

La forma más rápida es **copiar `env.example` a `.env`** y luego ajustar lo que necesites.

Variables mínimas recomendadas:

```
VITE_SUPABASE_URL=https://bmsgrtncmfafxwnlrxnt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtc2dydG5jbWZhZnh3bmxyeG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzQ2MDAsImV4cCI6MjA3MzYxMDYwMH0.OUmL4oe_uw45zKqmMdlZUJ8G8nuVN2V4pGZbgad9urk
VITE_GOOGLE_MAPS_API_KEY=AIzaSyCbiYnzceF5RCEbnOP07NQijBTKtujw56E
```

## ⚠️ Paso 2: REINICIAR EL SERVIDOR

**IMPORTANTE:** Vite solo carga las variables de entorno cuando inicia el servidor. 

### Para reiniciar:
1. **Detén el servidor actual:**
   - Presiona `Ctrl + C` en la terminal donde está corriendo

2. **Inicia el servidor de nuevo:**
   ```bash
   npm run dev
   ```

3. **Abre la consola del navegador (F12)** y verifica que veas estos mensajes:
   - ✅ "🔑 API Key detectada: Sí"
   - ✅ "📥 Cargando Google Maps API..."
   - ✅ "✅ Google Maps API cargado exitosamente"

## 🔍 Paso 3: Verificar en la Consola del Navegador

Abre las herramientas de desarrollador (F12) y ve a la pestaña "Console". Deberías ver:

- ✅ Mensajes de éxito si todo está bien
- ❌ Mensajes de error si hay algún problema

## 🐛 Solución de Problemas

### Si sigue diciendo "Google Maps no configurado":

1. **Verifica que el archivo `.env` esté en la raíz del proyecto** (mismo nivel que `package.json`)

2. **Verifica que la variable empiece con `VITE_`:**
   ```
   VITE_GOOGLE_MAPS_API_KEY=tu-api-key
   ```

3. **Limpia la caché y reinicia:**
   ```bash
   # Detén el servidor (Ctrl + C)
   # Elimina node_modules/.vite si existe
   rm -rf node_modules/.vite
   # O en Windows PowerShell:
   Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
   
   # Reinicia el servidor
   npm run dev
   ```

4. **Verifica que la API key esté activa en Google Cloud Console:**
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - Verifica que las APIs estén habilitadas:
     - Maps JavaScript API
     - Places API
     - Directions API

## 📝 Nota

Las variables de entorno que empiezan con `VITE_` son las únicas que se exponen al cliente. Por eso usamos `VITE_GOOGLE_MAPS_API_KEY` en lugar de `GOOGLE_MAPS_API_KEY`.
