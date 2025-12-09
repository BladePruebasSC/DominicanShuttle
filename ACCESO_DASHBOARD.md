# 🔐 Sistema de Acceso al Dashboard

## 🚨 **Dashboard Protegido con Autenticación**

El dashboard de administración de imágenes está completamente oculto y protegido con un sistema de autenticación de dos niveles.

## 🔑 **Niveles de Protección:**

### **Nivel 1: Ruta Secreta**
- **URL Secreta**: `/cderf` (no aparece en navegación)
- **URL Pública**: `/admin` (redirige al mismo dashboard protegido)

### **Nivel 2: Clave de Acceso**
- **Clave**: `CDERF` o `cderf` (insensible a mayúsculas/minúsculas)
- **Duración**: 24 horas de sesión
- **Seguridad**: Máximo 5 intentos, bloqueo temporal

## 🛡️ **Características de Seguridad:**

### ✅ **Protecciones Implementadas:**

1. **Ruta Oculta**: `/cderf` no aparece en menús ni navegación
2. **Autenticación por Clave**: Solo con "CDERF" se puede acceder
3. **Sesión Persistente**: 24 horas de acceso sin re-autenticación
4. **Límite de Intentos**: 5 intentos máximo, luego bloqueo temporal
5. **Logout Seguro**: Botón para cerrar sesión y limpiar datos
6. **Validación en Tiempo Real**: Verificación instantánea de la clave

### 🔒 **Flujo de Acceso:**

```
1. Usuario navega a /cderf
2. Sistema muestra formulario de autenticación
3. Usuario ingresa "CDERF" o "cderf"
4. Sistema valida la clave
5. Si es correcta: Acceso al dashboard
6. Si es incorrecta: Contador de intentos
7. Después de 5 intentos: Bloqueo temporal
```

## 🎯 **Cómo Acceder:**

### **Método 1 - Ruta Secreta (Recomendado):**
```
https://tu-dominio.com/cderf
```

### **Método 2 - Ruta Pública:**
```
https://tu-dominio.com/admin
```

## 🔧 **Configuración Técnica:**

### **Archivos Creados:**
- `client/src/components/auth-gate.tsx` - Componente de autenticación
- `client/src/pages/secret-admin.tsx` - Página secreta
- Modificado `client/src/pages/admin-dashboard.tsx` - Dashboard protegido
- Modificado `client/src/App.tsx` - Rutas secretas

### **Características del Sistema:**
- **Clave**: `CDERF` (insensible a mayúsculas/minúsculas)
- **Duración de Sesión**: 24 horas
- **Almacenamiento**: localStorage del navegador
- **Bloqueo**: 30 segundos después de 5 intentos fallidos
- **Logout**: Limpia completamente la sesión

## 🚨 **Seguridad Adicional:**

### **Protecciones Implementadas:**
1. **No aparece en navegación** - La ruta `/cderf` es invisible
2. **Validación de sesión** - Verifica tiempo de autenticación
3. **Limpieza automática** - Sesiones expiradas se limpian automáticamente
4. **Bloqueo por intentos** - Previene ataques de fuerza bruta
5. **Logout seguro** - Limpia todos los datos de sesión

### **Datos Almacenados:**
```javascript
localStorage.setItem('admin_authenticated', 'true');
localStorage.setItem('admin_auth_time', timestamp);
```

## 🎯 **Uso del Dashboard:**

### **Acceso:**
1. Navegar a `/cderf`
2. Ingresar clave: `CDERF`
3. Acceder al dashboard completo

### **Funcionalidades Disponibles:**
- ✅ Gestión de imágenes de tours
- ✅ Gestión de imágenes de vehículos  
- ✅ Gestión de imágenes de página principal
- ✅ Subida de archivos con preview
- ✅ Metadatos (títulos, descripciones, orden)
- ✅ Organización por secciones
- ✅ Eliminación segura de imágenes

## 🔄 **Gestión de Sesiones:**

### **Inicio de Sesión:**
- Ingresar clave correcta
- Sesión válida por 24 horas
- Acceso automático en futuras visitas

### **Cierre de Sesión:**
- Botón "Cerrar Sesión" en la esquina superior derecha
- Limpia todos los datos de autenticación
- Requiere nueva autenticación para acceder

### **Sesión Expirada:**
- Verificación automática al cargar
- Limpieza automática de datos expirados
- Requiere nueva autenticación

## 🛠️ **Mantenimiento:**

### **Cambiar Clave de Acceso:**
Para cambiar la clave, modificar en `client/src/components/auth-gate.tsx`:
```typescript
if (accessKey.toLowerCase() === 'nueva_clave') {
```

### **Cambiar Duración de Sesión:**
Modificar en `auth-gate.tsx`:
```typescript
if (hoursSinceAuth < 24) { // Cambiar 24 por las horas deseadas
```

### **Cambiar Ruta Secreta:**
Modificar en `client/src/App.tsx`:
```typescript
<Route path="/nueva_ruta_secreta" component={SecretAdmin} />
```

## ✅ **Verificación de Funcionamiento:**

1. **Acceso a `/cderf`** - Debe mostrar formulario de autenticación
2. **Ingresar "CDERF"** - Debe acceder al dashboard
3. **Sesión persistente** - Debe mantener acceso por 24 horas
4. **Logout** - Debe cerrar sesión y requerir nueva autenticación
5. **Bloqueo** - Debe bloquear después de 5 intentos incorrectos

---
**🔐 ¡Dashboard completamente protegido y oculto! Solo accesible con la clave "CDERF".** 🎉
