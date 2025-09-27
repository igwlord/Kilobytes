import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import SettingsModal from './SettingsModal';
import ProgressRing from './ProgressRing';
import WaterTracker from './WaterTracker';
// Eager imports removidos; ahora se cargan de forma diferida arriba
// import Metas from './Metas'; // Unificado dentro de Plan
const Plan = React.lazy(() => import('./Plan'));
const RegistroNew = React.lazy(() => import('./RegistroProFinal'));
const Calendario = React.lazy(() => import('./Calendario'));
const Progreso = React.lazy(() => import('./Progreso'));
const Perfil = React.lazy(() => import('./Perfil'));
import Toast from './ToastPro';
import './Dashboard.css';
import OnboardingOverlay from './OnboardingOverlay';
import OnboardingGuide from './OnboardingGuide';
import Spinner from './Spinner';

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
  peso_inicial?: number;
  desbloquearRecetas?: boolean;
  silenciarNotificaciones?: boolean;
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
  ayuno_h_dia?: number;
}

interface DayLogMin {
  totals?: { kcal: number; prot: number; carbs: number; grasa: number };
  sueno_h?: number;
  ayuno_h?: number;
  agua_ml_consumida?: number;
}

interface AppState {
  perfil: UserProfile;
  metas: Goals;
  log: { [date: string]: DayLogMin };
}
type AppStateLike = AppState; // For SettingsModal prop compatibility

