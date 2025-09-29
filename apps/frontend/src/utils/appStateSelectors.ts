import type { AppState, DayLog } from '../interfaces/AppState';

export type DayTotalsSnapshot = {
  kcal: number;
  prot: number;
  carbs: number;
  grasa: number;
};

export const getDayLog = (state: AppState, date: string): DayLog | undefined => {
  return state.log?.[date];
};

export const getDayTotals = (log?: DayLog | null): DayTotalsSnapshot => ({
  kcal: log?.totals?.kcal ?? 0,
  prot: log?.totals?.prot ?? 0,
  carbs: log?.totals?.carbs ?? 0,
  grasa: log?.totals?.grasa ?? 0,
});

export const getHydrationMl = (log?: DayLog | null): number => {
  return log?.agua_ml_consumida ?? log?.agua_ml ?? 0;
};

export const getSleepHours = (log?: DayLog | null): number => {
  return log?.sueno_h ?? 0;
};

export const getFastingHours = (log?: DayLog | null): number => {
  return log?.ayuno_h ?? 0;
};

export const getTargets = (state: AppState) => ({
  kcal: state.metas?.kcal ?? 2000,
  prot: state.metas?.prote_g_dia ?? 140,
  carbs: state.metas?.carbs_g_dia ?? 225,
  grasa: state.metas?.grasa_g_dia ?? 60,
  agua: state.metas?.agua_ml ?? 2000,
  ayuno: state.metas?.ayuno_h_dia ?? 14,
});
