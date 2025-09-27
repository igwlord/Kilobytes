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

type Section = 'resumen' | 'kpis' | 'peso' | 'tendencias' | 'recetas' | null;
type KPIKey = 'kcal' | 'prot' | 'carbs' | 'grasa' | 'agua' | 'sueno' | 'ayuno';

const Progreso: React.FC<ProgresoProps> = ({ appState }) => {
  const [openSection, setOpenSection] = useState<Section>('resumen');
  const [rangeDays, setRangeDays] = useState<number>(() => {
    const saved = Number(localStorage.getItem('kiloByteProgressRange') || '7');
    return [7, 14, 30].includes(saved) ? saved : 7;
  });
  const [visibleKPIs, setVisibleKPIs] = useState<Set<KPIKey>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('kiloByteProgressKPIs') || '[]');
      const def: KPIKey[] = ['kcal','prot','agua','sueno','ayuno'];
      const arr: KPIKey[] = Array.isArray(saved) && saved.length ? saved : def;
      return new Set(arr);
    } catch { return new Set(['kcal','prot','agua','sueno','ayuno']); }
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
  const desbloquear = !!appState.perfil?.desbloquearRecetas;
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

  // Persist preferences
  const onToggleKPI = (k: KPIKey) => {
    setVisibleKPIs(prev => {
      const n = new Set(prev);
      if (n.has(k)) n.delete(k); else n.add(k);
      localStorage.setItem('kiloByteProgressKPIs', JSON.stringify(Array.from(n)));
      return n;
    });
  };
  const onChangeRange = (n: number) => { setRangeDays(n); localStorage.setItem('kiloByteProgressRange', String(n)); };

  return (
    <div className="progreso-container">
      <h1 className="progreso-title">Mi Progreso</h1>
      
      {/* Preferencias rápidas */}
      <div className="progress-prefs">
        <div className="prefs-range" role="group" aria-label="Rango de días">
          <button className={`chip ${rangeDays===7?'active':''}`} onClick={()=>onChangeRange(7)}>7d</button>
          <button className={`chip ${rangeDays===14?'active':''}`} onClick={()=>onChangeRange(14)}>14d</button>
          <button className={`chip ${rangeDays===30?'active':''}`} onClick={()=>onChangeRange(30)}>30d</button>
        </div>
        <div className="prefs-kpis" aria-label="KPIs visibles">
          {(['kcal','prot','carbs','grasa','agua','sueno','ayuno'] as KPIKey[]).map(k => (
            <label key={k} className={`kpi-toggle ${visibleKPIs.has(k)?'on':''}`}>
              <input type="checkbox" checked={visibleKPIs.has(k)} onChange={()=>onToggleKPI(k)} />
              <span>{({kcal:'Kcal',prot:'Prote',carbs:'Carbs',grasa:'Grasa',agua:'Agua',sueno:'Sueño',ayuno:'Ayuno'})[k]}</span>
            </label>
          ))}
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
      
      {/* Panel de KPIs seleccionados */}
      <div className="progress-card collapsible">
        <div className="collapsible-header">
          <h2 className="card-title">Panel de KPIs</h2>
          <button className={`collapse-toggle ${openSection==='kpis'?'open':''}`} onClick={()=> setOpenSection(s=> s==='kpis'? null : 'kpis')} aria-label="Alternar">▾</button>
        </div>
        {openSection==='kpis' && (
          <div className="kpi-board">
            {Array.from(visibleKPIs).map(k => {
              const keyMap: Record<KPIKey, { label: string; colorVar: string; values: number[]; pcts: number[] }>= {
                kcal: { label: 'Calorías', colorVar: 'var(--color-primary)', values: trends.map(d=>d.kcal), pcts: trends.map(d=>d.pct.kcal) },
                prot: { label: 'Proteínas', colorVar: 'var(--color-secondary)', values: trends.map(d=>d.prot), pcts: trends.map(d=>d.pct.prot) },
                carbs:{ label: 'Carbs', colorVar: '#45B7D1', values: trends.map(d=>d.carbs), pcts: trends.map(d=>d.pct.carbs) },
                grasa:{ label: 'Grasa', colorVar: '#96CEB4', values: trends.map(d=>d.grasa), pcts: trends.map(d=>d.pct.grasa) },
                agua: { label: 'Agua (ml)', colorVar: 'var(--color-primary)', values: trends.map(d=>d.agua), pcts: trends.map(d=>d.pct.agua) },
                sueno:{ label: 'Sueño (h)', colorVar: '#7C3AED', values: trends.map(d=>d.sueno), pcts: trends.map(d=>d.pct.sueno) },
                ayuno:{ label: 'Ayuno (h)', colorVar: '#F43F5E', values: trends.map(d=>d.ayuno), pcts: trends.map(d=>d.pct.ayuno) },
              };
              const cfg = keyMap[k];
              const avgPct = Math.round(cfg.pcts.reduce((a,b)=>a+b,0) / Math.max(1,cfg.pcts.length));
              const maxVal = Math.max(1, ...cfg.values);
              const points = cfg.values.map((v,i)=>{
                const x = (i/(cfg.values.length-1||1))*100;
                const y = 100 - (v/maxVal)*100;
                return `${x},${y}`;
              }).join(' ');
              return (
                <div key={k} className="kpi-mini">
                  <div className="mini-head">
                    <span className="mini-label">{cfg.label}</span>
                    <span className={`mini-pct ${avgPct>=90?'ok':avgPct>=70?'warn':'bad'}`}>{avgPct}%</span>
                  </div>
                  <svg className="sparkline" viewBox="0 0 100 28" preserveAspectRatio="none">
                    <polyline fill="none" stroke={cfg.colorVar} strokeWidth="2" points={points} />
                  </svg>
                  <div className="mini-days">
                    {trends.map((d,i)=> <span key={i} className="day-dot" title={`${d.date}: ${cfg.values[i]}`}></span>)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
        <div className="trends-summary">
          {(['kcal','prot'] as KPIKey[]).filter(k=>visibleKPIs.has(k)).map(k => (
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
                {(['kcal','prot','carbs','grasa','agua','sueno','ayuno'] as KPIKey[])
                  .filter(k => visibleKPIs.has(k))
                  .map(k => {
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
          <div className="recipes-toolbar">
            <input className="recipes-search" placeholder="Buscar receta..." value={search} onChange={(e)=> setSearch(e.target.value)} />
          </div>
          {grupos.map((g) => {
            const enabled = desbloquear || g.key === objetivoActual;
            return (
              <div key={g.key} className={`recipe-group ${g.colorClass} ${enabled ? 'enabled' : 'disabled'}`}>
                <div className="recipe-group-header">
                  <h3>{g.label}</h3>
                  {!enabled && <span className="badge-disabled">Bloqueado por plan</span>}
                </div>
                {(['Desayuno','Almuerzo','Cena','Snack'] as const).map(meal => {
                  const items = recetas[g.key].filter(r => r.group === meal && (!search || r.title.toLowerCase().includes(search.toLowerCase())));
                  if (!items.length) return null;
                  const open = openMealGroups[meal];
                  return (
                    <div key={meal} className="recipe-sub-accordion">
                      <button className={`sub-acc-header ${open?'open':''}`} onClick={()=> toggleMeal(meal)}>
                        <span>{meal}</span>
                        <span className="count">{items.length}</span>
                        <span className="chev">▾</span>
                      </button>
                      {open && (
                        <div className="recipe-grid">
                          {items.map((r, idx) => (
                            <div
                              key={idx}
                              className={`recipe-card ${enabled ? '' : 'disabled'}`}
                              title={enabled ? r.title : 'No disponible: esta receta no es parte de tu plan actual'}
                              onClick={(e) => {
                                if (!enabled) { e.preventDefault(); return; }
                                const steps = getRecipeSteps(r.title);
                                if (steps && steps.length) setOpenRecipe({ title: r.title, steps });
                              }}
                              aria-disabled={!enabled}
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
    </div>
  );
};

export default Progreso;