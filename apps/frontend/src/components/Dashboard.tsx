import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
// Settings moved from modal to a dedicated page section
import ProgressRing from './ProgressRing';
import WaterTracker from './WaterTracker';
// Eager imports removidos; ahora se cargan de forma diferida arriba
// import Metas from './Metas'; // Unificado dentro de Plan
const Plan = React.lazy(() => import('./Plan'));
const RegistroNew = React.lazy(() => import('./RegistroProFinal'));
const Calendario = React.lazy(() => import('./Calendario'));
const Progreso = React.lazy(() => import('./Progreso'));
const SettingsPage = React.lazy(() => import('./SettingsPage'));
import Toast from './ToastPro';
import './Dashboard.css';
import OnboardingOverlay from './OnboardingOverlay';
import OnboardingGuide from './OnboardingGuide';
import PlateLoader from './PlateLoader';
import { useAuth } from '../utils/auth';
import { loadUserState, saveUserState } from '../utils/cloudSync';
import SaveStatus from './SaveStatus';
import type { AppState, DayLog, DayLogMap } from '../interfaces/AppState';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('inicio');
  const [toast, setToast] = useState({ message: '', isVisible: false });
  // Settings is now a page, not a modal
  const [showOverlay, setShowOverlay] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ show: boolean; variant: 'success' | 'error' | 'saving' }>({ show: false, variant: 'success' });
  
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

  const saveDebounce = useRef<number | null>(null);
  const cloudLoadedRef = useRef(false);
  const isInitialLoadRef = useRef(true);

  // Require auth. If not logged, go to home
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Load user data (cloud preferred) once user is known
    if (!user) return;
    (async () => {
      const userData = localStorage.getItem('kiloByteData');
      let data = userData ? JSON.parse(userData) : null;
      try {
        if (!cloudLoadedRef.current) {
          const cloud = await loadUserState(user.uid);
          if (cloud) {
            data = cloud;
            // Migración: asegurar que fastingSessions existe SIN guardar automáticamente
            if (!data.fastingSessions) {
              data.fastingSessions = [];
              console.log('[dashboard] migrated: added empty fastingSessions array');
              // Guardar la migración de vuelta a la nube SOLO UNA VEZ
              saveUserState(user.uid, data).catch(e => 
                console.warn('[dashboard] migration save failed:', e)
              );
            }
            localStorage.setItem('kiloByteData', JSON.stringify(data));
          }
          cloudLoadedRef.current = true;
        }
      } catch (e) {
        console.warn('[dashboard] cloud load failed, will use local', e);
      }
      if (data) {
        // Migración local también (sin duplicar si ya se migró arriba)
        if (!data.fastingSessions) {
          data.fastingSessions = [];
          console.log('[dashboard] local migration: added empty fastingSessions array');
        }
        isInitialLoadRef.current = true; // Mark as initial load to prevent autosave
        setAppState(data);
        isInitialLoadRef.current = false; // Reset flag after initial load
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
      }
    })();
  }, [user]);

  // Decide if overlay should show on first entry to dashboard, without flicker
  useEffect(() => {
    const seen = localStorage.getItem('kiloByteOnboardingSeen') === '1';
    if (seen) { setShowOverlay(false); return; }
    // Si el usuario ya tiene datos históricos (no solo hoy), no mostrar overlay
    const hasHistorical = (() => {
      const keys = Object.keys(appState.log || {});
      for (const k of keys) {
        if (hasData(appState.log?.[k])) return true;
      }
      return false;
    })();
    if (hasHistorical) { setShowOverlay(false); return; }
    // Si no hay históricos, evaluamos el día de hoy
    const today = new Date().toISOString().split('T')[0];
    const hasUserData = hasData(appState.log?.[today]);
    setShowOverlay(!hasUserData);
  }, [appState.log, appState.perfil?.nombre]);

  const updateAppState = (newState: AppState) => {
    setAppState(newState);
    localStorage.setItem('kiloByteData', JSON.stringify(newState));
    // Try cloud save but don't fail if Firestore is not enabled
    // SKIP autosave during initial load to prevent overwriting cloud data
    if (user && !isInitialLoadRef.current) {
      setSaveStatus({ show: true, variant: 'saving' });
      saveUserState(user.uid, newState)
        .then(() => setSaveStatus({ show: true, variant: 'success' }))
        .catch(e => {
          console.warn('[dashboard] cloud save failed, but localStorage OK', e);
          setSaveStatus({ show: true, variant: 'success' }); // Show success since localStorage worked
        });
    }
    
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

  // Global autosave when localStorage 'kiloByteData' changes (e.g., from Settings or Registro components)
  useEffect(() => {
    if (!user) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'kiloByteData' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setAppState(parsed);
          // Try immediate save on external localStorage changes, but don't block
          if (user) {
            saveUserState(user.uid, parsed).catch(err => {
              console.warn('[dashboard] storage listener cloud save failed, localStorage OK', err);
            });
          }
        } catch (err) {
          console.warn('[dashboard] storage listener parse failed', err);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [user]);

  // Fallback autosave if some component updates state directly
  useEffect(() => {
    if (!user) return;
    if (saveDebounce.current) window.clearTimeout(saveDebounce.current);
    saveDebounce.current = window.setTimeout(() => {
      try {
        saveUserState(user.uid, appState);
      } catch (e) {
        console.warn('[dashboard] autosave effect error', e);
      }
    }, 2000);
    return () => {
      if (saveDebounce.current) window.clearTimeout(saveDebounce.current);
    };
  }, [appState, user]);

  const showToast = (message: string) => {
    if (appState.perfil?.silenciarNotificaciones) return;
    setToast({ message, isVisible: true });
  };

  const hideToast = () => {
    setToast({ message: '', isVisible: false });
  };

  const navigateToSection = (section: string) => {
    setActiveSection(section);
  };


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
  const hasData = (dl?: DayLog) => {
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
          <Suspense fallback={<div style={{ padding: 16 }}><PlateLoader tight /></div>}>
            <Plan appState={appState} updateAppState={updateAppState} showToast={showToast} />
          </Suspense>
        );
      case 'registro':
        return (
          <Suspense fallback={<div style={{ padding: 16 }}><PlateLoader tight /></div>}>
            <RegistroNew 
              appState={appState} 
              updateAppState={updateAppState} 
              showToast={showToast} 
            />
          </Suspense>
        );
      case 'calendario':
        return (
          <Suspense fallback={<div style={{ padding: 16 }}><PlateLoader tight /></div>}>
            <Calendario appState={appState} />
          </Suspense>
        );
      case 'progreso':
        return (
          <Suspense fallback={<div style={{ padding: 16 }}><PlateLoader tight /></div>}>
            <Progreso appState={appState} />
          </Suspense>
        );
      case 'settings':
        return (
          <Suspense fallback={<div style={{ padding: 16 }}><PlateLoader tight /></div>}>
            <SettingsPage
              appState={appState}
              updateAppState={updateAppState}
              showToast={showToast}
              onShowOnboarding={() => setShowOverlay(true)}
            />
          </Suspense>
        );
      case 'metas':
        // Metas y Plan unificados: usamos el componente Plan como única experiencia
        return (
          <Suspense fallback={<div style={{ padding: 16 }}><PlateLoader tight /></div>}>
            <Plan appState={appState} updateAppState={updateAppState} showToast={showToast} />
          </Suspense>
        );
      // Perfil se edita dentro de Plan; no hay sección independiente
      default: {
        const needsProfile = !appState.perfil?.nombre || !appState.perfil?.peso || !appState.perfil?.altura_cm;
        const needsGoals = !appState.metas?.kcal || !appState.metas?.prote_g_dia || !appState.metas?.grasa_g_dia || !appState.metas?.carbs_g_dia;
        return (
          <div className="dashboard-content">
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
                    // Try immediate save for water tracking, but don't block UI
                    if (user) {
                      saveUserState(user.uid, { ...appState, log: newLog }).catch(e => console.warn('[water] cloud save failed, localStorage OK', e));
                    }
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
  {authLoading ? <div style={{ padding: 16 }}><PlateLoader tight label="Cocinando…"/></div> : renderContent()}
      </main>
      {showOverlay && (
        <OnboardingOverlay 
          goToSection={navigateToSection}
          onDismiss={() => setShowOverlay(false)}
          nombre={appState.perfil?.nombre}
        />
      )}
      {toast.isVisible && (
        <Toast 
          message={toast.message} 
          onClose={hideToast} 
        />
      )}
      {/* Settings now integrated as a section; no modal here */}
      <SaveStatus show={saveStatus.show} variant={saveStatus.variant} />
    </div>
  );
};

export default Dashboard;