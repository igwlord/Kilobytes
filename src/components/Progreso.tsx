import React from 'react';
import './Progreso.css';

interface ProgresoProps {
  appState: any;
}

const Progreso: React.FC<ProgresoProps> = ({ appState }) => {
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

  const generateSVGPath = (data: any[]) => {
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

  return (
    <div className="progreso-container">
      <h1 className="progreso-title">Mi Progreso</h1>
      
      {/* Gráfico de peso */}
      <div className="progress-card">
        <h2 className="card-title">Peso Corporal (kg)</h2>
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
      </div>

      {/* Tendencias nutricionales */}
      <div className="progress-card">
        <h2 className="card-title">Tendencias Nutricionales (7 días)</h2>
        
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
      </div>

      {/* Consejos y motivación */}
      <div className="progress-card">
        <h2 className="card-title">Análisis y Consejos</h2>
        <div className="insights">
          {weightLoss >= 0 ? (
            <div className="insight success">
              <div className="insight-icon">🎉</div>
              <div className="insight-content">
                <h3>¡Excelente progreso!</h3>
                <p>Has perdido {weightLoss} kg. Mantén el buen trabajo siguiendo tu plan nutricional.</p>
              </div>
            </div>
          ) : (
            <div className="insight warning">
              <div className="insight-icon">⚡</div>
              <div className="insight-content">
                <h3>Ajusta tu estrategia</h3>
                <p>Tu peso ha aumentado. Revisa tu plan nutricional y asegúrate de mantener un déficit calórico.</p>
              </div>
            </div>
          )}

          {avgKcalAdherence >= 85 ? (
            <div className="insight success">
              <div className="insight-icon">🎯</div>
              <div className="insight-content">
                <h3>Adherencia excelente</h3>
                <p>Tu adherencia calórica del {avgKcalAdherence}% es muy buena. ¡Sigue así!</p>
              </div>
            </div>
          ) : (
            <div className="insight warning">
              <div className="insight-icon">📊</div>
              <div className="insight-content">
                <h3>Mejora la consistencia</h3>
                <p>Tu adherencia del {avgKcalAdherence}% puede mejorar. Trata de ser más consistente con tu plan.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Progreso;