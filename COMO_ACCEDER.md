# 🚀 Cómo Acceder al Dashboard

## 📋 **URLs de Acceso:**

### **🌐 Aplicación Principal:**
- **Local**: `http://localhost:5000`
- **Red**: `http://[tu-ip]:5000`

### **🔐 Dashboard de Administración:**
- **Ruta Secreta**: `http://localhost:5000/cderf`
- **Ruta Pública**: `http://localhost:5000/admin`

## 🚀 **Comandos para Iniciar:**

### **Opción 1 - Comando Normal:**
```bash
npm run dev
```

### **Opción 2 - Con URLs Mostradas:**
```bash
npm run dev:show
```

## 🔑 **Acceso al Dashboard:**

### **Paso 1: Iniciar la Aplicación**
```bash
npm run dev
```

### **Paso 2: Abrir el Dashboard**
Navegar a una de estas URLs:
- `http://localhost:5000/cderf` (recomendado)
- `http://localhost:5000/admin`

### **Paso 3: Ingresar Clave**
- **Clave**: `CDERF` o `cderf`
- **Duración**: 24 horas de sesión

## 🎯 **URLs Completas:**

### **Para Acceso Local:**
```
http://localhost:5000/cderf
```

### **Para Acceso desde Red:**
```
http://[tu-ip-local]:5000/cderf
```

## 🔍 **Encontrar tu IP Local:**

### **Windows:**
```cmd
ipconfig
```

### **Mac/Linux:**
```bash
ifconfig
```

### **O usar el comando:**
```bash
npm run dev:show
```

## 🛠️ **Solución de Problemas:**

### **Si no se abre automáticamente:**
1. Abre tu navegador
2. Ve a `http://localhost:5000`
3. Luego navega a `/cderf`

### **Si el puerto 5000 está ocupado:**
1. Vite automáticamente usará el siguiente puerto disponible
2. Revisa la consola para ver el puerto real
3. Usa ese puerto en la URL

### **Si no puedes acceder:**
1. Verifica que el servidor esté corriendo
2. Revisa que no haya errores en la consola
3. Intenta con `http://127.0.0.1:5000/cderf`

## ✅ **Verificación de Acceso:**

### **1. Aplicación Principal:**
- ✅ `http://localhost:5000` - Página de inicio
- ✅ `http://localhost:5000/tours` - Tours
- ✅ `http://localhost:5000/fleet` - Flota
- ✅ `http://localhost:5000/contact` - Contacto

### **2. Dashboard de Administración:**
- ✅ `http://localhost:5000/cderf` - Dashboard secreto
- ✅ `http://localhost:5000/admin` - Dashboard público
- ✅ Clave: `CDERF`
- ✅ Funcionalidades: Gestión de imágenes

## 🎉 **¡Listo para Usar!**

Una vez que tengas la aplicación corriendo:

1. **Navega** a `http://localhost:5000/cderf`
2. **Ingresa** la clave `CDERF`
3. **Accede** al dashboard completo
4. **Gestiona** tus imágenes de tours, vehículos y página principal

---
**🚀 ¡Tu dashboard está listo y protegido!** 🔐
