import React, { useState } from 'react';
import './Calendario.css';

// Minimal, permissive app state types used by this component (read-only rendering)
type Totals = { kcal: number; prot?: number; carbs?: number; grasa?: number };
type DayLogMin = { totals?: Totals };
type AppStateLite = {
  metas?: { kcal?: number };
  log?: Record<string, DayLogMin>;
};

interface CalendarioProps {
  appState: AppStateLite;
  updateAppState?: (newState: unknown) => void; // not used here, kept optional for prop compatibility
}

const Calendario: React.FC<CalendarioProps> = ({ appState }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const dayNames = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getAdherenceColor = (dateKey: string) => {
    const log = appState.log?.[dateKey];
    if (!log || !log.totals || log.totals.kcal === 0) return '';

    const adherence = (log.totals.kcal / (appState.metas?.kcal || 2000)) * 100;
    
    if (adherence >= 90 && adherence <= 110) {
      return 'good-adherence'; // Verde - adherencia excelente
    } else if (adherence >= 70 && adherence < 120) {
      return 'moderate-adherence'; // Amarillo - adherencia moderada
    } else {
      return 'poor-adherence'; // Rojo - adherencia pobre
    }
  };

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    
    // Espacios vacíos para los días del mes anterior
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const adherenceClass = getAdherenceColor(dateKey);
      const isToday = dateKey === new Date().toISOString().split('T')[0];
      
      days.push(
        <div 
          key={day} 
          className={`calendar-day ${adherenceClass} ${isToday ? 'today' : ''}`}
          title={`${day} - ${getAdherenceTooltip(dateKey)}`}
        >
          {day}
        </div>
      );
    }
    
    return days;
  };

  const getAdherenceTooltip = (dateKey: string) => {
    const log = appState.log?.[dateKey];
    if (!log || !log.totals || log.totals.kcal === 0) return 'Sin registro';

    const targetKcal = appState.metas?.kcal || 2000;
    const adherence = (log.totals.kcal / targetKcal) * 100;
    
    return `${Math.round(log.totals.kcal)} kcal (${Math.round(adherence)}% del objetivo)`;
  };

  const getAdherenceStats = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let goodDays = 0;
    let moderateDays = 0;
    let poorDays = 0;
    let noDays = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const adherenceClass = getAdherenceColor(dateKey);
      
      switch (adherenceClass) {
        case 'good-adherence':
          goodDays++;
          break;
        case 'moderate-adherence':
          moderateDays++;
          break;
        case 'poor-adherence':
          poorDays++;
          break;
        default:
          noDays++;
          break;
      }
    }
    
    return { goodDays, moderateDays, poorDays, noDays, total: daysInMonth };
  };

  const stats = getAdherenceStats();

  return (
    <div className="calendario-container">
      <h1 className="calendario-title">Calendario de Adherencia</h1>
      <div className="calendario-card">
        <div className="calendario-header">
          <button onClick={prevMonth} className="nav-btn">
            ‹
          </button>
          <h2 className="month-year">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button onClick={nextMonth} className="nav-btn">
            ›
          </button>
        </div>
        
        <div className="calendar-weekdays">
          {dayNames.map(day => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
        </div>
        
        <div className="calendar-grid">
          {renderCalendarDays()}
        </div>

        <div className="calendar-legend">
          <h3 className="legend-title">Leyenda</h3>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-color good-adherence"></div>
              <span>Excelente (90-110%)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color moderate-adherence"></div>
              <span>Moderado (70-120%)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color poor-adherence"></div>
              <span>Necesita mejora</span>
            </div>
            <div className="legend-item">
              <div className="legend-color no-data"></div>
              <span>Sin registro</span>
            </div>
          </div>
        </div>

        <div className="calendar-stats">
          <h3 className="stats-title">Resumen del mes</h3>
          <div className="stats-grid">
            <div className="stat-item good">
              <span className="stat-number">{stats.goodDays}</span>
              <span className="stat-label">Días excelentes</span>
            </div>
            <div className="stat-item moderate">
              <span className="stat-number">{stats.moderateDays}</span>
              <span className="stat-label">Días moderados</span>
            </div>
            <div className="stat-item poor">
              <span className="stat-number">{stats.poorDays}</span>
              <span className="stat-label">Días por mejorar</span>
            </div>
            <div className="stat-item none">
              <span className="stat-number">{stats.noDays}</span>
              <span className="stat-label">Sin registro</span>
            </div>
          </div>
          <div className="overall-adherence">
            <p>Adherencia total: <strong>{Math.round(((stats.goodDays + stats.moderateDays) / stats.total) * 100)}%</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendario;