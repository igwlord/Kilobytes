import React, { useEffect, useState } from 'react';
import './SettingsModal.css';
import Spinner from './Spinner';

type Totals = { kcal: number; prot: number; carbs: number; grasa: number };
type DayLogMin = { totals?: Totals; sueno_h?: number; ayuno_h?: number; agua_ml_consumida?: number };
type Goals = {
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
};
interface AppStateLike {
  perfil: {
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
  };
  metas: Goals;
  log: Record<string, DayLogMin>;
}

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  appState: AppStateLike;
  updateAppState: (newState: unknown) => void;
  showToast: (message: string) => void;
  onShowOnboarding?: () => void;
  onGoToPerfil?: () => void;
}

const THEMES = [
  { id: 'dark', label: 'Oscuro', className: 'dark' },
  { id: 'light', label: 'Claro', className: 'light' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose, appState, updateAppState, showToast, onShowOnboarding, onGoToPerfil }) => {
  // Nombre ahora se edita únicamente en la pantalla Perfil
  const [theme, setTheme] = useState(appState.perfil?.theme || 'dark');
  const [unlockRecipes, setUnlockRecipes] = useState(!!appState.perfil?.desbloquearRecetas);
  const [muteToasts, setMuteToasts] = useState(!!appState.perfil?.silenciarNotificaciones);
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);

  useEffect(() => {
    if (open) {
      setTheme(appState.perfil?.theme || 'dark');
      setUnlockRecipes(!!appState.perfil?.desbloquearRecetas);
      setMuteToasts(!!appState.perfil?.silenciarNotificaciones);
    }
  }, [open, appState.perfil?.theme, appState.perfil?.desbloquearRecetas, appState.perfil?.silenciarNotificaciones]);

  if (!open) return null;

  const applyTheme = (id: string) => {
    // Remove all known theme classes (cleanup), then apply only dark/light
    document.body.classList.remove('dark', 'light', 'theme-pastel-magenta', 'theme-pastel-green', 'theme-gold');
    if (id === 'light') document.body.classList.add('light');
    else document.body.classList.add('dark');
  };

  const handleSaveProfile = () => {
    const newState = {
      ...appState,
      // Solo guardamos preferencias, el nombre se edita en Perfil
      perfil: { ...appState.perfil, theme, desbloquearRecetas: unlockRecipes, silenciarNotificaciones: muteToasts }
    };
    updateAppState(newState);
    applyTheme(theme);
    localStorage.setItem('kiloByteData', JSON.stringify(newState));
    showToast('Configuración guardada ✅');
    onClose();
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

    const payload = {
      app: 'KiloByte',
      exportedAt: dt.toISOString(),
      exportedDayName: dayName,
      exportedBy: appState.perfil?.nombre || 'Usuario',
      data: appState,
    };
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
        const imported = raw?.data ? raw.data : raw; // accept wrapped or plain
        const newState = imported as AppStateLike;
        if (!newState?.perfil || !newState?.metas || !newState?.log) throw new Error('Formato inválido');
        updateAppState(newState);
        localStorage.setItem('kiloByteData', JSON.stringify(newState));
        applyTheme(newState.perfil?.theme || 'dark');
        showToast('Datos importados ✅');
        onClose();
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
    try {
      localStorage.removeItem('kiloByteOnboardingSeen');
    } catch {
      // ignore storage errors (private mode / quotas)
    }
    onShowOnboarding?.();
    showToast('Guía de inicio abierta ✅');
    onClose();
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Configuración</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="settings-section">
          <h3>Tema</h3>
          <div className="theme-grid">
            {THEMES.map(t => (
              <label key={t.id} className={`theme-option ${theme === t.id ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="theme"
                  value={t.id}
                  checked={theme === t.id}
                  onChange={() => setTheme(t.id)}
                />
                <span className={`swatch ${t.className}`}></span>
                <span className="theme-label">{t.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <h3>Perfil</h3>
          <p className="hint">Para editar tu información personal, abrí la pantalla de Perfil.</p>
          <button className="btn btn-secondary" onClick={() => { onGoToPerfil?.(); }}>Abrir Perfil</button>
        </div>

        <div className="settings-section">
          <h3>Recetas y plan</h3>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={unlockRecipes}
              onChange={(e) => setUnlockRecipes(e.target.checked)}
            />
            <span>Desbloquear recetas de otros planes</span>
          </label>
          <p className="hint" style={{ marginTop: 8 }}>
            Al habilitarlo, podrás elegir cualquier receta aunque no sea parte de tu plan actual.
            Tené en cuenta los riesgos de salir del plan: podrías afectar tu progreso.
          </p>
          <div style={{ height: 10 }}></div>
          <h3>Notificaciones</h3>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={muteToasts}
              onChange={(e) => setMuteToasts(e.target.checked)}
            />
            <span>Silenciar notificaciones</span>
          </label>
        </div>

        <div className="settings-section">
          <h3>Respaldo de datos</h3>
          <div className="backup-row">
            <button className="btn btn-danger" onClick={exportData} disabled={!!busy}>
              {busy === 'export' ? <Spinner tight label="Guardando…" /> : '📤 Guardar datos'}
            </button>
            <label className={`btn btn-success ${busy ? 'disabled' : ''}`} htmlFor="import-json" style={{ pointerEvents: busy ? 'none' : undefined }}>
              {busy === 'import' ? <Spinner tight label="Cargando…" /> : '📥 Cargar datos'}
            </label>
            <input id="import-json" type="file" accept="application/json" onChange={onImportFile} style={{ display: 'none' }} />
          </div>
          <p className="hint">El archivo incluye fecha y hora en el nombre.</p>
        </div>

        <div className="settings-section">
          <h3>Guía de inicio</h3>
          <p className="hint">Podés volver a ver la guía de dos pasos cuando quieras.</p>
          <button className="btn settings-btn" onClick={openOnboarding}>🎯 Ver guía de inicio</button>
        </div>

        <div className="settings-footer">
          <button className="btn ghost" onClick={onClose}>Cancelar</button>
          <button className="btn settings-btn primary" onClick={handleSaveProfile}>Guardar cambios</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
