import React, { useMemo, useState } from 'react';
import './Progreso.css';
import { getRecipeSteps } from '../data/recetasPasoAPaso';

// Tipos mínimos usados en este componente (evita any)
interface Totals { kcal?: number; prot?: number; carbs?: number; grasa?: number }
interface DayLog { totals?: Totals; agua_ml?: number; agua_ml_consumida?: number; sueno_h?: number; ayuno_h?: number }
type Objetivo = 'bajar' | 'mantener' | 'subir';
interface AppStateMin {
  perfil?: { peso?: number; objetivo?: string; desbloquearRecetas?: boolean };
  metas?: { kcal?: number; prote_g_dia?: number; agua_ml?: number; carbs_g_dia?: number; grasa_g_dia?: number; ayuno_h_dia?: number };
  log?: Record<string, DayLog | undefined>;
}

interface ProgresoProps {
  appState: AppStateMin;
}

type Section = 'resumen' | 'peso' | 'tendencias' | 'recetas' | 'tips' | null;
type KPIKey = 'kcal' | 'prot' | 'carbs' | 'grasa' | 'agua' | 'sueno' | 'ayuno';

const Progreso: React.FC<ProgresoProps> = ({ appState }) => {
  const [openSection, setOpenSection] = useState<Section>('resumen');
  const [rangeDays, setRangeDays] = useState<number>(() => {
    const saved = Number(localStorage.getItem('kiloByteProgressRange') || '7');
    return [7, 14, 30].includes(saved) ? saved : 7;
  });

  const generateWeightData = () => {
    // Simulamos datos de peso para mostrar la gráfica
    // En una implementación real, estos datos vendrían del estado de la app
    const currentWeight = appState.perfil?.peso || 70;
    const baseWeight = currentWeight + 3; // Peso inicial simulado
    
    const data = [];
    for (let i = 0; i < 12; i++) {
      const week = i + 1;
      const weightLoss = (i * 0.3) + Math.random() * 0.4 - 0.2; // Simulamos pérdida gradual
      const weight = Math.max(baseWeight - weightLoss, currentWeight - 2);
      data.push({ week, weight: Math.round(weight * 10) / 10 });
    }
    
    return data;
  };

  const generateSVGPath = (data: Array<{ week: number; weight: number }>) => {
    if (data.length === 0) return '';
    
    const width = 280;
    const height = 120;
    const padding = 20;
    
    const minWeight = Math.min(...data.map(d => d.weight)) - 1;
    const maxWeight = Math.max(...data.map(d => d.weight)) + 1;
    const weightRange = maxWeight - minWeight;
    
    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
      const y = padding + ((maxWeight - d.weight) / weightRange) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');
    
    return points;
  };

  const weightData = generateWeightData();
  const svgPath = generateSVGPath(weightData);
  const currentWeight = weightData[weightData.length - 1]?.weight || 70;
  const initialWeight = weightData[0]?.weight || 73;
  const weightLoss = Math.round((initialWeight - currentWeight) * 10) / 10;

  const getRangeDays = (n: number) => {
    const days: { key: string; label: string }[] = [];
    const today = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('es-AR', { weekday: 'short' });
      days.push({ key, label });
    }
    return days;
  };

  const trends = useMemo(() => {
    const days = getRangeDays(rangeDays);
    const targetKcal = appState.metas?.kcal || 2000;
    const targetProt = appState.metas?.prote_g_dia || 140;
    const targetAgua = appState.metas?.agua_ml || 2000;
    const targetCarbs = appState.metas?.carbs_g_dia || 225;
    const targetGrasa = appState.metas?.grasa_g_dia || 60;
    const targetAyuno = appState.metas?.ayuno_h_dia || 14;
    return days.map(({ key, label }) => {
      const log = appState.log?.[key];
      const kcal = log?.totals?.kcal || 0;
      const prot = log?.totals?.prot || 0;
      const carbs = log?.totals?.carbs || 0;
      const grasa = log?.totals?.grasa || 0;
      const agua = (log?.agua_ml_consumida ?? log?.agua_ml) || 0;
      const sueno = log?.sueno_h || 0;
      const ayuno = log?.ayuno_h || 0;
      return {
        date: label,
        kcal, prot, carbs, grasa, agua, sueno, ayuno,
        pct: {
          kcal: targetKcal > 0 ? Math.round((kcal / targetKcal) * 100) : 0,
          prot: targetProt > 0 ? Math.round((prot / targetProt) * 100) : 0,
          carbs: targetCarbs > 0 ? Math.round((carbs / targetCarbs) * 100) : 0,
          grasa: targetGrasa > 0 ? Math.round((grasa / targetGrasa) * 100) : 0,
          agua: targetAgua > 0 ? Math.round((agua / targetAgua) * 100) : 0,
          sueno: Math.round((sueno / 8) * 100),
          ayuno: targetAyuno > 0 ? Math.round((ayuno / targetAyuno) * 100) : 0,
        }
      };
    });
  }, [appState.log, appState.metas?.kcal, appState.metas?.prote_g_dia, appState.metas?.agua_ml, appState.metas?.carbs_g_dia, appState.metas?.grasa_g_dia, appState.metas?.ayuno_h_dia, rangeDays]);

  const avg = useMemo(() => {
    const base = { kcal:0, prot:0, carbs:0, grasa:0, agua:0, sueno:0, ayuno:0 };
    const sum = trends.reduce((acc, d)=> ({
      kcal: acc.kcal + d.pct.kcal,
      prot: acc.prot + d.pct.prot,
      carbs: acc.carbs + d.pct.carbs,
      grasa: acc.grasa + d.pct.grasa,
      agua: acc.agua + d.pct.agua,
      sueno: acc.sueno + d.pct.sueno,
      ayuno: acc.ayuno + d.pct.ayuno,
    }), base);
    const div = Math.max(1, trends.length);
    return {
      kcal: Math.round(sum.kcal / div),
      prot: Math.round(sum.prot / div),
      agua: Math.round(sum.agua / div),
      carbs: Math.round(sum.carbs / div),
      grasa: Math.round(sum.grasa / div),
      sueno: Math.round(sum.sueno / div),
      ayuno: Math.round(sum.ayuno / div),
    };
  }, [trends]);

  // Recetas por objetivo (extraídas de Recetas.md)
  type Recipe = { title: string; group: 'Desayuno' | 'Almuerzo' | 'Cena' | 'Snack' };
  const recetas: Record<Objetivo, Recipe[]> = {
    bajar: [
      { title: 'Omelette de claras con espinaca y tomate', group: 'Desayuno' },
      { title: 'Tostada integral con palta y sésamo', group: 'Desayuno' },
      { title: 'Smoothie verde detox', group: 'Desayuno' },
      { title: 'Yogur descremado con arándanos y chía', group: 'Desayuno' },
      { title: 'Pancakes de avena y clara', group: 'Desayuno' },
      { title: 'Ensalada de pollo a la plancha', group: 'Almuerzo' },
      { title: 'Zoodles de zucchini con salsa de tomate', group: 'Almuerzo' },
      { title: 'Bowl de quinoa con vegetales al vapor', group: 'Almuerzo' },
      { title: 'Ensalada de atún mediterránea', group: 'Almuerzo' },
      { title: 'Revuelto de claras con champiñones y cebolla', group: 'Almuerzo' },
      { title: 'Salmón al horno con espárragos', group: 'Cena' },
      { title: 'Tortilla de espinaca y cebolla', group: 'Cena' },
      { title: 'Pechuga de pollo rellena con espinaca y ricotta', group: 'Cena' },
      { title: 'Berenjenas rellenas con lentejas', group: 'Cena' },
      { title: 'Sopa de calabaza y jengibre', group: 'Cena' },
      { title: 'Rolls de lechuga con pavo', group: 'Snack' },
      { title: 'Bastones de zanahoria y apio con hummus', group: 'Snack' },
      { title: 'Ensalada de garbanzos estilo griego', group: 'Snack' },
      { title: 'Tostada integral con ricotta y frutillas', group: 'Snack' },
      { title: 'Smoothie de frutos rojos y proteína', group: 'Snack' },
    ],
    subir: [
      { title: 'Omelette de claras y 2 huevos + avena', group: 'Desayuno' },
      { title: 'Smoothie de proteína post-entrenamiento', group: 'Desayuno' },
      { title: 'Tostadas integrales con palta y salmón ahumado', group: 'Desayuno' },
      { title: 'Panqueques de avena y claras con ricotta y frutillas', group: 'Desayuno' },
      { title: 'Bowl de yogur griego con granola y miel', group: 'Desayuno' },
      { title: 'Pollo grillado con arroz integral y brócoli', group: 'Almuerzo' },
      { title: 'Pasta integral con carne magra y salsa casera', group: 'Almuerzo' },
      { title: 'Wrap integral de pavo y vegetales', group: 'Almuerzo' },
      { title: 'Bowl de quinoa con atún y verduras salteadas', group: 'Almuerzo' },
      { title: 'Hamburguesa casera de garbanzos + huevo + ensalada', group: 'Almuerzo' },
      { title: 'Salmón al horno con batata y espárragos', group: 'Cena' },
      { title: 'Tacos de carne magra con guacamole', group: 'Cena' },
      { title: 'Pollo al curry con arroz basmati y verduras', group: 'Cena' },
      { title: 'Lentejas estofadas con huevo duro y arroz integral', group: 'Cena' },
      { title: 'Pizza proteica casera', group: 'Cena' },
      { title: 'Sándwich integral de pavo y queso fresco', group: 'Snack' },
      { title: 'Bastones + hummus + 1 huevo duro', group: 'Snack' },
      { title: 'Batido leche + avena + proteína + banana', group: 'Snack' },
      { title: 'Tostadas con mantequilla de maní + banana', group: 'Snack' },
      { title: 'Ensalada de garbanzos con atún y huevo duro', group: 'Snack' },
    ],
    mantener: [
      { title: 'Omelette de claras + 1 huevo con espinaca', group: 'Desayuno' },
      { title: 'Tostadas integrales con palta + huevo duro', group: 'Desayuno' },
      { title: 'Smoothie de frutos rojos + chía', group: 'Desayuno' },
      { title: 'Yogur con granola sin azúcar y banana', group: 'Desayuno' },
      { title: 'Pancakes integrales de avena y claras', group: 'Desayuno' },
      { title: 'Ensalada de pollo con palmitos', group: 'Almuerzo' },
      { title: 'Quinoa con vegetales y garbanzos', group: 'Almuerzo' },
      { title: 'Wrap integral de atún y vegetales', group: 'Almuerzo' },
      { title: 'Pasta integral con salsa de tomate natural', group: 'Almuerzo' },
      { title: 'Bowl de arroz integral con huevo pochê y brócoli', group: 'Almuerzo' },
      { title: 'Merluza a la plancha con puré de calabaza', group: 'Cena' },
      { title: 'Pechuga rellena con espinaca + ricotta', group: 'Cena' },
      { title: 'Salmón al vapor con ensalada de kale y palta', group: 'Cena' },
      { title: 'Tortilla de espárragos y champiñones', group: 'Cena' },
      { title: 'Berenjena gratinada con ricotta y salsa de tomate', group: 'Cena' },
      { title: 'Bastones con hummus', group: 'Snack' },
      { title: 'Queso fresco light con tomate y orégano', group: 'Snack' },
      { title: 'Tostada integral con ricotta y frutillas', group: 'Snack' },
      { title: 'Mix frutos secos + 1 manzana', group: 'Snack' },
      { title: 'Smoothie de kiwi + espinaca + pepino + limón', group: 'Snack' },
    ],
  };

  const objetivoRaw = (appState.perfil?.objetivo || 'mantener').toLowerCase();
  const objetivoActual: Objetivo = objetivoRaw === 'bajar' ? 'bajar' : objetivoRaw === 'subir' ? 'subir' : 'mantener';
  const grupos: Array<{ key: Objetivo; label: string; colorClass: string }> = [
    { key: 'bajar', label: 'Pérdida de peso', colorClass: 'goal-lose' },
    { key: 'subir', label: 'Aumento de masa muscular', colorClass: 'goal-gain' },
    { key: 'mantener', label: 'Mantener peso', colorClass: 'goal-maintain' },
  ];

  // Modal de receta
  const [openRecipe, setOpenRecipe] = useState<{ title: string; steps: string[] } | null>(null);
  const [openMealGroups, setOpenMealGroups] = useState<Record<string, boolean>>({ Desayuno: true, Almuerzo: false, Cena: false, Snack: false });
  const toggleMeal = (k: string) => setOpenMealGroups(s => ({ ...s, [k]: !s[k] }));
  const [search, setSearch] = useState('');
  const [showGlossary, setShowGlossary] = useState(false);

  const onChangeRange = (n: number) => { setRangeDays(n); localStorage.setItem('kiloByteProgressRange', String(n)); };

  return (
    <div className="progreso-container">
      <h1 className="progreso-title">Mi Progreso</h1>
      
      {/* Preferencias rápidas (solo rango) */}
      <div className="progress-prefs">
        <div className="prefs-range" role="group" aria-label="Rango de días">
          <button className={`chip ${rangeDays===7?'active':''}`} onClick={()=>onChangeRange(7)}>7d</button>
          <button className={`chip ${rangeDays===14?'active':''}`} onClick={()=>onChangeRange(14)}>14d</button>
          <button className={`chip ${rangeDays===30?'active':''}`} onClick={()=>onChangeRange(30)}>30d</button>
        </div>
      </div>

      {/* Resumen impactante */}
      <div className="progress-card collapsible">
        <div className="collapsible-header">
          <h2 className="card-title">Resumen (últimos {rangeDays} días)</h2>
          <button className={`collapse-toggle ${openSection==='resumen'?'open':''}`} onClick={()=> setOpenSection(s=> s==='resumen'? null : 'resumen')} aria-label="Alternar">
            ▾
          </button>
        </div>
        {openSection==='resumen' && (
          <p className="card-help">Promedio de adherencia a tus metas clave. Te muestra qué tan cerca estuviste de tus objetivos de calorías, proteínas e hidratación.</p>
        )}
        {openSection==='resumen' && (
          <div className="kpi-grid-impact">
            <div className="kpi-card-impact">
              <div className="kpi-ring" data-pct={avg.kcal}><div style={{ ['--pct' as string]: `${Math.min(100, avg.kcal)}%` } as React.CSSProperties} /></div>
              <div className="kpi-info"><div className="kpi-label">Adherencia kcal</div><div className="kpi-value">{avg.kcal}%</div></div>
            </div>
            <div className="kpi-card-impact">
              <div className="kpi-ring" data-pct={avg.prot}><div style={{ ['--pct' as string]: `${Math.min(100, avg.prot)}%` } as React.CSSProperties} /></div>
              <div className="kpi-info"><div className="kpi-label">Adherencia proteínas</div><div className="kpi-value">{avg.prot}%</div></div>
            </div>
            <div className="kpi-card-impact">
              <div className="kpi-ring" data-pct={avg.agua}><div style={{ ['--pct' as string]: `${Math.min(100, avg.agua)}%` } as React.CSSProperties} /></div>
              <div className="kpi-info"><div className="kpi-label">Hidratación</div><div className="kpi-value">{avg.agua}%</div></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Panel de KPIs eliminado por pedido */}

      {/* Gráfico de peso (colapsable) */}
      <div className="progress-card collapsible">
        <div className="collapsible-header">
          <h2 className="card-title">Peso Corporal (kg)</h2>
          <button
            className={`collapse-toggle ${openSection === 'peso' ? 'open' : ''}`}
            onClick={() => setOpenSection(prev => (prev === 'peso' ? null : 'peso'))}
            aria-label={openSection === 'peso' ? 'Colapsar' : 'Expandir'}
          >
            ▾
          </button>
        </div>
        {openSection === 'peso' && (
        <>
        <p className="card-help">Tu trayectoria de peso. Si aún no registraste, mostramos un ejemplo. Pronto tomará tus mediciones reales.</p>
        <div className="weight-chart">
          <svg width="100%" height="150" viewBox="0 0 300 150" className="chart-svg">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="30" height="15" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 15" fill="none" stroke="var(--border-color)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="300" height="150" fill="url(#grid)" />
            
            {/* Trend line */}
            <polyline
              points={svgPath}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            
            {/* Data points */}
            {weightData.map((point, index) => {
              const x = 20 + (index / (weightData.length - 1)) * 260;
              const minWeight = Math.min(...weightData.map(d => d.weight)) - 1;
              const maxWeight = Math.max(...weightData.map(d => d.weight)) + 1;
              const y = 20 + ((maxWeight - point.weight) / (maxWeight - minWeight)) * 110;
              
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="3"
                  fill="var(--color-primary)"
                />
              );
            })}
            
            {/* Current point highlight */}
            {weightData.length > 0 && (
              <circle
                cx={20 + ((weightData.length - 1) / (weightData.length - 1)) * 260}
                cy={20 + ((Math.max(...weightData.map(d => d.weight)) + 1 - currentWeight) / 
                    (Math.max(...weightData.map(d => d.weight)) + 1 - Math.min(...weightData.map(d => d.weight)) + 1)) * 110}
                r="5"
                fill="var(--color-secondary)"
                stroke="white"
                strokeWidth="2"
              />
            )}
          </svg>
        </div>
        </>
        )}
        
        {openSection === 'peso' && (
        <div className="weight-summary">
          <div className="weight-stat">
            <span className="stat-label">Peso actual</span>
            <span className="stat-value primary">{currentWeight} kg</span>
          </div>
          <div className="weight-stat">
            <span className="stat-label">Cambio total</span>
            <span className={`stat-value ${weightLoss >= 0 ? 'success' : 'warning'}`}>
              {weightLoss >= 0 ? '-' : '+'}{Math.abs(weightLoss)} kg
            </span>
          </div>
          <div className="weight-stat">
            <span className="stat-label">Semanas</span>
            <span className="stat-value secondary">{weightData.length}</span>
          </div>
        </div>
        )}
      </div>

      {/* Tendencias detalladas (dinámicas por selección) */}
      <div className="progress-card collapsible">
        <div className="collapsible-header">
          <h2 className="card-title">Tendencias (últimos {rangeDays} días)</h2>
          <button
            className={`collapse-toggle ${openSection === 'tendencias' ? 'open' : ''}`}
            onClick={() => setOpenSection(prev => (prev === 'tendencias' ? null : 'tendencias'))}
            aria-label={openSection === 'tendencias' ? 'Colapsar' : 'Expandir'}
          >
            ▾
          </button>
        </div>
        {openSection === 'tendencias' && (
        <>
        <p className="card-help">Barras diarias comparadas con tus metas. Verde = dentro del rango ideal (90–110%). Amarillo = aceptable (70–130%).</p>
        <div className="trends-summary">
          {(['kcal','prot'] as KPIKey[]).map(k => (
            <div key={k} className="trend-stat">
              <span className="trend-label">{k==='kcal'?'Adherencia promedio - Calorías':'Adherencia promedio - Proteínas'}</span>
              <span className={`trend-value ${ (k==='kcal'?avg.kcal:avg.prot) >= 90 ? 'success' : (k==='kcal'?avg.kcal:avg.prot) >= 70 ? 'warning' : 'error'}`}>
                {k==='kcal'?avg.kcal:avg.prot}%
              </span>
            </div>
          ))}
        </div>

        <div className="daily-trends">
          {trends.map((day, index) => (
            <div key={index} className="daily-trend">
              <div className="day-label">{day.date}</div>
              <div className="trend-bars">
                {(['kcal','prot'] as KPIKey[]).map(k => {
                    const label = ({kcal:'Calorías',prot:'Proteínas',carbs:'Carbs',grasa:'Grasa',agua:'Agua',sueno:'Sueño',ayuno:'Ayuno'})[k];
                    const pct = day.pct[k];
                    const cls = pct >= 90 && pct <= 110 ? 'success' : pct >= 70 && pct <= 130 ? 'warning' : 'error';
                    return (
                      <div key={k} className="trend-bar-container">
                        <label>{label}</label>
                        <div className="trend-bar">
                          <div className={`trend-bar-fill ${cls}`} style={{ width: `${Math.min(100, pct)}%` }} />
                        </div>
                        <span className="trend-bar-value">{pct}%</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
        </>
        )}
      </div>

      {/* Recetas recomendadas según plan */}
      <div className="progress-card collapsible">
        <div className="collapsible-header">
          <h2 className="card-title">Recetas recomendadas</h2>
          <button
            className={`collapse-toggle ${openSection === 'recetas' ? 'open' : ''}`}
            onClick={() => setOpenSection(prev => (prev === 'recetas' ? null : 'recetas'))}
            aria-label={openSection === 'recetas' ? 'Colapsar' : 'Expandir'}
          >
            ▾
          </button>
        </div>
        {openSection === 'recetas' && (
        <div className="recipes">
          <p className="card-help">Todas las recetas están visibles. Tu plan actual se resalta como recomendado.</p>
          <div className="recipes-toolbar">
            <input className="recipes-search" placeholder="Buscar receta..." value={search} onChange={(e)=> setSearch(e.target.value)} />
          </div>
          {grupos.map((g) => {
            return (
              <div key={g.key} className={`recipe-group ${g.colorClass} enabled ${g.key===objetivoActual ? 'selected' : ''}`}>
                <div className="recipe-group-header">
                  <h3>{g.label}</h3>
                  {g.key===objetivoActual && <span className="plan-badge" title="Plan recomendado">Tu plan</span>}
                </div>
                {(['Desayuno','Almuerzo','Cena','Snack'] as const).map(meal => {
                  const items = recetas[g.key].filter(r => r.group === meal && (!search || r.title.toLowerCase().includes(search.toLowerCase())));
                  if (!items.length) return null;
                  const open = openMealGroups[meal];
                  return (
                    <div key={meal} className="recipe-sub-accordion">
                      <button className={`sub-acc-header ${open?'open':''}`} onClick={()=> toggleMeal(meal)}>
                        <span>{meal}</span>
                        <span className="chev">▾</span>
                      </button>
                      {open && (
                        <div className="recipe-grid">
                          {items.map((r, idx) => (
                            <div
                              key={idx}
                              className={`recipe-card`}
                              title={r.title}
                              onClick={() => {
                                const steps = getRecipeSteps(r.title);
                                if (steps && steps.length) setOpenRecipe({ title: r.title, steps });
                              }}
                              aria-disabled={false}
                              role="button"
                            >
                              <div className="recipe-title">{r.title}</div>
                              <div className="recipe-meta">{r.group}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        )}

        {openSection === 'recetas' && openRecipe && (
          <div className="recipe-modal-overlay" onClick={() => setOpenRecipe(null)}>
            <div className="recipe-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
              <div className="recipe-modal-header">
                <h3>{openRecipe.title}</h3>
                <button className="close-btn" onClick={() => setOpenRecipe(null)} aria-label="Cerrar">×</button>
              </div>
              <div className="recipe-modal-body">
                <ol className="recipe-steps">
                  {openRecipe.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Consejos e información (glosario se abre en modal) */}
      <div className="progress-card collapsible">
        <div className="collapsible-header">
          <h2 className="card-title">Consejos e info</h2>
          <button
            className={`collapse-toggle ${openSection === 'tips' ? 'open' : ''}`}
            onClick={() => setOpenSection(prev => (prev === 'tips' ? null : 'tips'))}
            aria-label={openSection === 'tips' ? 'Colapsar' : 'Expandir'}
          >
            ▾
          </button>
        </div>
        {openSection === 'tips' && (
          <div className="tips-content">
            <p className="card-help">Ideas prácticas y conceptos clave para mejorar adherencia, saciedad y salud digestiva. Leelos de a poco y elegí 1–2 para aplicar esta semana.</p>
            <div className="tips-grid">
              {[
                {t:'Calorías vacías',d:'Alimentos con alta energía y pocos nutrientes (gaseosas, harinas refinadas, dulces). Limitarlas mejora saciedad y control del apetito.'},
                {t:'Adherencia > perfección',d:'Seguir el plan 80–90% del tiempo gana a buscar perfección. Un desliz no borra tu progreso.'},
                {t:'Proteína en cada comida',d:'Aumenta la saciedad y protege masa muscular (huevos, yogur, legumbres, carnes magras).'},
                {t:'Fibra soluble',d:'Aporta saciedad y nutre la microbiota (avena, chía, lino, legumbres).'},
                {t:'Hidratación inteligente',d:'Tomar agua antes y entre comidas puede reducir el hambre por confundir sed con apetito.'},
                {t:'Harinas y antojos',d:'Las harinas refinadas pueden disparar apetito por picos de insulina. Elegí integrales o reducí frecuencia.'},
                {t:'Índice glucémico',d:'Preferí carbohidratos de IG bajo/medio para evitar picos bruscos (batata, legumbres, quinoa, fruta entera).'},
                {t:'Grasas de calidad',d:'Ayudan a la saciedad y salud hormonal: palta, frutos secos, oliva, pescado azul.'},
                {t:'Plan anti-atracón',d:'Dormí bien, comé proteína, fibra y grasas buenas. Tené snacks reales a mano (yogur, frutas, frutos secos).'},
                {t:'Ritmo de comidas',d:'Comer lento mejora señales de saciedad; 10–20 minutos por comida es un buen objetivo.'},
                {t:'Ayuno intermitente',d:'Puede ayudarte a ordenar horarios. Beneficios: mejor sensibilidad a la insulina y control del hambre en algunos casos.'},
                {t:'Picos de insulina',d:'Grandes picos de azúcar generan bajones de energía y más hambre. Combiná carbos con proteína y fibra.'},
                {t:'Pro-microbiota',d:'Vegetales, frutas, legumbres, fermentados (kéfir, yogur, chucrut) y cereales integrales.'},
                {t:'Perjudican microbiota',d:'Exceso de ultraprocesados, alcohol frecuente, harinas y azúcares en exceso.'},
                {t:'Saciedad práctica',d:'Comenzá con ensalada o sopa de verduras. Sumá 20–30g de proteína por comida.'},
                {t:'Porciones visuales',d:'Usá plato pequeño, servite en cocina, evitá “picar de la fuente”.'},
                {t:'Entorno',d:'Dejá a la vista opciones saludables. Lo que está a mano, se come.'},
                {t:'Dormir mejor',d:'Menos sueño = más hambre. Objetivo: 7–9 horas; rutina constante y menos pantallas.'},
                {t:'Movimiento diario',d:'Caminatas después de comer ayudan a la glucosa y a la digestión.'},
                {t:'Micrometas',d:'Elegí 1 cambio a la vez (agua +500 ml, 1 fruta/día, 10 min de caminata). Sostenibilidad gana a la velocidad.'}
              ].map((tip, i) => (
                <div key={i} className="tip-card">
                  <div className="tip-icon">💡</div>
                  <div className="tip-body">
                    <div className="tip-title">{tip.t}</div>
                    <div className="tip-text">{tip.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12 }}>
              <button className="btn btn-secondary" onClick={()=> setShowGlossary(true)}>📚 Abrir glosario</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de glosario */}
      {showGlossary && (
        <div className="recipe-modal-overlay" onClick={()=> setShowGlossary(false)}>
          <div className="recipe-modal" onClick={(e)=> e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Glosario de términos">
            <div className="recipe-modal-header">
              <h3>Glosario</h3>
              <button className="close-btn" onClick={()=> setShowGlossary(false)} aria-label="Cerrar">×</button>
            </div>
            <div className="recipe-modal-body">
              <div className="glossary-grid">
                {[
                  {t:'Microbiota',d:'Conjunto de microbios del intestino que impacta digestión, inmunidad y saciedad.'},
                  {t:'Calorías vacías',d:'Energía con pocos nutrientes (azúcar, harinas refinadas). Mejor limitar.'},
                  {t:'Adherencia',d:'Sostener el plan en el tiempo; más importante que la perfección diaria.'},
                  {t:'Índice glucémico (IG)',d:'Qué tan rápido sube la glucosa un alimento. Bajo/medio evita picos.'},
                  {t:'Carga glucémica (CG)',d:'IG + porción. Ayuda a evaluar el impacto real en glucosa.'},
                  {t:'Proteína completa',d:'Aporta todos los aminoácidos esenciales (huevo, lácteos, soja, quinoa).'},
                  {t:'Fibra soluble',d:'Se disuelve en agua, retrasa vaciamiento gástrico y alimenta microbiota.'},
                  {t:'Fibra insoluble',d:'Aumenta el volumen fecal y acelera tránsito (salvado, verduras).'},
                  {t:'Prebióticos',d:'Fibras que nutren bacterias buenas (inulina, FOS, avena, banana verde).'},
                  {t:'Probióticos',d:'Microorganismos vivos beneficiosos (yogur, kéfir, chucrut).'},
                  {t:'Sarcopenia',d:'Pérdida de masa y fuerza muscular; prevención: proteína y entrenamiento.'},
                  {t:'NEAT',d:'Gasto no asociado a ejercicio (moverse, caminar, gesticular). Suma mucho.'},
                  {t:'Termogénesis',d:'Energía usada en digerir y metabolizar alimentos.'},
                  {t:'Balance energético',d:'Relación entre calorías que entran y salen.'},
                  {t:'Déficit calórico',d:'Consumir menos de lo que gastás para perder peso.'},
                  {t:'Superávit calórico',d:'Consumir más de lo que gastás para ganar masa.'},
                  {t:'Densidad nutricional',d:'Nutrientes por caloría. Priorizá alimentos densos en nutrientes.'},
                  {t:'Saciedad',d:'Sensación de estar satisfecho y sin hambre.'},
                  {t:'Saciación',d:'Proceso de llenarte durante una comida.'},
                  {t:'Ultraprocesados',d:'Productos industriales con aditivos; suelen desplazar comida real.'},
                  {t:'Aceites saludables',d:'Oliva, palta, frutos secos; mejoran perfil lipídico y saciedad.'},
                  {t:'Omega-3',d:'Ácidos grasos antiinflamatorios (pescado azul, chía, lino).'},
                  {t:'Resistencia a la insulina',d:'Células responden menos; puede mejorar con peso, fibra y actividad.'},
                  {t:'Índice de saciedad',d:'Comparación de qué tan saciante es un alimento por caloría.'},
                  {t:'Crononutrición',d:'Sincronizar comidas con ritmos circadianos.'},
                  {t:'Ayuno intermitente',d:'Ventana sin calorías. Útil si ayuda a adherencia y orden.'},
                  {t:'Hígado graso',d:'Acumulación de grasa en el hígado; mejora con dieta y movimiento.'},
                  {t:'HbA1c',d:'Hemoglobina glicosilada; indicador de glucosa promedio 3 meses.'},
                  {t:'Sodio/Potasio',d:'Electrolitos clave para presión y función muscular.'},
                  {t:'Índice andrónico',d:'Relación cintura/altura; útil para riesgo cardiometabólico.'},
                  {t:'TMB (BMR)',d:'Tasa metabólica basal; energía mínima para funciones vitales.'},
                  {t:'TEF',d:'Efecto térmico de los alimentos; gasto al digerir.'},
                  {t:'IG bajo',d:'Alimentos que suben la glucosa lentamente (legumbres, avena, batata).'},
                  {t:'Azúcares añadidos',d:'Azúcar incorporada en productos; conviene reducir.'},
                  {t:'Harinas refinadas',d:'Procesadas; suben glucosa rápido y sacian menos.'},
                  {t:'Granola casera',d:'Versión sin azúcar añadida; mejor control de ingredientes.'},
                  {t:'Porción',d:'Cantidad estandarizada para medir y comparar.'},
                  {t:'Mindful eating',d:'Comer con atención plena; ayuda a la saciedad y disfrute.'},
                  {t:'Volumetría',d:'Comer más volumen con pocas calorías (verduras, sopas).'},
                  {t:'Densidad calórica',d:'Calorías por gramo; baja densidad ayuda a perder peso.'},
                  {t:'HIIT',d:'Entrenamiento interválico de alta intensidad; eficiente en poco tiempo.'},
                  {t:'Refeed',d:'Día con más calorías/carbohidratos para sostener adherencia.'},
                  {t:'Plateau',d:'Meseta de progreso; romper con ajustes de calorías, actividad o sueño.'},
                ].map((g,i)=> (
                  <div key={i} className="glossary-item">
                    <div className="g-term">{g.t}</div>
                    <div className="g-desc">{g.d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Progreso;