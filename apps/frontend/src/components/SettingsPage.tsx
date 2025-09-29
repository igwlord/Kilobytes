import React, { useEffect, useState } from 'react';
import './SettingsModal.css';
import './SettingsPage.css';
import { signOutUser, useAuth } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { saveUserState } from '../utils/cloudSync';
import type { AppState } from '../interfaces/AppState';

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
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);

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

  const exportData = () => {
    if (busy) return;
    setBusy('export');
    const dt = new Date();
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    const hh = String(dt.getHours()).padStart(2, '0');
    const mi = String(dt.getMinutes()).padStart(2, '0');
    const ss = String(dt.getSeconds()).padStart(2, '0');
    const dayName = dt.toLocaleDateString('es-AR', { weekday: 'long' });
    const user = (appState.perfil?.nombre || 'Usuario').replace(/\s+/g, '_');

    const payload = { app: 'KiloByte', exportedAt: dt.toISOString(), exportedDayName: dayName, exportedBy: appState.perfil?.nombre || 'Usuario', data: appState };
    const dataStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kilobyte_backup_${user}_${yyyy}-${mm}-${dd}_${hh}-${mi}-${ss}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Backup exportado ✅');
    setBusy(null);
  };

  const onImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy('import');
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(String(ev.target?.result || '{}'));
        const imported = raw?.data ? raw.data : raw;
        const newState = imported as AppState;
        if (!newState?.perfil || !newState?.metas || !newState?.log) throw new Error('Formato inválido');
        updateAppState(newState);
        localStorage.setItem('kiloByteData', JSON.stringify(newState));
        applyTheme(mapLegacy(newState.perfil?.theme));
        // Try cloud save for import, but don't block UI
        if (user) {
          saveUserState(user.uid, newState).catch(e => console.warn('[settings] import cloud save failed, localStorage OK', e));
        }
        showToast('Datos importados ✅');
      } catch (err) {
        console.error(err);
        showToast('Error al importar datos ❌');
      } finally {
        setBusy(null);
      }
    };
    reader.readAsText(file);
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
        <h3 className="settings-block-title">Respaldo de datos</h3>
        <div className="backup-row">
          <button className="btn btn-primary" onClick={exportData} disabled={busy === 'export'}>
            {busy === 'export' ? 'Guardando…' : '💾 Guardar datos'}
          </button>
          <label className="btn btn-secondary" htmlFor="import-json" style={{ cursor: 'pointer' }}>
            {busy === 'import' ? 'Cargando…' : '📥 Cargar datos'}
          </label>
          <input id="import-json" type="file" accept="application/json" onChange={onImportFile} style={{ display: 'none' }} />
        </div>
        <p className="hint">El archivo incluye fecha y hora en el nombre.</p>
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
