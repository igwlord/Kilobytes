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

// Firestore REST body type for document fields
type FirestoreFieldsBody = {
  fields: {
    appState: { stringValue: string };
    updatedAt: { timestampValue: string };
  };
  currentDocument?: { updateTime: string };
};

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

function countFoods(dl: DayLog | undefined): number {
  if (!dl) return 0;
  const m = dl.comidas || ({} as DayLog['comidas']);
  return (m.desayuno?.length || 0) + (m.almuerzo?.length || 0) + (m.merienda?.length || 0) + (m.cena?.length || 0) + (m.snack?.length || 0);
}

function mergeStatesCloudFirst(cloud: CloudState | null, local: CloudState): CloudState {
  if (!cloud) return local;
  // Cloud gana en perfil y metas
  const perfil = { ...local.perfil, ...cloud.perfil };
  const metas = { ...local.metas, ...cloud.metas };

  // Merge de logs por día: mantener todos los días; en conflicto, elegir el que tenga más entradas de comida (o cloud si empate)
  const resultLog: CloudState['log'] = { ...local.log };
  Object.entries(cloud.log || {}).forEach(([key, cloudDay]) => {
    const localDay = resultLog[key];
    if (!localDay) {
      resultLog[key] = cloudDay;
    } else {
      const c = countFoods(cloudDay);
      const l = countFoods(localDay);
      resultLog[key] = c >= l ? cloudDay : localDay;
    }
  });

  // Merge de sesiones de ayuno por id, priorizando cloud
  const cloudIds = new Set((cloud.fastingSessions || []).map(s => s.id));
  const mergedSessions = [
    ...(cloud.fastingSessions || []),
    ...(local.fastingSessions || []).filter(s => !cloudIds.has(s.id))
  ];

  return {
    ...local,
    ...cloud, // por si hay campos nuevos añadidos
    perfil,
    metas,
    log: resultLog,
    fastingSessions: mergedSessions
  } as CloudState;
}

export async function saveUserState(uid: string, state: CloudState) {
  try {
    const token = await getFirebaseToken();
    // Usar solo el UID como document ID, sin el :appState
    const url = `https://firestore.googleapis.com/v1/projects/${getProjectId()}/databases/(default)/documents/${COLLECTION}/${uid}`;

    // Backup local antes de subir
    try {
      localStorage.setItem('kiloByteDataBackup', JSON.stringify(state));
      localStorage.setItem('kiloByteDataBackupAt', new Date().toISOString());
    } catch (err) {
      console.warn('[cloud] backup to localStorage failed', err);
    }

    // 1) Leer la versión actual en nube para hacer merge y tomar updateTime
    const getResp = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    let cloudState: CloudState | null = null;
    let updateTime: string | undefined = undefined;
    if (getResp.ok) {
      const doc = await getResp.json();
      const stateStr = doc.fields?.appState?.stringValue as string | undefined;
      cloudState = stateStr ? validateAndMigrateState(JSON.parse(stateStr)) : null;
      updateTime = doc.updateTime as string | undefined;
    }

    // 2) Merge cloud-first
    const merged = mergeStatesCloudFirst(cloudState, state);

    // 3) Intentar PATCH con precondición de updateTime si existe
    const body: FirestoreFieldsBody = {
      fields: {
        appState: { stringValue: JSON.stringify(merged) },
        updatedAt: { timestampValue: new Date().toISOString() }
      }
    };
    if (updateTime) {
      body.currentDocument = { updateTime };
    }

    let resp = await fetch(url, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    // 409/412: condición fallida → reintentar una vez leyendo nube, re-mergiendo
    if (!resp.ok && (resp.status === 409 || resp.status === 412)) {
      console.warn('[cloud] precondition failed, reloading and retrying merge');
      const again = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      if (again.ok) {
        const doc2 = await again.json();
        const st = doc2.fields?.appState?.stringValue as string | undefined;
        const cloud2 = st ? validateAndMigrateState(JSON.parse(st)) : null;
        const merged2 = mergeStatesCloudFirst(cloud2, state);
        const body2: FirestoreFieldsBody = {
          fields: {
            appState: { stringValue: JSON.stringify(merged2) },
            updatedAt: { timestampValue: new Date().toISOString() }
          },
          currentDocument: { updateTime: doc2.updateTime as string }
        };
        resp = await fetch(url, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(body2)
        });
      }
    }

    if (resp.ok) {
      console.log('[cloud] saved state to Firestore');
    } else if (resp.status === 403) {
      const errorText = await resp.text();
      console.warn('[cloud] Error 403 al guardar:', errorText);
      console.warn('[cloud] Datos guardados solo en localStorage');
    } else if (resp.status === 404) {
      // Documento no existe aún → crear sin precondición
      const createResp = await fetch(url, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            appState: { stringValue: JSON.stringify(state) },
            updatedAt: { timestampValue: new Date().toISOString() }
          }
        })
      });
      if (createResp.ok) console.log('[cloud] created new state in Firestore');
      else throw new Error(`HTTP ${createResp.status}: ${await createResp.text()}`);
    } else {
      throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
    }
  } catch (e) {
    console.warn('[cloud] save error', e);
    // No re-throw para que la app siga funcionando
  }
}
