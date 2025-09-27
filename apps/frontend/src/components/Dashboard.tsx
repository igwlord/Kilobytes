import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import SettingsModal from './SettingsModal';
import ProgressRing from './ProgressRing';
import Plan from './Plan';
import WaterTracker from './WaterTracker';
import RegistroNew from './RegistroProFinal';
import Calendario from './Calendario';
import Progreso from './Progreso';
// import Metas from './Metas'; // Unificado dentro de Plan
import Perfil from './Perfil';
import Toast from './ToastPro';
import './Dashboard.css';
import OnboardingOverlay from './OnboardingOverlay';
import OnboardingGuide from './OnboardingGuide';

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
    pasos: 3900,
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

  const calculateTMB = (): number => {
    if (appState.perfil.genero === 'masculino') {
      return 10 * appState.perfil.peso + 6.25 * appState.perfil.altura_cm - 5 * appState.perfil.edad + 5;
    } else {
      return 10 * appState.perfil.peso + 6.25 * appState.perfil.altura_cm - 5 * appState.perfil.edad - 161;
    }
  };

  const calculateTDEE = (): number => {
    return calculateTMB() * appState.perfil.actividad;
  };

  const goToRegister = () => {
    setActiveSection('registro');
  };

  // quick add removed per request

  const renderContent = () => {
    switch (activeSection) {
      case 'plan':
        return <Plan appState={appState} updateAppState={updateAppState} showToast={showToast} />;
      case 'registro':
        return (
          <RegistroNew 
            appState={appState} 
            updateAppState={(ns) => updateAppState(ns as unknown as AppState)} 
            showToast={showToast} 
          />
        );
      case 'calendario':
        return <Calendario appState={appState} updateAppState={updateAppState as unknown as (s: unknown) => void} />;
      case 'progreso':
        return <Progreso appState={appState} />;
      case 'metas':
        // Metas y Plan unificados: usamos el componente Plan como única experiencia
        return <Plan appState={appState} updateAppState={updateAppState} showToast={showToast} />;
      case 'perfil':
        return <Perfil appState={appState} updateAppState={updateAppState as unknown as (s: unknown) => void} showToast={showToast} />;
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

              <div className="kpi-card kpi-compact">
                <h3>Pasos</h3>
                <ProgressRing 
                  value={currentProgress.pasos} 
                  maxValue={appState.metas.pasos_dia} 
                  color="var(--color-secondary)"
                  size={ring}
                />
                <div className="kpi-text">
                  <span className="kpi-value">{currentProgress.pasos.toLocaleString()}</span>
                  <span className="kpi-total">/ {appState.metas.pasos_dia.toLocaleString()}</span>
                </div>
              </div>
            </div>
            </>
            )})()}

            <div className="action-buttons">
              <button onClick={goToRegister} className="btn btn-primary">
                Registrar Comida
              </button>
            </div>

            <div className="wellbeing-grid">
              <div className="wellbeing-card">
                <h3>😴 Sueño y Descanso</h3>
                <p className="wb-sub">Objetivo recomendado: 7-9h</p>
                <div className="wb-row">
                  <label>Horas dormidas hoy</label>
                  <div className="wb-input-group">
                    <button
                      className="wb-btn"
                      onClick={() => {
                        const val = Math.max(0, Math.min(24, (currentProgress.sueno_h || 0) - 0.5));
                        const today = new Date().toISOString().split('T')[0];
                        const newLog = { ...(appState.log || {}) };
                        newLog[today] = {
                          ...(newLog[today] || { agua_ml: 0, pasos: 0, ejercicio_min: 0, comidas: { desayuno: [], almuerzo: [], merienda: [], cena: [], snack: [] }, totals: { kcal: 0, prot: 0, carbs: 0, grasa: 0 } }),
                          sueno_h: val,
                        };
                        setCurrentProgress(p => ({ ...p, sueno_h: val }));
                        setAppState({ ...appState, log: newLog });
                        localStorage.setItem('kiloByteData', JSON.stringify({ ...appState, log: newLog }));
                      }}
                    >−</button>
                    <input
                      type="number"
                      min={0}
                      max={24}
                      step={0.5}
                      value={currentProgress.sueno_h}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(24, parseFloat(e.target.value) || 0));
                        const today = new Date().toISOString().split('T')[0];
                        const newLog = { ...(appState.log || {}) };
                        newLog[today] = {
                          ...(newLog[today] || { agua_ml: 0, pasos: 0, ejercicio_min: 0, comidas: { desayuno: [], almuerzo: [], merienda: [], cena: [], snack: [] }, totals: { kcal: 0, prot: 0, carbs: 0, grasa: 0 } }),
                          sueno_h: val,
                        };
                        setCurrentProgress(p => ({ ...p, sueno_h: val }));
                        setAppState({ ...appState, log: newLog });
                        localStorage.setItem('kiloByteData', JSON.stringify({ ...appState, log: newLog }));
                      }}
                    />
                    <button
                      className="wb-btn"
                      onClick={() => {
                        const val = Math.max(0, Math.min(24, (currentProgress.sueno_h || 0) + 0.5));
                        const today = new Date().toISOString().split('T')[0];
                        const newLog = { ...(appState.log || {}) };
                        newLog[today] = {
                          ...(newLog[today] || { agua_ml: 0, pasos: 0, ejercicio_min: 0, comidas: { desayuno: [], almuerzo: [], merienda: [], cena: [], snack: [] }, totals: { kcal: 0, prot: 0, carbs: 0, grasa: 0 } }),
                          sueno_h: val,
                        };
                        setCurrentProgress(p => ({ ...p, sueno_h: val }));
                        setAppState({ ...appState, log: newLog });
                        localStorage.setItem('kiloByteData', JSON.stringify({ ...appState, log: newLog }));
                      }}
                    >+</button>
                    <button
                      className="wb-btn ghost"
                      title="Copiar de ayer"
                      onClick={() => {
                        const today = new Date();
                        const prev = new Date(today);
                        prev.setDate(today.getDate() - 1);
                        const prevKey = prev.toISOString().split('T')[0];
                        const prevVal = appState.log?.[prevKey]?.sueno_h ?? currentProgress.sueno_h ?? 0;
                        const todayKey = today.toISOString().split('T')[0];
                        const newLog = { ...(appState.log || {}) };
                        newLog[todayKey] = {
                          ...(newLog[todayKey] || { agua_ml: 0, pasos: 0, ejercicio_min: 0, comidas: { desayuno: [], almuerzo: [], merienda: [], cena: [], snack: [] }, totals: { kcal: 0, prot: 0, carbs: 0, grasa: 0 } }),
                          sueno_h: prevVal,
                        };
                        setCurrentProgress(p => ({ ...p, sueno_h: prevVal }));
                        setAppState({ ...appState, log: newLog });
                        localStorage.setItem('kiloByteData', JSON.stringify({ ...appState, log: newLog }));
                      }}
                    >⟲</button>
                  </div>
                </div>
              </div>
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
              <div className="metabolism-card compact">
                <h3>ℹ️ Metabolismo</h3>
                <div className="metabolism-stats">
                  <div className="stat">
                    <span className="stat-label">TMB</span>
                    <span className="stat-value">{Math.round(calculateTMB())} kcal</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">TDEE</span>
                    <span className="stat-value">{Math.round(calculateTDEE())} kcal</span>
                  </div>
                </div>
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
      />
    </div>
  );
};

export default Dashboard;