type DayLogMap = { [date: string]: DayLogMin };

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('inicio');
  const [toast, setToast] = useState({ message: '', isVisible: false });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  
  const [appState, setAppState] = useState<AppState>({
    perfil: {
      nombre: '',
      peso: 70,
      altura_cm: 175,
      edad: 30,
      genero: 'masculino',
      actividad: 1.375,
      exclusiones: [],
      objetivo: 'mantener',
      theme: 'dark',
      desbloquearRecetas: false
    },
    metas: {
      kcal: 2000,
      prote_g_dia: 140,
      grasa_g_dia: 60,
      carbs_g_dia: 225,
      agua_ml: 2000,
      pasos_dia: 8000,
      peso_objetivo: 65,
      ejercicio_min: 30,
      comidas_saludables: 5
    },
    log: {}
  });

  const [currentProgress, setCurrentProgress] = useState({
    kcal: 0,
    proteinas: 0,
    carbs: 0,
    grasas: 0,
    agua: 0,
    sueno_h: 0,
    ayuno_h: 0
  });

  useEffect(() => {
    // Load user data from localStorage
    const userData = localStorage.getItem('kiloByteData');
    if (userData) {
      try {
        const data = JSON.parse(userData);
        setAppState(data);
        
        // Theme is applied in App on load; keep single source of truth

        // Calculate current progress from today's log
        const today = new Date().toISOString().split('T')[0];
        const todayLog = data.log?.[today];
        if (todayLog) {
          setCurrentProgress(prev => ({
            ...prev,
            kcal: todayLog.totals?.kcal || 0,
            proteinas: todayLog.totals?.prot || 0,
            carbs: todayLog.totals?.carbs || 0,
            grasas: todayLog.totals?.grasa || 0,
            sueno_h: todayLog.sueno_h ?? prev.sueno_h ?? 0,
            ayuno_h: todayLog.ayuno_h ?? prev.ayuno_h ?? 0,
            agua: todayLog.agua_ml_consumida ?? prev.agua ?? 0,
          }));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  // Decide if overlay should show on first entry to dashboard
  useEffect(() => {
    const seen = localStorage.getItem('kiloByteOnboardingSeen') === '1';
    // Show overlay on the first visit regardless of completeness; guide card below still adapts to missing data
    if (!seen) {
      setShowOverlay(true);
    } else {
      setShowOverlay(false);
    }
  }, [appState]);

  const updateAppState = (newState: AppState) => {
    setAppState(newState);
    localStorage.setItem('kiloByteData', JSON.stringify(newState));
    
    // Update current progress if today's log changed
    const today = new Date().toISOString().split('T')[0];
    const todayLog = newState.log?.[today];
    if (todayLog) {
      setCurrentProgress(prev => ({
        ...prev,
        kcal: todayLog.totals?.kcal || 0,
        proteinas: todayLog.totals?.prot || 0,
        carbs: todayLog.totals?.carbs || 0,
        grasas: todayLog.totals?.grasa || 0,
        sueno_h: todayLog.sueno_h ?? prev.sueno_h ?? 0,
        ayuno_h: todayLog.ayuno_h ?? prev.ayuno_h ?? 0,
        agua: todayLog.agua_ml_consumida ?? prev.agua ?? 0,
      }));
    }
  };

  const showToast = (message: string) => {
    if (appState.perfil?.silenciarNotificaciones) return;
    setToast({ message, isVisible: true });
  };

  const hideToast = () => {
    setToast({ message: '', isVisible: false });
  };

  const navigateToSection = (section: string) => {
    if (section === 'settings') {
      setSettingsOpen(true);
      return;
    }
    setActiveSection(section);
  };

  const closeSettings = () => setSettingsOpen(false);

  // Streaks helpers (rachas)
  const parseKey = (key: string) => {
    const [y, m, d] = key.split('-').map(n => parseInt(n, 10));
    return new Date(y, (m || 1) - 1, d || 1);
  };
  const formatKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const hasData = (dl?: DayLogMin) => {
    if (!dl) return false;
    return (dl.totals?.kcal ?? 0) > 0 || (dl.agua_ml_consumida ?? 0) > 0 || (dl.sueno_h ?? 0) > 0 || (dl.ayuno_h ?? 0) > 0;
  };
  const getCurrentStreak = (): number => {
    let streak = 0;
    const today = new Date();
    const check = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    while (true) {
      const key = formatKey(check);
      if (hasData(appState.log?.[key])) {
        streak += 1;
        check.setDate(check.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };
  const getBestStreak = (): number => {
    const keys = Object.keys(appState.log || {});
    if (keys.length === 0) return 0;
    const valid = keys.filter(k => hasData(appState.log[k])).sort();
    if (valid.length === 0) return 0;
    let best = 1;
    let curr = 1;
    for (let i = 1; i < valid.length; i++) {
      const prev = parseKey(valid[i - 1]);
      const currDate = parseKey(valid[i]);
      const nextOfPrev = new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1);
      if (formatKey(nextOfPrev) === formatKey(currDate)) {
        curr += 1;
        best = Math.max(best, curr);
      } else {
        curr = 1;
      }
    }
    return best;
  };

  const goToRegister = () => {
    setActiveSection('registro');
  };

  // quick add removed per request

  const renderContent = () => {
    switch (activeSection) {
      case 'plan':
        return (
          <Suspense fallback={<div style={{ padding: 16 }}><Spinner tight /></div>}>
            <Plan appState={appState} updateAppState={updateAppState} showToast={showToast} />
          </Suspense>
        );
      case 'registro':
        return (
          <Suspense fallback={<div style={{ padding: 16 }}><Spinner tight /></div>}>
            <RegistroNew 
              appState={appState} 
              updateAppState={(ns) => updateAppState(ns as unknown as AppState)} 
              showToast={showToast} 
            />
          </Suspense>
        );
      case 'calendario':
        return (
          <Suspense fallback={<div style={{ padding: 16 }}><Spinner tight /></div>}>
            <Calendario appState={appState} updateAppState={updateAppState as unknown as (s: unknown) => void} />
          </Suspense>
        );
      case 'progreso':
        return (
          <Suspense fallback={<div style={{ padding: 16 }}><Spinner tight /></div>}>
            <Progreso appState={appState} />
          </Suspense>
        );
      case 'metas':
        // Metas y Plan unificados: usamos el componente Plan como única experiencia
        return (
          <Suspense fallback={<div style={{ padding: 16 }}><Spinner tight /></div>}>
            <Plan appState={appState} updateAppState={updateAppState} showToast={showToast} />
          </Suspense>
        );
      case 'perfil':
        return (
          <Suspense fallback={<div style={{ padding: 16 }}><Spinner tight /></div>}>
            <Perfil appState={appState} updateAppState={updateAppState as unknown as (s: unknown) => void} showToast={showToast} />
          </Suspense>
        );
      default: {
        const needsProfile = !appState.perfil?.nombre || !appState.perfil?.peso || !appState.perfil?.altura_cm;
        const needsGoals = !appState.metas?.kcal || !appState.metas?.prote_g_dia || !appState.metas?.grasa_g_dia || !appState.metas?.carbs_g_dia;
        return (
          <div className="dashboard-content">
            {showOverlay && (
              <OnboardingOverlay 
                goToSection={navigateToSection}
                onDismiss={() => setShowOverlay(false)}
                nombre={appState.perfil?.nombre}
              />
            )}
            {(needsProfile || needsGoals) && (
              <OnboardingGuide 
                goToSection={navigateToSection}
                nombre={appState.perfil?.nombre}
                needsProfile={!!needsProfile}
                needsGoals={!!needsGoals}
              />
            )}
            <div className="dashboard-header">
              <h1 className="welcome-message">¡Hola, {appState.perfil.nombre || 'Usuario'}!</h1>
              <p className="dashboard-subtitle">
                Ajustá porciones según tus datos y seguí tu progreso día a día.
              </p>
            </div>

            {(() => { const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 480px)').matches; const ring = isMobile ? 56 : 72; return (
            <>
            {/* CTA principal para registrar comida */}
              <div className="primary-cta">
                <button onClick={goToRegister} className="btn btn-primary btn-cta btn-cta-glow">
                  <span className="cta-emoji" aria-hidden>🍽️</span>
                  <span>Registrar Comida ahora</span>
                </button>
                <span className="cta-hint">Tip: tocá el + en cada comida para sumar alimentos en segundos</span>
              </div>

            <div className="kpi-grid kpi-grid-compact kpi-grid-mobile-2">
              <div className="kpi-card kpi-compact">
                <h3>Calorías</h3>
                <ProgressRing 
                  value={currentProgress.kcal} 
                  maxValue={appState.metas.kcal} 
                  color="var(--color-primary)"
                  size={ring}
                />
                <div className="kpi-text">
                  <span className="kpi-value">{Math.round(currentProgress.kcal)}</span>
                  <span className="kpi-total">/ {Math.round(appState.metas.kcal)}</span>
                </div>
              </div>

              <div className="kpi-card kpi-compact">
                <h3>Proteínas</h3>
                <ProgressRing 
                  value={currentProgress.proteinas} 
                  maxValue={appState.metas.prote_g_dia} 
                  color="var(--color-secondary)"
                  size={ring}
                />
                <div className="kpi-text">
                  <span className="kpi-value">{Math.round(currentProgress.proteinas)}g</span>
                  <span className="kpi-total">/ {Math.round(appState.metas.prote_g_dia)}g</span>
                </div>
              </div>

              <div className="kpi-card kpi-compact">
                <h3>Carbos</h3>
                <ProgressRing 
                  value={currentProgress.carbs} 
                  maxValue={appState.metas.carbs_g_dia} 
                  color="#45B7D1"
                  size={ring}
                />
                <div className="kpi-text">
                  <span className="kpi-value">{Math.round(currentProgress.carbs)}g</span>
                  <span className="kpi-total">/ {Math.round(appState.metas.carbs_g_dia)}g</span>
                </div>
              </div>

              <div className="kpi-card kpi-compact">
                <h3>Grasas</h3>
                <ProgressRing 
                  value={currentProgress.grasas} 
                  maxValue={appState.metas.grasa_g_dia} 
                  color="#96CEB4"
                  size={ring}
                />
                <div className="kpi-text">
                  <span className="kpi-value">{Math.round(currentProgress.grasas)}g</span>
                  <span className="kpi-total">/ {Math.round(appState.metas.grasa_g_dia)}g</span>
                </div>
              </div>
            </div>

            <div className="kpi-grid kpi-grid-compact kpi-grid-mobile-2">
              <div className="kpi-card kpi-compact">
                <h3>Agua</h3>
                <WaterTracker
                  targetMl={appState.metas.agua_ml}
                  consumedMl={currentProgress.agua}
                  onChange={(ml) => {
                    const today = new Date().toISOString().split('T')[0];
                    const newLog: DayLogMap = { ...(appState.log || {}) };
                    newLog[today] = {
                      ...(newLog[today] || { agua_ml: 0, pasos: 0, ejercicio_min: 0, comidas: { desayuno: [], almuerzo: [], merienda: [], cena: [], snack: [] }, totals: { kcal: 0, prot: 0, carbs: 0, grasa: 0 } }),
                      agua_ml_consumida: ml,
                    };
                    setCurrentProgress(p => ({ ...p, agua: ml }));
                    setAppState({ ...appState, log: newLog });
                    localStorage.setItem('kiloByteData', JSON.stringify({ ...appState, log: newLog }));
                  }}
                />
              </div>
            </div>
            </>
            )})()}

            <div className="wellbeing-grid">
              <div className="wellbeing-card compact">
                <h3>⏳ Ayuno</h3>
                <p className="wb-sub">Configurado en Plan</p>
                <div className="metabolism-stats">
                  <div className="stat">
                    <span className="stat-label">Objetivo diario</span>
                    <span className="stat-value">{appState.metas.ayuno_h_dia ?? 14} h</span>
                  </div>
                </div>
              </div>
              <div className="streaks-card compact">
                <h3>🔥 Rachas</h3>
                {(() => {
                  const current = getCurrentStreak();
                  const best = getBestStreak();
                  const milestones = [7, 14, 21, 30];
                  const next = milestones.find(m => m > current) ?? null;
                  const pct = next ? Math.min(100, Math.round((current / next) * 100)) : 100;
                  return (
                    <div className="streaks-content">
                      <div className="streaks-stats">
                        <div className="stat"><span className="stat-label">Racha actual</span><span className="stat-value">{current} días</span></div>
                        <div className="stat"><span className="stat-label">Mejor racha</span><span className="stat-value">{best} días</span></div>
                      </div>
                      <div className="streaks-milestones">
                        {milestones.map(m => (
                          <span key={m} className={`milestone ${current >= m ? 'achieved' : ''}`}>+{m} días</span>
                        ))}
                      </div>
                      <div className="streaks-progress">
                        <div className="bar"><div className="fill" style={{ width: `${pct}%` }} /></div>
                        <span className="next-label">{next ? `Próximo hito: ${next} días` : '¡Todos los hitos logrados!'}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="dashboard">
      <Navigation activeSection={activeSection} onNavigate={navigateToSection} />
      <main className="dashboard-main">
        {renderContent()}
      </main>
      {toast.isVisible && (
        <Toast 
          message={toast.message} 
          onClose={hideToast} 
        />
      )}
      <SettingsModal
        open={settingsOpen}
        onClose={closeSettings}
        appState={appState as AppStateLike}
        updateAppState={(ns: unknown) => updateAppState(ns as AppState)}
        showToast={showToast}
        onShowOnboarding={() => setShowOverlay(true)}
      />
    </div>
  );
};

export default Dashboard;