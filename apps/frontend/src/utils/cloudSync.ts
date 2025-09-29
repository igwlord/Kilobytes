// Switch to REST API to bypass WebChannel 400 errors
import { initFirebase } from './firebase';
import type { AppState, DayLog, FoodLog, FastingSession } from '../interfaces/AppState';

const COLLECTION = 'users';

export type CloudState = AppState; // Use the official AppState interface

const DEFAULT_PROFILE: AppState['perfil'] = {
  nombre: '',
  peso: 70,
  altura_cm: 175,
  edad: 30,
  genero: 'masculino',
  actividad: 1.375,
  exclusiones: [],
  objetivo: 'mantener',
  theme: 'dark'
};

const DEFAULT_METAS: AppState['metas'] = {
  kcal: 2000,
  prote_g_dia: 140,
  grasa_g_dia: 60,
  carbs_g_dia: 225,
  agua_ml: 2000,
  pasos_dia: 8000,
  peso_objetivo: 65
};

const EMPTY_MEALS = (): DayLog['comidas'] => ({
  desayuno: [],
  almuerzo: [],
  merienda: [],
  cena: [],
  snack: []
});

const numberOr = (value: unknown, fallback: number | undefined = 0): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return fallback;
};

const stringOr = (value: unknown, fallback = ''): string => {
  return typeof value === 'string' ? value : fallback;
};

const optionalString = (value: unknown): string | undefined => (typeof value === 'string' ? value : undefined);

const optionalNumber = (value: unknown): number | undefined => (typeof value === 'number' && Number.isFinite(value) ? value : undefined);

const sanitizeFood = (raw: unknown, fallbackPrefix: string): FoodLog => {
  const item = (raw && typeof raw === 'object') ? raw as Record<string, unknown> : {};
  const fallbackId = `${fallbackPrefix}-${Date.now()}-${Math.random()}`;
  return {
    id: stringOr(item.id, fallbackId),
    nombre: stringOr(item.nombre),
    emoji: optionalString(item.emoji),
    cantidad_g: numberOr(item.cantidad_g, 0) ?? 0,
    kcal: numberOr(item.kcal, 0) ?? 0,
    prot_g: numberOr(item.prot_g, 0) ?? 0,
    carbs_g: numberOr(item.carbs_g, 0) ?? 0,
    grasa_g: numberOr(item.grasa_g, 0) ?? 0,
    units: optionalNumber(item.units),
    unit_name: optionalString(item.unit_name),
    hora: optionalString(item.hora)
  };
};

const sanitizeMeals = (raw: unknown): DayLog['comidas'] => {
  const meals = EMPTY_MEALS();
  const source = (raw && typeof raw === 'object') ? raw as Record<string, unknown> : {};
  (Object.keys(meals) as Array<keyof DayLog['comidas']>).forEach(mealKey => {
    const maybeList = source[mealKey];
    if (Array.isArray(maybeList)) {
      meals[mealKey] = maybeList.map((entry, idx) => sanitizeFood(entry, `${String(mealKey)}-${idx}`));
    }
  });
  return meals;
};

const sanitizeTotals = (raw: unknown): DayLog['totals'] => {
  const totals = (raw && typeof raw === 'object') ? raw as Record<string, unknown> : {};
  return {
    kcal: numberOr(totals.kcal, 0) ?? 0,
    prot: numberOr(totals.prot, 0) ?? 0,
    carbs: numberOr(totals.carbs, 0) ?? 0,
    grasa: numberOr(totals.grasa, 0) ?? 0
  };
};

const sanitizeDayLog = (raw: unknown): DayLog => {
  const item = (raw && typeof raw === 'object') ? raw as Record<string, unknown> : {};
  return {
    peso_kg: optionalNumber(item.peso_kg),
    agua_ml: optionalNumber(item.agua_ml),
    agua_ml_consumida: optionalNumber(item.agua_ml_consumida),
    pasos: optionalNumber(item.pasos),
    ejercicio_min: optionalNumber(item.ejercicio_min),
    ayuno_h_iniciado: optionalString(item.ayuno_h_iniciado),
    ayuno_h_completado: optionalNumber(item.ayuno_h_completado),
    ayuno_h: optionalNumber(item.ayuno_h),
    sueno_h: optionalNumber(item.sueno_h),
    comidas: sanitizeMeals(item.comidas),
    totals: sanitizeTotals(item.totals)
  };
};

const sanitizeSession = (raw: unknown, idx: number): FastingSession | null => {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  const start = optionalString(item.start);
  if (!start) return null;
  const id = stringOr(item.id, typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `fs-${Date.now()}-${Math.random()}-${idx}`);
  return {
    id,
    start,
    end: optionalString(item.end),
    source: optionalString(item.source) as FastingSession['source'],
    edited: typeof item.edited === 'boolean' ? item.edited : undefined
  };
};

// Data validation and migration helper
function validateAndMigrateState(data: unknown): AppState | null {
  if (!data || typeof data !== 'object') return null;

  try {
    const state = data as Partial<AppState> & Record<string, unknown>;

    const rawLog = state.log && typeof state.log === 'object' ? state.log as Record<string, unknown> : {};
    const normalizedLog: AppState['log'] = {};
    Object.entries(rawLog).forEach(([key, value]) => {
      normalizedLog[key] = sanitizeDayLog(value);
    });

    const rawSessions = Array.isArray(state.fastingSessions) ? state.fastingSessions : [];
    const normalizedSessions = rawSessions
      .map((session, idx) => sanitizeSession(session, idx))
      .filter((session): session is FastingSession => !!session);

    const result = {
      ...state,
      perfil: { ...DEFAULT_PROFILE, ...(state.perfil || {}) },
      metas: { ...DEFAULT_METAS, ...(state.metas || {}) },
      log: normalizedLog,
      fastingSessions: normalizedSessions
    } as AppState;

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
