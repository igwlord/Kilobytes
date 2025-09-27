import React, { useState, useEffect } from 'react';
import { computeGoals, type Objetivo, type Intensidad } from '../utils/goalsEngine';
import './Plan.css';

interface PlanProps {
  appState: AppState;
  updateAppState: (newState: AppState) => void;
  showToast: (message: string) => void;
}

interface DayLogMin {
  totals?: { kcal: number; prot: number; carbs: number; grasa: number };
  sueno_h?: number;
  ayuno_h?: number;
}

interface UserProfile {
  nombre: string;
  peso: number;
  altura_cm: number;
  edad: number;
  genero: 'masculino' | 'femenino';
  actividad: number;
  exclusiones: string[];
  objetivo: string;
  theme: string;
}

interface Goals {
  kcal: number;
  prote_g_dia: number;
  grasa_g_dia: number;
  carbs_g_dia: number;
  agua_ml: number;
  pasos_dia: number;
  peso_objetivo: number;
  ejercicio_min?: number;
  comidas_saludables?: number;
  ayuno_h_dia?: number; // objetivo de horas de ayuno diario
}

interface AppState {
  perfil: UserProfile;
  metas: Goals;
  log: { [date: string]: DayLogMin };
}

const Plan: React.FC<PlanProps> = ({ appState, updateAppState, showToast }) => {
  // Perfil editable
  const [perfilEdit, setPerfilEdit] = useState<UserProfile>(appState.perfil);
  const [pesoObjetivo, setPesoObjetivo] = useState<number>(appState.metas.peso_objetivo || appState.perfil.peso);
  const [pesoStr, setPesoStr] = useState<string>(String(appState.perfil.peso ?? ''));
  const [alturaStr, setAlturaStr] = useState<string>(String(appState.perfil.altura_cm ?? ''));
  const [edadStr, setEdadStr] = useState<string>(String(appState.perfil.edad ?? ''));
  const [pesoObjStr, setPesoObjStr] = useState<string>(String(appState.metas.peso_objetivo || appState.perfil.peso || ''));

  const [objetivo, setObjetivo] = useState<Objetivo>('mantener');
  const [intensidad, setIntensidad] = useState<Intensidad>('moderado');
  const [exclusiones, setExclusiones] = useState<string[]>([]);
  const [ayunoHoras, setAyunoHoras] = useState<number>(appState.metas.ayuno_h_dia ?? 14);
  const [ayunoHorasStr, setAyunoHorasStr] = useState<string>(String(appState.metas.ayuno_h_dia ?? 14));
  const [ayunoPreset, setAyunoPreset] = useState<string>('16/8');
  
  // Accordion visibility (collapsed by default on mobile)
  const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 480px)').matches;
  const [openPerfil, setOpenPerfil] = useState(!isMobile);
  const [openObjetivo, setOpenObjetivo] = useState(!isMobile);
  const [openAuto, setOpenAuto] = useState(!isMobile);
  const [openAyuno, setOpenAyuno] = useState(false);
  const [openExclusiones, setOpenExclusiones] = useState(false);
  const [autoGoals, setAutoGoals] = useState({
    kcal: 2000,
    prote_g_dia: 140,
    grasa_g_dia: 60,
    carbs_g_dia: 225,
    agua_ml: 2000,
    pasos_dia: 8000,
    semanas_estimadas: undefined as number | undefined,
    fecha_objetivo: undefined as string | undefined,
    ritmo_kg_semana: 0,
  } as Partial<ReturnType<typeof computeGoals>> & {
    kcal: number; prote_g_dia: number; grasa_g_dia: number; carbs_g_dia: number; agua_ml: number; pasos_dia: number; ritmo_kg_semana: number;
  });

  const tryComputeGoals = React.useCallback((obj: Objetivo, inten: Intensidad) => {
    const p = perfilEdit;
    if (!p) return;
    const res = computeGoals({
      perfil: {
        peso: p.peso,
        altura_cm: p.altura_cm,
        edad: p.edad,
        genero: p.genero,
        actividad: p.actividad,
      },
      objetivo: obj,
      intensidad: inten,
      peso_objetivo: pesoObjetivo,
      proteinaAlta: true,
    });
    setAutoGoals(res);
  }, [perfilEdit, pesoObjetivo]);

  useEffect(() => {
    if (appState.perfil && appState.metas) {
      setPerfilEdit(appState.perfil);
      setPesoObjetivo(appState.metas.peso_objetivo || appState.perfil.peso);
      setPesoStr(String(appState.perfil.peso ?? ''));
      setAlturaStr(String(appState.perfil.altura_cm ?? ''));
      setEdadStr(String(appState.perfil.edad ?? ''));
      setPesoObjStr(String(appState.metas.peso_objetivo || appState.perfil.peso || ''));
      setObjetivo((appState.perfil.objetivo as Objetivo) || 'mantener');
      setExclusiones(appState.perfil.exclusiones || []);
      setAyunoHoras(appState.metas.ayuno_h_dia ?? 14);
      setAyunoHorasStr(String(appState.metas.ayuno_h_dia ?? 14));
      // Precalcular metas automáticas con la info actual
      tryComputeGoals((appState.perfil.objetivo as Objetivo) || 'mantener', intensidad);
    }
  }, [appState, intensidad, tryComputeGoals]);

  // Helpers
  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
  const commitNumber = (
    raw: string,
    min: number,
    max: number,
    decimals: number = 0
  ) => {
    if (raw === '' || raw === '-' || raw === '.') return undefined as unknown as number; // nothing to commit
    const n = Number(raw.replace(',', '.'));
    if (Number.isNaN(n)) return undefined as unknown as number;
    const fixed = Number(n.toFixed(decimals));
    return clamp(fixed, min, max);
  };

  // Persist helpers
  const persistPerfil = (patch: Partial<UserProfile>) => {
    updateAppState({
      ...appState,
      perfil: { ...appState.perfil, ...patch },
    });
  };
  const persistMetas = (patch: Partial<Goals>) => {
    updateAppState({
      ...appState,
      metas: { ...appState.metas, ...patch },
    });
  };

  const toggleExclusion = (exclusion: string) => {
    const newExclusiones = exclusiones.includes(exclusion)
      ? exclusiones.filter(e => e !== exclusion)
      : [...exclusiones, exclusion];

    setExclusiones(newExclusiones);
    
    const newState = {
      ...appState,
      perfil: {
        ...appState.perfil,
        exclusiones: newExclusiones
      }
    };
    
    updateAppState(newState);
    showToast('Preferencias guardadas ✅');
  };

  const applyPlan = () => {
    const metas = {
      ...appState.metas,
      kcal: autoGoals.kcal,
      prote_g_dia: autoGoals.prote_g_dia,
      grasa_g_dia: autoGoals.grasa_g_dia,
      carbs_g_dia: autoGoals.carbs_g_dia,
      agua_ml: autoGoals.agua_ml,
      pasos_dia: autoGoals.pasos_dia,
      peso_objetivo: pesoObjetivo,
      ayuno_h_dia: ayunoHoras,
    };
    updateAppState({
      ...appState,
      perfil: { ...perfilEdit, objetivo },
      metas,
    });
    showToast('Metas calculadas y aplicadas ✨');
  };

  return (
    <div className="plan-container">
      <h1 className="plan-title">Configuración de Plan y Metas</h1>
      <div className="plan-card">
        {/* Perfil */}
        <div className="plan-section accordion">
          <button className={`accordion-header ${openPerfil ? 'active' : ''}`} onClick={()=> setOpenPerfil(o=>!o)}>
            <span>Mi Perfil</span>
            <span className={`chevron ${openPerfil ? 'open' : ''}`}>▾</span>
          </button>
          {openPerfil && (
            <div className="accordion-content">
              <p className="hint">Usamos estos datos para calcular calorías, macros y tiempos estimados.</p>
              <div className="profile-grid">
                <div className="field-group">
                  <label className="field-label">⚖️ Tu peso actual</label>
                  <div className="input-with-unit">
                    <input
                      type="text"
                      inputMode="decimal"
                      className="plan-input-clear"
                      value={pesoStr}
                      onChange={(e) => setPesoStr(e.target.value)}
                      onKeyDown={(e)=>{ if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur(); }}
                      onBlur={() => {
                        const c = commitNumber(pesoStr, 30, 300, 1);
                        if (c !== (undefined as unknown as number)) {
                          setPerfilEdit({ ...perfilEdit, peso: c });
                          setPesoStr(String(c));
                          tryComputeGoals(objetivo, intensidad);
                          persistPerfil({ peso: c });
                        } else {
                          setPesoStr(String(perfilEdit.peso));
                        }
                      }}
                    />
                    <span className="field-unit">kg</span>
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">📏 Tu altura</label>
                  <div className="input-with-unit">
                    <input
                      type="text"
                      inputMode="numeric"
                      className="plan-input-clear"
                      value={alturaStr}
                      onChange={(e) => setAlturaStr(e.target.value)}
                      onKeyDown={(e)=>{ if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur(); }}
                      onBlur={() => {
                        const c = commitNumber(alturaStr, 120, 230, 0);
                        if (c !== (undefined as unknown as number)) {
                          setPerfilEdit({ ...perfilEdit, altura_cm: c });
                          setAlturaStr(String(c));
                          tryComputeGoals(objetivo, intensidad);
                          persistPerfil({ altura_cm: c });
                        } else {
                          setAlturaStr(String(perfilEdit.altura_cm));
                        }
                      }}
                    />
                    <span className="field-unit">cm</span>
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">🎂 Tu edad</label>
                  <div className="input-with-unit">
                    <input
                      type="text"
                      inputMode="numeric"
                      className="plan-input-clear"
                      value={edadStr}
                      onChange={(e) => setEdadStr(e.target.value)}
                      onKeyDown={(e)=>{ if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur(); }}
                      onBlur={() => {
                        const c = commitNumber(edadStr, 10, 100, 0);
                        if (c !== (undefined as unknown as number)) {
                          setPerfilEdit({ ...perfilEdit, edad: c });
                          setEdadStr(String(c));
                          tryComputeGoals(objetivo, intensidad);
                          persistPerfil({ edad: c });
                        } else {
                          setEdadStr(String(perfilEdit.edad));
                        }
                      }}
                    />
                    <span className="field-unit">años</span>
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">👤 Género</label>
                  <select className="plan-select-clear" value={perfilEdit.genero}
                    onChange={(e)=> { 
                      const g = (e.target.value as 'masculino' | 'femenino');
                      setPerfilEdit({...perfilEdit, genero: g}); 
                      tryComputeGoals(objetivo,intensidad);
                      persistPerfil({ genero: g });
                    }}>
                    <option value="masculino">👨 Masculino</option>
                    <option value="femenino">👩 Femenino</option>
                  </select>
                </div>

                <div className="field-group">
                  <label className="field-label">🏃 Nivel de actividad</label>
                  <select className="plan-select-clear" value={perfilEdit.actividad}
                    onChange={(e)=> { 
                      const act = Number(e.target.value);
                      setPerfilEdit({...perfilEdit, actividad: act}); 
                      tryComputeGoals(objetivo,intensidad);
                      persistPerfil({ actividad: act });
                    }}>
                    <option value={1.2}>😴 Sedentario</option>
                    <option value={1.375}>🚶 Ligero</option>
                    <option value={1.55}>🏃 Moderado</option>
                    <option value={1.725}>💪 Activo</option>
                    <option value={1.9}>🔥 Muy activo</option>
                  </select>
                </div>

                <div className="field-group">
                  <label className="field-label">🎯 Peso objetivo</label>
                  <div className="input-with-unit">
                    <input
                      type="text"
                      inputMode="decimal"
                      className="plan-input-clear"
                      value={pesoObjStr}
                      onChange={(e) => setPesoObjStr(e.target.value)}
                      onKeyDown={(e)=>{ if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur(); }}
                      onBlur={() => {
                        const c = commitNumber(pesoObjStr, 30, 300, 1);
                        if (c !== (undefined as unknown as number)) {
                          setPesoObjetivo(c);
                          setPesoObjStr(String(c));
                          tryComputeGoals(objetivo, intensidad);
                          persistMetas({ peso_objetivo: c });
                        } else {
                          setPesoObjStr(String(pesoObjetivo));
                        }
                      }}
                    />
                    <span className="field-unit">kg</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="plan-section accordion">
          <button className={`accordion-header ${openObjetivo ? 'active' : ''}`} onClick={()=> setOpenObjetivo(o=>!o)}>
            <span>Mi objetivo principal</span>
            <span className={`chevron ${openObjetivo ? 'open' : ''}`}>▾</span>
          </button>
          {openObjetivo && (
          <div className="accordion-content">
          <div className="field-group-full">
            <label className="field-label">🎯 ¿Qué querés lograr?</label>
            <select 
              className="plan-select-clear"
              value={objetivo}
              onChange={(e) => { 
                const val = e.target.value as Objetivo; 
                setObjetivo(val); 
                tryComputeGoals(val, intensidad);
                persistPerfil({ objetivo: val });
              }}
            >
              <option value="bajar">📉 Bajar peso</option>
              <option value="mantener">⚖️ Mantener peso</option>
              <option value="subir">📈 Subir peso</option>
            </select>
          </div>

          <div className="field-group-full">
            <label className="field-label">⚡ ¿Qué tan rápido?</label>
            <select
              className="plan-select-clear"
              value={intensidad}
              onChange={(e) => { const val = e.target.value as Intensidad; setIntensidad(val); tryComputeGoals(objetivo, val); }}
            >
              <option value="lento">🐢 Lento y sostenible</option>
              <option value="moderado">🚀 Moderado</option>
              <option value="agresivo">⚡ Rápido</option>
            </select>
          </div>

          <div className="quick-plans-section">
            <p className="field-label">⚡ O elegí un plan listo:</p>
            <div className="quick-plans">
              <button className="quick-plan-btn lose" 
                onClick={()=>{ setObjetivo('bajar'); setIntensidad('moderado'); tryComputeGoals('bajar','moderado'); persistPerfil({ objetivo: 'bajar' }); }}>
                🔻 Perder grasa
              </button>
              <button className="quick-plan-btn gain" 
                onClick={()=>{ setObjetivo('subir'); setIntensidad('lento'); tryComputeGoals('subir','lento'); persistPerfil({ objetivo: 'subir' }); }}>
                💪 Ganar músculo
              </button>
              <button className="quick-plan-btn maintain" 
                onClick={()=>{ setObjetivo('mantener'); setIntensidad('lento'); tryComputeGoals('mantener','lento'); persistPerfil({ objetivo: 'mantener' }); }}>
                ⚖️ Mantener
              </button>
            </div>
          </div>
          </div>
          )}
        </div>

        <div className="plan-section accordion">
          <button className={`accordion-header ${openAuto ? 'active' : ''}`} onClick={()=> setOpenAuto(o=>!o)}>
            <span>Objetivos diarios (automáticos)</span>
            <span className={`chevron ${openAuto ? 'open' : ''}`}>▾</span>
          </button>
          {openAuto && (
          <div className="accordion-content">
          <h3 className="plan-subsection-title">Objetivos diarios (automáticos)</h3>
          <div className="plan-macros-grid">
            <div><label className="plan-input-label">Calorías</label><div className="plan-kpi">{autoGoals.kcal} kcal</div></div>
            <div><label className="plan-input-label">Proteínas</label><div className="plan-kpi">{autoGoals.prote_g_dia} g</div></div>
            <div><label className="plan-input-label">Grasas</label><div className="plan-kpi">{autoGoals.grasa_g_dia} g</div></div>
            <div><label className="plan-input-label">Carbs</label><div className="plan-kpi">{autoGoals.carbs_g_dia} g</div></div>
            <div>
              <label className="plan-input-label">Agua</label>
              <div className="plan-kpi">{(autoGoals.agua_ml/1000).toFixed(1)} L · {Math.ceil((autoGoals.agua_ml||0)/250)} vasos</div>
            </div>
            <div><label className="plan-input-label">Pasos</label><div className="plan-kpi">{autoGoals.pasos_dia.toLocaleString()}</div></div>
          </div>
          {autoGoals.semanas_estimadas !== undefined && (
            <div className="plan-estimations">
              <div>Ritmo estimado: {autoGoals.ritmo_kg_semana > 0 ? '+' : ''}{autoGoals.ritmo_kg_semana} kg/sem</div>
              <div>Tiempo a objetivo: ~{autoGoals.semanas_estimadas} semanas</div>
              {autoGoals.fecha_objetivo && <div>Fecha objetivo: {autoGoals.fecha_objetivo}</div>}
            </div>
          )}
          <button onClick={applyPlan} className="plan-calculate-btn">Aplicar metas automáticas</button>
          </div>
          )}
        </div>

        {/* Ayuno intermitente */}
        <div className="plan-section accordion">
          <button className={`accordion-header ${openAyuno ? 'active' : ''}`} onClick={()=> setOpenAyuno(o=>!o)}>
            <span>Ayuno Intermitente</span>
            <span className={`chevron ${openAyuno ? 'open' : ''}`}>▾</span>
          </button>
          {openAyuno && (
          <div className="accordion-content">
          <div className="fasting-section">
            <div className="field-group">
              <label className="field-label">⏰ Tipo de ayuno</label>
              <select className="plan-select-clear" value={ayunoPreset}
                onChange={(e)=>{
                  const v = e.target.value; setAyunoPreset(v);
                  const map: Record<string, number> = { '12/12': 12, '14/10': 14, '16/8': 16, '18/6': 18, 'custom': ayunoHoras };
                  const nv = map[v] ?? 14;
                  setAyunoHoras(nv);
                  setAyunoHorasStr(String(nv));
                  if (v !== 'custom') persistMetas({ ayuno_h_dia: nv });
                }}>
                <option value="12/12">🕛 12/12 - Principiante</option>
                <option value="14/10">🕑 14/10 - Fácil</option>
                <option value="16/8">🕒 16/8 - Popular</option>
                <option value="18/6">🕕 18/6 - Avanzado</option>
                <option value="custom">⚙️ Personalizado</option>
              </select>
            </div>
            <div className="field-group">
              <label className="field-label">⏳ Horas de ayuno por día</label>
              <div className="input-with-unit">
                <input
                  type="text"
                  inputMode="numeric"
                  className="plan-input-clear"
                  value={ayunoHorasStr}
                  onChange={(e) => setAyunoHorasStr(e.target.value)}
                  onKeyDown={(e)=>{ if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur(); }}
                  onBlur={() => {
                    const c = commitNumber(ayunoHorasStr, 10, 22, 0);
                    if (c !== (undefined as unknown as number)) {
                      setAyunoHoras(c);
                      setAyunoHorasStr(String(c));
                      persistMetas({ ayuno_h_dia: c });
                    } else {
                      setAyunoHorasStr(String(ayunoHoras));
                    }
                  }}
                  disabled={ayunoPreset !== 'custom'}
                  title={ayunoPreset !== 'custom' ? 'Cambiá a Personalizado para editar las horas' : ''}
                />
                <span className="field-unit">horas</span>
              </div>
            </div>
          </div>
          </div>
          )}
        </div>

        <div className="plan-section accordion">
          <button className={`accordion-header ${openExclusiones ? 'active' : ''}`} onClick={()=> setOpenExclusiones(o=>!o)}>
            <span>Exclusiones alimentarias</span>
            <span className={`chevron ${openExclusiones ? 'open' : ''}`}>▾</span>
          </button>
          {openExclusiones && (
          <div className="accordion-content">
          <h3 className="plan-subsection-title">Exclusiones alimentarias</h3>
          <div className="plan-exclusions">
            {[
              { key: 'pescado', label: 'Sin pescado' },
              { key: 'yogur', label: 'Sin yogur' },
              { key: 'tacc', label: 'Sin TACC' },
              { key: 'vegetariano', label: 'Vegetariano' }
            ].map(exclusion => (
              <label key={exclusion.key} className="plan-exclusion-item">
                <input 
                  type="checkbox" 
                  checked={exclusiones.includes(exclusion.key)}
                  onChange={() => toggleExclusion(exclusion.key)}
                  className="plan-checkbox"
                />
                <span>{exclusion.label}</span>
              </label>
            ))}
          </div>
          </div>
          )}
        </div>

        <button onClick={applyPlan} className="plan-apply-btn">Guardar configuración y aplicar</button>
      </div>
    </div>
  );
};

export default Plan;