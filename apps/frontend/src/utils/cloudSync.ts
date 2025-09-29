// Switch to REST API to bypass WebChannel 400 errors
import { initFirebase } from './firebase';
import type { AppState } from '../interfaces/AppState';

const COLLECTION = 'users';

export type CloudState = AppState; // Use the official AppState interface

// Data validation and migration helper
function validateAndMigrateState(data: unknown): AppState | null {
  if (!data || typeof data !== 'object') return null;
  
  try {
    const state = data as Partial<AppState>;
    
    // Build a new validated state
    const result: AppState = {
      perfil: state.perfil || {
        nombre: '',
        peso: 70,
        altura_cm: 175,
        edad: 30,
        genero: 'masculino',
        actividad: 1.375,
        exclusiones: [],
        objetivo: 'mantener',
        theme: 'dark'
      },
      metas: state.metas || {
        kcal: 2000,
        prote_g_dia: 140,
        grasa_g_dia: 60,
        carbs_g_dia: 225,
        agua_ml: 2000,
        pasos_dia: 8000,
        peso_objetivo: 65
      },
      log: state.log || {},
      fastingSessions: state.fastingSessions || []
    };
    
    console.log('[cloud] data validated and migrated successfully');
    return result;
  } catch (e) {
    console.warn('[cloud] validation failed:', e);
    return null;
  }
}

async function getFirebaseToken(): Promise<string> {
  const { auth } = initFirebase();
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');
  return await user.getIdToken();
}

function getProjectId(): string {
  return import.meta.env.VITE_FIREBASE_PROJECT_ID || 'kilobyte-ab90b';
}

export async function loadUserState(uid: string): Promise<CloudState | null> {
  try {
    const token = await getFirebaseToken();
    // Usar solo el UID como document ID, sin el :appState
    const url = `https://firestore.googleapis.com/v1/projects/${getProjectId()}/databases/(default)/documents/${COLLECTION}/${uid}`;
    
    console.log('[cloud] Loading from URL:', url);
    console.log('[cloud] User ID:', uid);
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const doc = await response.json();
      // Buscar el campo appState en lugar de state
      const state = doc.fields?.appState?.stringValue;
      console.log('[cloud] loaded state from Firestore');
      const parsedState = state ? JSON.parse(state) : null;
      
      // Use validation and migration function
      return validateAndMigrateState(parsedState);
    } else if (response.status === 404) {
      console.log('[cloud] no state found, first login');
      return null;
    } else if (response.status === 403) {
      const errorText = await response.text();
      console.warn('[cloud] Error 403:', errorText);
      console.warn('[cloud] Funcionando solo con localStorage mientras se soluciona');
      return null;
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (e) {
    console.warn('[cloud] load error', e);
    return null;
  }
}

export async function saveUserState(uid: string, state: CloudState) {
  try {
    const token = await getFirebaseToken();
    // Usar solo el UID como document ID, sin el :appState
    const url = `https://firestore.googleapis.com/v1/projects/${getProjectId()}/databases/(default)/documents/${COLLECTION}/${uid}`;
    
    const body = {
      fields: {
        appState: { stringValue: JSON.stringify(state) },
        updatedAt: { timestampValue: new Date().toISOString() }
      }
    };
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (response.ok) {
      console.log('[cloud] saved state to Firestore');
    } else if (response.status === 403) {
      const errorText = await response.text();
      console.warn('[cloud] Error 403 al guardar:', errorText);
      console.warn('[cloud] Datos guardados solo en localStorage');
      // No throw error para que la app siga funcionando
    } else {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
  } catch (e) {
    console.warn('[cloud] save error', e);
    // No re-throw para que la app siga funcionando
  }
}
