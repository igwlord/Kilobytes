// interfaces/AppState.ts - Interfaces para el estado de la aplicación

export interface UserProfile {
  nombre: string;
  peso: number;
  altura_cm: number;
  edad: number;
  genero: 'masculino' | 'femenino';
  actividad: number;
}

export interface Metas {
  kcal: number;
  prote_g_dia: number;
  carbs_g_dia: number;
  grasa_g_dia: number;
  ayuno_h_dia?: number;
}

export interface FoodLog {
  id: string;
  nombre: string;
  emoji: string;
  cantidad_g: number;
  kcal: number;
  prot_g: number;
  carbs_g: number;
  grasa_g: number;
  units?: number;
  unit_name?: string;
}

export interface DayLog {
  peso_kg?: number;
  agua_ml: number;
  pasos: number;
  ejercicio_min: number;
  ayuno_h_iniciado?: string; // timestamp de inicio del ayuno
  ayuno_h_completado?: number; // horas de ayuno completadas
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

export interface AppState {
  profile: UserProfile;
  metas: Metas;
  log: { [date: string]: DayLog };
  /**
   * Sesiones de ayuno a nivel global. Cada sesión tiene un inicio y un fin opcional
   * (si está en curso). La vista por día calcula horas como intersección de cada sesión
   * con la ventana del día [00:00, 24:00).
   */
  fastingSessions?: Array<{
    id: string;
    start: string; // ISO datetime
    end?: string;  // ISO datetime si está cerrada
    source?: 'timer' | 'manual';
    edited?: boolean;
  }>;
  preferences: {
    theme: 'dark' | 'light';
    notifications: boolean;
    units: 'metric' | 'imperial';
  };
}