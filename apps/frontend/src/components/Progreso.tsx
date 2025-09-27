import React, { useState } from 'react';
import './Progreso.css';
import { getRecipeSteps } from '../data/recetasPasoAPaso';

// Tipos mínimos usados en este componente (evita any)
interface Totals { kcal?: number; prot?: number }
interface DayLog { totals?: Totals; agua_ml?: number; sueno_h?: number }
type Objetivo = 'bajar' | 'mantener' | 'subir';
interface AppStateMin {
  perfil?: { peso?: number; objetivo?: string; desbloquearRecetas?: boolean };
  metas?: { kcal?: number; prote_g_dia?: number; agua_ml?: number };
  log?: Record<string, DayLog | undefined>;
}

interface ProgresoProps {
  appState: AppStateMin;
}

const Progreso: React.FC<ProgresoProps> = ({ appState }) => {
  const [openSection, setOpenSection] = useState<'peso' | 'tendencias' | 'recetas' | null>('peso');

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
          {grupos.map((g) => {
            const enabled = desbloquear || g.key === objetivoActual;
            return (
              <div key={g.key} className={`recipe-group ${g.colorClass} ${enabled ? 'enabled' : 'disabled'}`}>
                <div className="recipe-group-header">
                  <h3>{g.label}</h3>
                  {!enabled && <span className="badge-disabled">Bloqueado por plan</span>}
                </div>
                <div className="recipe-grid">
                  {recetas[g.key].map((r, idx) => (
                    <div
                      key={idx}
                      className={`recipe-card ${enabled ? '' : 'disabled'}`}
                      title={enabled ? r.title : 'No disponible: esta receta no es parte de tu plan actual'}
                      onClick={(e) => {
                        if (!enabled) {
                          // No-op, bloqueado: solo tooltip nativo del title
                          e.preventDefault();
                          return;
                        }
                        const steps = getRecipeSteps(r.title);
                        if (steps && steps.length) {
                          setOpenRecipe({ title: r.title, steps });
                        }
                      }}
                      aria-disabled={!enabled}
                      role="button"
                    >
                      <div className="recipe-title">{r.title}</div>
                      <div className="recipe-meta">{r.group}</div>
                    </div>
                  ))}
                </div>
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