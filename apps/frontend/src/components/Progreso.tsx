import React, { useState } from 'react';
import './Progreso.css';

// Tipos mínimos usados en este componente (evita any)
interface Totals { kcal?: number; prot?: number }
interface DayLog { totals?: Totals; agua_ml?: number; sueno_h?: number }
interface AppStateMin {
  perfil?: { peso?: number };
  metas?: { kcal?: number; prote_g_dia?: number; agua_ml?: number };
  log?: Record<string, DayLog | undefined>;
}

interface ProgresoProps {
  appState: AppStateMin;
}

const Progreso: React.FC<ProgresoProps> = ({ appState }) => {
  const [openSection, setOpenSection] = useState<'peso' | 'tendencias' | 'analisis' | null>('peso');

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

  const getNutritionTrends = () => {
    // Simulamos tendencias nutricionales de los últimos 7 días
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      const log = appState.log?.[dateKey];
      const kcal = log?.totals?.kcal || 0;
      const prot = log?.totals?.prot || 0;
      const targetKcal = appState.metas?.kcal || 2000;
      const targetProt = appState.metas?.prote_g_dia || 140;
      
      last7Days.push({
        date: date.toLocaleDateString('es-AR', { weekday: 'short' }),
        kcal,
        prot,
        kcalPercent: targetKcal > 0 ? Math.round((kcal / targetKcal) * 100) : 0,
        protPercent: targetProt > 0 ? Math.round((prot / targetProt) * 100) : 0
      });
    }
    
    return last7Days;
  };

  const trends = getNutritionTrends();
  const avgKcalAdherence = Math.round(trends.reduce((sum, day) => sum + day.kcalPercent, 0) / 7);
  const avgProtAdherence = Math.round(trends.reduce((sum, day) => sum + day.protPercent, 0) / 7);

  // Fase 6: Análisis y Consejos inteligentes
  type InsightKey = 'macros' | 'adherencia' | 'ritmo' | 'sueno' | 'hidratacion';
  interface InsightCard { key: InsightKey; title: string; summary: string; advice: string; impact: number }
  const todayKey = new Date().toISOString().split('T')[0];
  const todayLog = appState.log?.[todayKey];
  const kcalTarget = appState.metas?.kcal || 2000;
  const protTarget = appState.metas?.prote_g_dia || 140;
  const todayKcal = todayLog?.totals?.kcal || 0;
  const todayProt = todayLog?.totals?.prot || 0;
  const aguaTarget = appState.metas?.agua_ml ?? 2000;
  const aguaHoy = todayLog?.agua_ml ?? 0;
  const suenoHoy = appState.log?.[todayKey]?.sueno_h ?? 0;

  // Impactos aproximados (0 a 100) basados en gap relativo a objetivos
  const kcalGap = Math.min(100, Math.abs(((todayKcal - kcalTarget) / Math.max(1, kcalTarget)) * 100));
  const protGap = Math.min(100, Math.max(0, ((protTarget - todayProt) / Math.max(1, protTarget)) * 100));
  const aguaGap = Math.min(100, Math.max(0, ((aguaTarget - aguaHoy) / Math.max(1, aguaTarget)) * 100));
  const suenoGap = suenoHoy >= 7 && suenoHoy <= 9 ? 0 : Math.min(100, Math.abs(((suenoHoy - 8) / 8) * 100));
  const adherenciaAvgGap = 100 - Math.min(100, Math.round(trends.reduce((s, d) => s + d.kcalPercent, 0) / 7));

  const insightCandidates: InsightCard[] = [
    {
      key: 'macros',
      title: 'Macros del día',
      summary: `Kcal ${Math.round(todayKcal)}/${kcalTarget} • Prot ${Math.round(todayProt)}/${protTarget}g`,
      advice:
        todayProt < protTarget
          ? 'Subí proteínas en la próxima comida (p. ej., 150-200g de pechuga, 2-3 huevos, o 200g de yogur griego) manteniendo calorías controladas.'
          : todayKcal > kcalTarget
          ? 'Estás por encima de calorías. Compensá con una cena liviana rica en proteínas y vegetales fibrosos.'
          : 'Buen balance hoy. Mantené la distribución proteica en cada comida (20–40g).',
      impact: Math.max(kcalGap, protGap)
    },
    {
      key: 'adherencia',
      title: 'Adherencia 7 días',
      summary: `Media kcal: ${trends.map(t => t.kcalPercent).join('% ')}%`,
      advice:
        adherenciaAvgGap > 20
          ? 'Elegí 1-2 ajustes simples: horarios fijos, porciones medidas y snacks de alto volumen (verduras/agua).'
          : 'Tu adherencia es buena. Seguí trackeando y preparando comidas con antelación.',
      impact: adherenciaAvgGap
    },
    {
      key: 'ritmo',
      title: 'Ritmo de cambio de peso',
      summary: `Cambio total ${weightLoss >= 0 ? '-' : '+'}${Math.abs(weightLoss)} kg / ${weightData.length} sem.`,
      advice:
        weightLoss > 0.8
          ? 'La caída es rápida. Aumentá 150–250 kcal o subí carbohidratos en días de entrenamiento para proteger masa magra.'
          : weightLoss < 0.2
          ? 'El ritmo es bajo. Reducí 100–200 kcal o aumentá el NEAT (pasos) para empujar el progreso.'
          : 'Ritmo saludable. Mantené el plan y descansos adecuados.',
      impact: Math.min(100, Math.abs(weightLoss - 0.5) * 50)
    },
    {
      key: 'sueno',
      title: 'Consistencia de sueño',
      summary: `${suenoHoy}h hoy (objetivo 7–9h)`,
      advice:
        suenoHoy < 7
          ? 'Intentá adelantar tu horario de sueño 30–45 min. Apagá pantallas 60 min antes y ajustá cafeína post-mediodía.'
          : suenoHoy > 9
          ? 'Si dormís >9h frecuentemente, revisá calidad/horarios y evaluá estrés/actividad física.'
          : 'Excelente rango. Mantené rutina estable y luz natural por la mañana.',
      impact: suenoGap
    },
    {
      key: 'hidratacion',
      title: 'Hidratación',
      summary: `${Math.round(aguaHoy/100)/10}L / ${(aguaTarget/1000).toFixed(1)}L`,
      advice:
        aguaHoy < aguaTarget
          ? 'Sumá 1 vaso de agua (250ml) con cada comida y tené una botella visible durante el día.'
          : 'Buen nivel. Repartí la ingesta y añadí electrolitos si entrenás con calor.',
      impact: aguaGap
    }
  ];

  const insightsSorted = insightCandidates
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 5);

  const [openAdvice, setOpenAdvice] = useState<InsightKey | null>(insightsSorted[0]?.key ?? null);

  return (
    <div className="progreso-container">
      <h1 className="progreso-title">Mi Progreso</h1>
      
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

      {/* Tendencias nutricionales (colapsable) */}
      <div className="progress-card collapsible">
        <div className="collapsible-header">
          <h2 className="card-title">Tendencias Nutricionales (7 días)</h2>
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
          <div className="trend-stat">
            <span className="trend-label">Adherencia promedio - Calorías</span>
            <span className={`trend-value ${avgKcalAdherence >= 90 ? 'success' : avgKcalAdherence >= 70 ? 'warning' : 'error'}`}>
              {avgKcalAdherence}%
            </span>
          </div>
          <div className="trend-stat">
            <span className="trend-label">Adherencia promedio - Proteínas</span>
            <span className={`trend-value ${avgProtAdherence >= 90 ? 'success' : avgProtAdherence >= 70 ? 'warning' : 'error'}`}>
              {avgProtAdherence}%
            </span>
          </div>
        </div>

        <div className="daily-trends">
          {trends.map((day, index) => (
            <div key={index} className="daily-trend">
              <div className="day-label">{day.date}</div>
              <div className="trend-bars">
                <div className="trend-bar-container">
                  <label>Calorías</label>
                  <div className="trend-bar">
                    <div 
                      className={`trend-bar-fill ${day.kcalPercent >= 90 && day.kcalPercent <= 110 ? 'success' : 
                        day.kcalPercent >= 70 && day.kcalPercent <= 130 ? 'warning' : 'error'}`}
                      style={{ width: `${Math.min(day.kcalPercent, 100)}%` }}
                    ></div>
                  </div>
                  <span className="trend-bar-value">{day.kcalPercent}%</span>
                </div>
                <div className="trend-bar-container">
                  <label>Proteínas</label>
                  <div className="trend-bar">
                    <div 
                      className={`trend-bar-fill ${day.protPercent >= 80 ? 'success' : 
                        day.protPercent >= 60 ? 'warning' : 'error'}`}
                      style={{ width: `${Math.min(day.protPercent, 100)}%` }}
                    ></div>
                  </div>
                  <span className="trend-bar-value">{day.protPercent}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        </>
        )}
      </div>

      {/* Fase 6 — Cards inteligentes ordenadas por impacto */}
      <div className="progress-card collapsible">
        <div className="collapsible-header">
          <h2 className="card-title">Análisis y Consejos (inteligentes)</h2>
        </div>
        <div className="insights">
          {insightsSorted.map((ins) => (
            <div key={ins.key} className="insight">
              <div className="insight-icon">💡</div>
              <div className="insight-content" style={{ width: '100%' }}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:8}}>
                  <h3 style={{margin:0}}>{ins.title}</h3>
                  <button
                    className={`collapse-toggle ${openAdvice === ins.key ? 'open' : ''}`}
                    onClick={() => setOpenAdvice(prev => prev === ins.key ? null : ins.key)}
                    aria-label={openAdvice === ins.key ? 'Colapsar' : 'Expandir'}
                  >▾</button>
                </div>
                <p style={{margin:'4px 0', color:'var(--text-secondary)'}}>{ins.summary}</p>
                {openAdvice === ins.key && (
                  <p style={{margin:'6px 0 0 0'}}>{ins.advice}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Progreso;