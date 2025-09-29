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
  preferences: {
    theme: 'dark' | 'light';
    notifications: boolean;
    units: 'metric' | 'imperial';
  };
}