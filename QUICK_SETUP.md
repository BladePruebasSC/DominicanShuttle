# 🚀 Configuración Rápida - Dashboard de Imágenes

## Instalación en 3 Pasos

### 1. 📊 Aplicar Migración en Supabase
```sql
-- Copia y pega todo el contenido de este archivo en Supabase SQL Editor:
\i migrations/004_complete_image_management.sql
```

### 2. 🪣 Verificar Storage en Supabase
- Ve a **Storage** en Supabase Dashboard
- Verifica que existe el bucket `images`
- Si no existe, créalo con:
  - **Nombre**: `images`
  - **Público**: ✅ Habilitado
  - **Límite**: 5MB
  - **Tipos**: image/jpeg, image/png, image/webp, image/gif

### 3. 🚀 Usar el Dashboard
- Inicia tu app: `npm run dev`
- Navega a: `http://localhost:puerto/admin`
- ¡Comienza a subir imágenes!

## ✅ Verificación Rápida

### ¿Funciona todo?
1. **Dashboard carga**: ✅ `/admin` se abre sin errores
2. **Subir imagen**: ✅ Puedes seleccionar y subir archivos
3. **Guardar**: ✅ Las imágenes se guardan en la base de datos
4. **Ver imágenes**: ✅ Las imágenes aparecen en la galería

### 🔧 Si algo no funciona:

**Error: "Bucket no encontrado"**
- Verifica que el bucket `images` esté creado en Supabase Storage

**Error: "Acceso denegado"**
- Verifica que tu usuario tenga `role = 'admin'` en la tabla `users`

**Error: "Variables de entorno"**
- Verifica que `.env` tenga:
  ```
  VITE_SUPABASE_URL=tu_url
  VITE_SUPABASE_ANON_KEY=tu_key
  ```

## 📁 Archivos Importantes

- `migrations/004_complete_image_management.sql` - Migración completa
- `client/src/pages/admin-dashboard.tsx` - Dashboard principal
- `DASHBOARD_SETUP.md` - Documentación completa

## 🎯 Funcionalidades

- ✅ **Tours**: Subir imágenes para tours
- ✅ **Vehículos**: Gestionar galería de flota
- ✅ **Página Principal**: Imágenes para hero, servicios, etc.
- ✅ **Metadatos**: Títulos, descripciones, orden
- ✅ **Seguridad**: Solo administradores pueden gestionar

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs de Supabase
2. Verifica la consola del navegador
3. Consulta `DASHBOARD_SETUP.md` para detalles completos

---
**¡Listo! Tu dashboard de imágenes está funcionando.** 🎉
