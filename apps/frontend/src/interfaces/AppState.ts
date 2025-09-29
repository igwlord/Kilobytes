// interfaces/AppState.ts - Interfaces para el estado de la aplicación

export interface UserProfile {
  nombre: string;
  peso: number;
  altura_cm: number;
  edad: number;
  genero: 'masculino' | 'femenino';
  actividad: number;
  exclusiones: string[];
  objetivo: string;
  theme: string;
  peso_inicial?: number;
  desbloquearRecetas?: boolean;
  silenciarNotificaciones?: boolean;
}

export interface Metas {
  kcal: number;
  prote_g_dia: number;
  carbs_g_dia: number;
  grasa_g_dia: number;
  agua_ml: number;
  pasos_dia: number;
  peso_objetivo: number;
  ejercicio_min?: number;
  comidas_saludables?: number;
  ayuno_h_dia?: number;
}

export interface FoodLog {
  id: string;
  nombre: string;
  emoji?: string; // Optional emoji for compatibility
  cantidad_g: number;
  kcal: number;
  prot_g: number;
  carbs_g: number;
  grasa_g: number;
  units?: number;
  unit_name?: string;
  hora?: string; // Optional timestamp for meal logging
}

export interface DayLog {
  peso_kg?: number;
  agua_ml?: number;
  agua_ml_consumida?: number;
  pasos?: number; // Made optional for compatibility
  ejercicio_min?: number; // Made optional for compatibility
  ayuno_h_iniciado?: string; // timestamp de inicio del ayuno
  ayuno_h_completado?: number; // horas de ayuno completadas
  ayuno_h?: number; // horas de ayuno (legacy)
  sueno_h?: number;
  comidas: {
    desayuno: FoodLog[];
    almuerzo: FoodLog[];
    merienda: FoodLog[];
    cena: FoodLog[];
    snack: FoodLog[];
  };
  totals: {
    kcal: number;
    prot: number;
    carbs: number;
    grasa: number;
  };
}

// FastingSession type for fasting tracking
export interface FastingSession {
  id: string;
  start: string; // ISO datetime
  end?: string;  // ISO datetime si está cerrada
  source?: 'timer' | 'manual';
  edited?: boolean;
}

export interface AppState {
  perfil: UserProfile; // Using the actual property name used in code
  metas: Metas;
  log: { [date: string]: DayLog };
  /**
   * Sesiones de ayuno a nivel global. Cada sesión tiene un inicio y un fin opcional
   * (si está en curso). La vista por día calcula horas como intersección de cada sesión
   * con la ventana del día [00:00, 24:00).
   */
  fastingSessions?: FastingSession[];
}

// Legacy types for backward compatibility
export type DayLogMap = { [date: string]: DayLog };