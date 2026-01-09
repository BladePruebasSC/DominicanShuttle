# 🔑 Instrucciones para Configurar Google Maps API

## ✅ Paso 1: Verificar que el archivo .env existe

El archivo `.env` ya está creado con tu API key:
```
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

1. **Verifica que el archivo .env esté en la raíz del proyecto** (mismo nivel que package.json)

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
