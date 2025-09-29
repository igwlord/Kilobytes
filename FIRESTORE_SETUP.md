# ✅ Firestore - CONFIGURACIÓN COMPLETADA

## ¡FUNCIONANDO AL 100%! 🎉

La sincronización en la nube está **completamente funcional**:

- ✅ **Login con Google**: Funciona
- ✅ **Carga desde nube**: `[cloud] loaded state from Firestore`
- ✅ **Guardado en nube**: `[cloud] saved state to Firestore`  
- ✅ **Persistencia entre dispositivos**: Disponible
- ✅ **Backup automático**: Tiempo real

## Problema resuelto

**Causa del error 403**: Document ID con caracteres especiales (`:`) incompatible con reglas de Firestore.

**Solución aplicada**: Cambio de estructura de documento:
- **ANTES**: `/users/userId:appState` ❌
- **AHORA**: `/users/userId` con campo `appState` ✅

## Para habilitar en nuevos proyectos:

### 1. Crear base de datos de Firestore
1. Ve a: https://console.firebase.google.com/project/kilobyte-ab90b/firestore
2. Haz clic en **"Create database"** o **"Comenzar"**
3. Selecciona **"Start in test mode"**
4. Elige región (us-central1 recomendado)
5. Click **"Done"**

### 2. Configurar reglas de Firestore
1. Ve a pestaña **"Rules"** en Firestore Console
2. Reemplaza con:
1. Ve a: https://console.firebase.google.com/project/kilobyte-ab90b/firestore
2. En la pestaña **"Reglas"**, reemplaza el contenido con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura/escritura solo a usuarios autenticados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **"Publish"**

## 🚀 Configuración para Producción (Netlify)

### 4. Configurar Firestore para Producción
1. Ve a **Firestore Console** → pestaña **"Rules"**
2. Cambia las reglas de **test mode** a **production mode**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // PRODUCCIÓN: Solo usuarios autenticados pueden acceder a sus datos
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
3. Click **"Publish"**

### 5. Configurar variables de entorno en Netlify
1. Ve a tu proyecto en **Netlify Dashboard**
2. **Site settings** → **Environment variables**
3. Agrega estas variables (valores de Firebase Console):

```
VITE_FIREBASE_API_KEY=AIzaSyAtS8TJ7G_B6azYqel9MhTlsXY6koWDunA
VITE_FIREBASE_AUTH_DOMAIN=kilobyte-ab90b.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=kilobyte-ab90b
VITE_FIREBASE_STORAGE_BUCKET=kilobyte-ab90b.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=652481061945
VITE_FIREBASE_APP_ID=1:652481061945:web:ac77c7edae36f6b8ae1234
```

### 6. Agregar dominio de producción en Firebase Auth
1. Ve a **Firebase Console** → **Authentication** → **Settings** → **Authorized domains**
2. Agrega tu dominio de Netlify: `kiloBytesapp.netlify.app`
3. También agrega cualquier dominio personalizado que uses

### 7. Deploy a producción
```bash
# Build y push
npm run build
git add .
git commit -m "prod: Firebase Auth + Firestore cloud sync ready"
git push origin main
```

### 8. Verificar funcionamiento en producción
1. Ve a tu sitio en Netlify
2. Haz login con Google
3. Verifica logs en DevTools:
   - `[cloud] loaded state from Firestore`
   - `[cloud] saved state to Firestore`

### 3. Verificar funcionamiento ✅
1. Hacer login con Google
2. Los datos se cargan automáticamente: `[cloud] loaded state from Firestore`
3. Cambiar algo en la app (agua, comida)
4. Verificar guardado: `[cloud] saved state to Firestore`
5. Limpiar cache y recargar → datos persisten

## Funcionalidades disponibles ✅
- ✅ **Sincronización automática** en tiempo real
- ✅ **Datos persisten entre dispositivos**
- ✅ **Backup automático** en la nube
- ✅ **Fallback a localStorage** si hay problemas de red
- ✅ **Recuperación tras cache clearing**

## Logs de éxito esperados
```
[auth] Google sign-in success for user@gmail.com
[cloud] loaded state from Firestore
[cloud] saved state to Firestore
```

## Notas técnicas
- ✅ Usa REST API para evitar WebChannel errors
- ✅ Manejo graceful de errores 403/404
- ✅ Estructura: `/users/{userId}` con campo `appState`
- ✅ Autosave inmediato en cada cambio
- ✅ Visual feedback con SaveStatus component