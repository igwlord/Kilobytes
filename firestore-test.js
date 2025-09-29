// Test de conectividad a Firestore
// Ejecuta esto en la consola del navegador (F12) cuando estés logueado en la app

console.log('=== DIAGNÓSTICO FIRESTORE ===');

// 1. Verificar si hay usuario autenticado
const checkAuth = () => {
  const userData = localStorage.getItem('kiloByteData');
  console.log('1. localStorage data:', userData ? 'Existe' : 'No existe');
  
  // Verificar token de Firebase
  if (window.firebase) {
    console.log('2. Firebase SDK cargado:', !!window.firebase);
  }
};

// 2. Test manual de conexión a Firestore
const testFirestore = async () => {
  try {
    const projectId = 'kilobyte-ab90b';
    const uid = 'test-user-id'; // Solo para test
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/test/test-doc`;
    
    console.log('3. Probando conexión a:', url);
    
    const response = await fetch(url);
    console.log('4. Status de respuesta:', response.status);
    console.log('5. Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.status === 401) {
      console.log('✅ Firestore responde (401 = necesita auth, es normal)');
      return true;
    } else if (response.status === 403) {
      console.log('❌ Error 403 - API no habilitada o permisos incorrectos');
      const errorText = await response.text();
      console.log('Error completo:', errorText);
      return false;
    } else {
      console.log(`📋 Respuesta inesperada: ${response.status}`);
      return true;
    }
  } catch (error) {
    console.log('❌ Error de red:', error);
    return false;
  }
};

// 3. Test con token real si está disponible
const testWithRealToken = async () => {
  // Esto solo funciona si el usuario está logueado en la app
  try {
    const auth = window.firebase?.auth?.();
    if (!auth?.currentUser) {
      console.log('6. No hay usuario logueado para test con token real');
      return;
    }
    
    const token = await auth.currentUser.getIdToken();
    const projectId = 'kilobyte-ab90b';
    const uid = auth.currentUser.uid;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}:appState`;
    
    console.log('7. Probando con token real...');
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('8. Status con token:', response.status);
    
    if (response.status === 404) {
      console.log('✅ Firestore funciona! (404 = documento no existe, normal)');
    } else if (response.status === 200) {
      console.log('✅ Firestore funciona! Documento encontrado');
    } else {
      console.log('❌ Error:', response.status);
      const errorText = await response.text();
      console.log('Error:', errorText);
    }
  } catch (error) {
    console.log('❌ Error con token real:', error);
  }
};

// Ejecutar todos los tests
const runDiagnostic = async () => {
  console.log('Iniciando diagnóstico...');
  checkAuth();
  await testFirestore();
  await testWithRealToken();
  console.log('=== FIN DIAGNÓSTICO ===');
};

// Auto-ejecutar
runDiagnostic();