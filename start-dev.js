#!/usr/bin/env node

import { spawn } from 'child_process';
import os from 'os';

console.log('🚀 Iniciando Dominican Shuttle...\n');

// Obtener la IP local
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();
const port = 5000;

console.log('📋 URLs disponibles:');
console.log('==================');
console.log(`🌐 Local:    http://localhost:${port}`);
console.log(`🌐 Red:      http://${localIP}:${port}`);
console.log('');
console.log('🔐 Dashboard de Administración:');
console.log('===============================');
console.log(`🔑 Ruta Secreta: http://localhost:${port}/cderf`);
console.log(`🔑 Ruta Pública: http://localhost:${port}/admin`);
console.log('');
console.log('💡 Clave de acceso: CDERF');
console.log('');
console.log('⚡ Iniciando servidor...\n');

// Iniciar el servidor de desarrollo
const devProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

devProcess.on('error', (error) => {
  console.error('❌ Error al iniciar el servidor:', error);
});

devProcess.on('close', (code) => {
  console.log(`\n🛑 Servidor cerrado con código: ${code}`);
});
