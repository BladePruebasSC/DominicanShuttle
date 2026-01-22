// Script para verificar que las variables de entorno estén disponibles durante el build
// Este script se ejecuta antes del build en Netlify

const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  // opcional (si usas mapas/autocompletado):
  'VITE_GOOGLE_MAPS_API_KEY'
];

console.log('🔍 Verificando variables de entorno...\n');

let allPresent = true;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: Presente (${value.substring(0, 10)}...)`);
  } else {
    console.error(`❌ ${varName}: NO ENCONTRADA`);
    allPresent = false;
  }
});

console.log('\n📋 Variables de entorno disponibles:');
console.log(JSON.stringify(process.env, null, 2).substring(0, 500) + '...\n');

if (!allPresent) {
  console.error('\n⚠️ ADVERTENCIA: Faltan variables de entorno requeridas.');
  console.error('📋 Para solucionarlo en Netlify:');
  console.error('   1. Ve a Site settings > Environment variables');
  console.error('   2. Agrega las variables faltantes');
  console.error('   3. Scope: All scopes (o al menos Build y Production)');
  console.error('   4. Haz un nuevo deploy (Clear cache and deploy)');
  console.error('\n⚠️ El build continuará, pero la API no funcionará hasta configurar las variables.\n');
  // No fallar el build, solo advertir
} else {
  console.log('✅ Todas las variables de entorno están presentes.\n');
}
