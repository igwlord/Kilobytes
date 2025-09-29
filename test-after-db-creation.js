// Script para verificar Firestore después de crear la DB
const testFirestoreAfterCreation = async () => {
  console.log('🔍 Verificando Firestore...');
  
  try {
    const response = await fetch('https://firestore.googleapis.com/v1/projects/kilobyte-ab90b/databases/(default)/documents/test/doc');
    
    console.log(`Status: ${response.status}`);
    
    if (response.status === 401) {
      console.log('✅ ÉXITO: Firestore funciona (401 = necesita auth, normal)');
      return true;
    } else if (response.status === 403) {
      console.log('❌ ERROR: Base de datos aún no creada');
      return false;
    } else if (response.status === 404) {
      console.log('✅ ÉXITO: Firestore funciona (404 = documento no existe, normal)');
      return true;
    } else {
      console.log(`📋 Respuesta inesperada: ${response.status}`);
      return true;
    }
  } catch (error) {
    console.log('❌ Error:', error);
    return false;
  }
};

// También probar guardado real
const testRealSave = async () => {
  console.log('💾 Probando guardado real...');
  
  // Simular datos de prueba
  const testData = {
    lastSync: new Date().toISOString(),
    calories: 1500,
    water: 6,
    test: true
  };
  
  // Forzar guardado usando la función existente
  if (typeof updateAppState === 'function') {
    updateAppState(testData);
    console.log('✅ Guardado forzado enviado');
  } else {
    console.log('ℹ️ updateAppState no disponible (necesitas estar en Dashboard)');
  }
};

console.log('🚀 Scripts listos. Ejecuta después de crear la DB:');
console.log('1. testFirestoreAfterCreation()');
console.log('2. testRealSave()');