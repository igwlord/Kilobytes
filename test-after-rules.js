// Test después de configurar reglas
const testAfterRules = async () => {
  console.log('🔍 Probando Firestore después de configurar reglas...');
  
  const response = await fetch('https://firestore.googleapis.com/v1/projects/kilobyte-ab90b/databases/(default)/documents/test/doc');
  
  console.log(`Status: ${response.status}`);
  
  if (response.status === 401 || response.status === 404) {
    console.log('✅ ¡ÉXITO! Firestore ahora responde correctamente');
    console.log('La app ya puede sincronizar en la nube');
    return true;
  } else if (response.status === 403) {
    console.log('❌ Aún 403 - revisar reglas o esperar propagación');
    return false;
  }
};

console.log('📋 Script listo para probar después de configurar reglas');