export type Objetivo = 'bajar' | 'mantener' | 'subir';
export type Intensidad = 'lento' | 'moderado' | 'agresivo';

export interface PerfilMin {
  peso: number; // kg
  altura_cm: number;
  edad: number;
  genero: 'masculino' | 'femenino';
  actividad: number; // factor TDEE
}

export interface ComputeGoalsInput {
  perfil: PerfilMin;
  objetivo: Objetivo;
  peso_objetivo?: number; // kg
  intensidad?: Intensidad; // default 'moderado'
  proteinaAlta?: boolean; // si true, sube gramos por kg
}

export interface GoalsResult {
  kcal: number;
  prote_g_dia: number;
  grasa_g_dia: number;
  carbs_g_dia: number;
  agua_ml: number;
  pasos_dia: number;
  kcal_ajuste_dia: number; // negativo si déficit, positivo si superávit
  ritmo_kg_semana: number; // +/- kg por semana estimado
  semanas_estimadas?: number; // a objetivo
  fecha_objetivo?: string; // ISO date
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export function calcularTMB(perfil: PerfilMin): number {
  const { peso, altura_cm, edad, genero } = perfil;
  return genero === 'masculino'
    ? 10 * peso + 6.25 * altura_cm - 5 * edad + 5
    : 10 * peso + 6.25 * altura_cm - 5 * edad - 161;
}

export function calcularTDEE(perfil: PerfilMin): number {
  return calcularTMB(perfil) * perfil.actividad;
}

export function computeGoals(input: ComputeGoalsInput): GoalsResult {
  const { perfil, objetivo, intensidad = 'moderado', proteinaAlta, peso_objetivo } = input;
  const tdee = calcularTDEE(perfil);

  // Ajuste calórico diario según objetivo + intensidad
  const ajustes: Record<Intensidad, number> = {
    lento: 300,
    moderado: 450,
    agresivo: 600,
  };
  const delta = ajustes[intensidad];
  const kcal_ajuste_dia = objetivo === 'bajar' ? -delta : objetivo === 'subir' ? +delta : 0;
  const kcalObjetivo = clamp(Math.round(tdee + kcal_ajuste_dia), 1200, 4500);

  // Proteínas y grasas por kg; si proteinaAlta, incrementar 0.3 g/kg
  const ppk = proteinaAlta ? 2.1 : 1.8; // g/kg
  const gpk = 0.8; // g/kg baseline; si subir, podemos subir a 1.0
  const grasaPorKg = objetivo === 'subir' ? 1.0 : gpk;

  const prote_g = Math.round(perfil.peso * ppk);
  const grasa_g = Math.round(perfil.peso * grasaPorKg);
  const kcalProte = prote_g * 4;
  const kcalGrasa = grasa_g * 9;
  const carbs_g = Math.max(0, Math.round((kcalObjetivo - kcalProte - kcalGrasa) / 4));

  // Agua recomendada: 35 ml/kg, clamp 1.5–4 L; +250ml si pasos_dia > 10k (se define abajo)
  const aguaBase = clamp(perfil.peso * 35, 1500, 4000);
  const pasosObjetivo = 8000; // default razonable; podríamos ajustar por objetivo
  const agua_ml = Math.round(aguaBase + (pasosObjetivo > 10000 ? 250 : 0));

  // Ritmo esperado a partir del ajuste calórico
  const kgPorDia = kcal_ajuste_dia / 7700; // 1kg ~ 7700 kcal
  const ritmo_kg_semana = +(kgPorDia * 7).toFixed(3);

  let semanas_estimadas: number | undefined;
  let fecha_objetivo: string | undefined;
  if (peso_objetivo && objetivo !== 'mantener' && ritmo_kg_semana !== 0) {
    const deltaKg = objetivo === 'bajar' ? perfil.peso - peso_objetivo : peso_objetivo - perfil.peso;
    if (deltaKg > 0) {
      semanas_estimadas = Math.max(0, Math.ceil(deltaKg / Math.abs(ritmo_kg_semana)));
      const target = new Date();
      target.setDate(target.getDate() + semanas_estimadas * 7);
      fecha_objetivo = target.toISOString().split('T')[0];
    }
  }

  return {
    kcal: kcalObjetivo,
    prote_g_dia: prote_g,
    grasa_g_dia: grasa_g,
    carbs_g_dia: carbs_g,
    agua_ml,
    pasos_dia: pasosObjetivo,
    kcal_ajuste_dia,
    ritmo_kg_semana,
    semanas_estimadas,
    fecha_objetivo,
  };
}
