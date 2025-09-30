import React, { useEffect, useState } from 'react';
import './SettingsModal.css';
import './SettingsPage.css';
import { signOutUser, useAuth } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { saveUserState, loadUserState } from '../utils/cloudSync';
import type { AppState, DayLog } from '../interfaces/AppState';

interface SettingsPageProps {
  appState: AppState;
  updateAppState: (newState: AppState) => void;
  showToast: (message: string) => void;
  onShowOnboarding?: () => void;
}

type ThemeId = 'banana' | 'sandia' | 'uva';
const THEMES: { id: ThemeId; label: string; className: string; hint?: string }[] = [
  { id: 'banana', label: 'Banana Split', className: 'theme-banana', hint: 'Claro juguetón' },
  { id: 'sandia', label: 'Sandía Party', className: 'theme-sandia', hint: 'Claro vibrante' },
  { id: 'uva', label: 'Uva Fit', className: 'theme-uva', hint: 'Oscuro elegante' },
];

const SettingsPage: React.FC<SettingsPageProps> = ({ appState, updateAppState, showToast, onShowOnboarding }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Map legacy 'dark'/'light' to new defaults (dark->uva, light->banana)
  const mapLegacy = (t?: string): ThemeId => (t === 'light' ? 'banana' : t === 'dark' ? 'uva' : (t as ThemeId) || 'uva');
  const [theme, setTheme] = useState<ThemeId>(mapLegacy(appState.perfil?.theme));
  const [muteToasts, setMuteToasts] = useState(!!appState.perfil?.silenciarNotificaciones);
  const [busy, setBusy] = useState<'force' | 'restore' | null>(null);
  const [done, setDone] = useState<'force' | 'restore' | null>(null);

  useEffect(() => {
    setTheme(mapLegacy(appState.perfil?.theme));
    setMuteToasts(!!appState.perfil?.silenciarNotificaciones);
  }, [appState.perfil?.theme, appState.perfil?.silenciarNotificaciones]);

  const applyTheme = (id: ThemeId) => {
    document.body.classList.remove('dark', 'light', 'theme-banana', 'theme-sandia', 'theme-uva', 'theme-pastel-magenta', 'theme-pastel-green', 'theme-gold');
    const map: Record<ThemeId, string> = { banana: 'theme-banana', sandia: 'theme-sandia', uva: 'theme-uva' };
    document.body.classList.add(map[id]);
    if (id === 'uva') {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  };

  const onThemePick = (id: ThemeId) => {
    setTheme(id);
    applyTheme(id);
    const newState = { ...appState, perfil: { ...appState.perfil, theme: id } };
    updateAppState(newState);
    try { localStorage.setItem('kiloByteData', JSON.stringify(newState)); } catch { /* ignore storage errors */ }
    // Try cloud save for theme changes, but don't block UI
    if (user) {
      saveUserState(user.uid, newState).catch(e => console.warn('[settings] theme cloud save failed, localStorage OK', e));
    }
    showToast('Tema aplicado 🎨');
  };

  // Merge helper: cloud-first strategy (perfil/metas: nube gana; logs: más entradas; sesiones: prioriza nube)
  const countFoods = (dl?: DayLog) => {
    if (!dl) return 0;
    const m = dl.comidas;
    return (m.desayuno?.length || 0) + (m.almuerzo?.length || 0) + (m.merienda?.length || 0) + (m.cena?.length || 0) + (m.snack?.length || 0);
  };
  const mergeStatesCloudFirst = (cloud: AppState | null, local: AppState): AppState => {
    if (!cloud) return local;
    const perfil = { ...local.perfil, ...cloud.perfil };
    const metas = { ...local.metas, ...cloud.metas };
    const resultLog: AppState['log'] = { ...local.log };
    Object.entries(cloud.log || {}).forEach(([key, cloudDay]) => {
      const localDay = resultLog[key];
      if (!localDay) {
        resultLog[key] = cloudDay as DayLog;
      } else {
        resultLog[key] = countFoods(cloudDay as DayLog) >= countFoods(localDay as DayLog) ? (cloudDay as DayLog) : localDay;
      }
    });
    const cloudIds = new Set((cloud.fastingSessions || []).map(s => s.id));
    const mergedSessions = [
      ...(cloud.fastingSessions || []),
      ...(local.fastingSessions || []).filter(s => !cloudIds.has(s.id))
    ];
    return { ...local, ...cloud, perfil, metas, log: resultLog, fastingSessions: mergedSessions } as AppState;
  };

  const forceSync = async () => {
    if (busy || done) return;
    if (!user) { showToast('Iniciá sesión para sincronizar'); return; }
    setBusy('force');
    try {
      const cloud = await loadUserState(user.uid);
      const merged = mergeStatesCloudFirst(cloud, appState);
      updateAppState(merged);
      localStorage.setItem('kiloByteData', JSON.stringify(merged));
      await saveUserState(user.uid, merged);
      setDone('force');
      showToast('Sincronizado con la nube ✅');
    } catch (e) {
      console.warn('Force sync failed', e);
      showToast('Error al sincronizar ❌');
    } finally {
      setBusy(null);
      setTimeout(() => setDone(null), 1500);
    }
  };

  const restoreFromBackup = async () => {
    if (busy || done) return;
    if (!user) { showToast('Iniciá sesión para restaurar'); return; }
    setBusy('restore');
    try {
      const raw = localStorage.getItem('kiloByteDataBackup');
      if (!raw) { showToast('No hay backup local disponible'); return; }
      const backup = JSON.parse(raw) as AppState;
      const cloud = await loadUserState(user.uid);
      const merged = mergeStatesCloudFirst(cloud, backup);
      updateAppState(merged);
      localStorage.setItem('kiloByteData', JSON.stringify(merged));
      await saveUserState(user.uid, merged);
      setDone('restore');
      showToast('Backup restaurado y sincronizado ✅');
    } catch (e) {
      console.warn('Restore failed', e);
      showToast('Error al restaurar ❌');
    } finally {
      setBusy(null);
      setTimeout(() => setDone(null), 1500);
    }
  };

  const openOnboarding = () => {
  try { localStorage.removeItem('kiloByteOnboardingSeen'); } catch { /* ignore storage errors */ }
    onShowOnboarding?.();
    showToast('Guía de inicio abierta ✅');
  };

  const toggleMute = () => {
    const next = !muteToasts;
    setMuteToasts(next);
    const newState = { ...appState, perfil: { ...appState.perfil, silenciarNotificaciones: next } };
    updateAppState(newState);
    try { localStorage.setItem('kiloByteData', JSON.stringify(newState)); } catch { /* ignore */ }
    // Try cloud save for notification settings, but don't block UI
    if (user) {
      saveUserState(user.uid, newState).catch(e => console.warn('[settings] mute cloud save failed, localStorage OK', e));
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
  try { localStorage.removeItem('kiloByteData'); } catch { /* ignore */ }
      navigate('/');
    } catch (e) {
      console.warn('No se pudo cerrar sesión', e);
      showToast('No se pudo cerrar sesión');
    }
  };

  return (
    <div className="settings-page">
      <header className="settings-page-header">
        <h2>Configuración</h2>
      </header>

      <div className="card settings-block">
        <h3 className="settings-block-title">Tema</h3>
        <div className="theme-segmented" role="tablist" aria-label="Elegir tema">
          {THEMES.map(t => (
            <button
              key={t.id}
              role="tab"
              aria-selected={theme === t.id}
              className={`seg-btn ${theme === t.id ? 'active' : ''}`}
              onClick={() => onThemePick(t.id)}
              title={t.hint || t.label}
            >
              <span className={`swatch ${t.className}`} aria-hidden></span>
              <span className="seg-label">{t.label}</span>
            </button>
          ))}
        </div>
        <p className="hint">Se aplica al instante. Probá los tres para ver cuál te motiva más.</p>
      </div>

      {/* Sección de recetas/plan removida por pedido */}

      <div className="card settings-block">
        <h3 className="settings-block-title">Notificaciones y alertas</h3>
        <label className="switch-row">
          <span>Silenciar notificaciones</span>
          <button
            type="button"
            role="switch"
            aria-checked={muteToasts}
            className={`ios-switch ${muteToasts ? 'on' : ''}`}
            onClick={toggleMute}
          >
            <span className="knob" />
          </button>
        </label>
      </div>

      <div className="card settings-block">
        <h3 className="settings-block-title">Sincronización y recuperación</h3>
        <div className="backup-row" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className={`btn btn-primary ${done==='force' ? 'done' : ''}`} onClick={forceSync} disabled={busy !== null}>
            {busy === 'force' ? 'Sincronizando…' : (done === 'force' ? '✅ Sincronizado' : '� Forzar sincronización')}
          </button>
          <button className={`btn btn-secondary ${done==='restore' ? 'done' : ''}`} onClick={restoreFromBackup} disabled={busy !== null}>
            {busy === 'restore' ? 'Restaurando…' : (done === 'restore' ? '✅ Restaurado' : '� Restaurar desde backup')}
          </button>
        </div>
        <p className="hint">El backup local se crea automáticamente antes de cada guardado en la nube.</p>
      </div>

      <div className="card settings-block">
        <h3 className="settings-block-title">Guía de inicio</h3>
        <p className="hint">Podés volver a ver la guía cuando quieras. Se muestra como una tarjeta emergente sobre la pantalla actual.</p>
        <button className="btn settings-btn" onClick={openOnboarding}>🎯 Ver guía de inicio</button>
      </div>

      <div className="card settings-block">
        <h3 className="settings-block-title">Cuenta</h3>
        <button className="btn btn-secondary" onClick={handleSignOut}>
          Cerrar sesión (Google)
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
