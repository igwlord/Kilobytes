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
    mostrarAlertasMacros?: boolean;
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
}

type ThemeId = 'banana' | 'sandia' | 'uva';
const THEMES: { id: ThemeId; label: string; className: string; hint?: string }[] = [
  { id: 'banana', label: 'Banana Split', className: 'theme-banana', hint: 'Claro juguetón' },
  { id: 'sandia', label: 'Sandía Party', className: 'theme-sandia', hint: 'Claro vibrante' },
  { id: 'uva', label: 'Uva Fit', className: 'theme-uva', hint: 'Oscuro elegante' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose, appState, updateAppState, showToast, onShowOnboarding }) => {
  // Nombre ahora se edita únicamente en la pantalla Perfil
  // Map legacy 'dark'/'light' to new defaults (dark->uva, light->banana)
  const mapLegacy = (t?: string): ThemeId => (t === 'light' ? 'banana' : t === 'dark' ? 'uva' : (t as ThemeId) || 'uva');
  const [theme, setTheme] = useState<ThemeId>(mapLegacy(appState.perfil?.theme));
  const [unlockRecipes, setUnlockRecipes] = useState(!!appState.perfil?.desbloquearRecetas);
  const [muteToasts, setMuteToasts] = useState(!!appState.perfil?.silenciarNotificaciones);
  // Macro field alerts deshabilitadas globalmente: ya no se configuran desde aquí
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);

  useEffect(() => {
    if (open) {
  setTheme(mapLegacy(appState.perfil?.theme));
      setUnlockRecipes(!!appState.perfil?.desbloquearRecetas);
      setMuteToasts(!!appState.perfil?.silenciarNotificaciones);
  // no-op for macro alerts (si existiera, se ignora)
    }
  }, [open, appState.perfil?.theme, appState.perfil?.desbloquearRecetas, appState.perfil?.silenciarNotificaciones]);

  if (!open) return null;

  const applyTheme = (id: ThemeId) => {
    // Clean previous classes and apply the selected one
    document.body.classList.remove('dark', 'light', 'theme-banana', 'theme-sandia', 'theme-uva', 'theme-pastel-magenta', 'theme-pastel-green', 'theme-gold');
    const map: Record<ThemeId, string> = { banana: 'theme-banana', sandia: 'theme-sandia', uva: 'theme-uva' };
    document.body.classList.add(map[id]);
    // Maintain legacy dark-scoped rules for uva
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
    // Persist immediately
    const newState = {
      ...appState,
      perfil: { ...appState.perfil, theme: id }
    };
    updateAppState(newState);
  try { localStorage.setItem('kiloByteData', JSON.stringify(newState)); } catch { /* ignore storage errors */ }
    showToast('Tema aplicado 🎨');
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
        applyTheme(mapLegacy(newState.perfil?.theme));
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

        {/* Se elimina acceso a Perfil desde Configuración para evitar dobles modales. Accesible desde navegación/Metas. */}

        <div className="settings-section">
          <h3>Recetas y plan</h3>
          <label className="switch-row">
            <span>Desbloquear recetas de otros planes</span>
            <button
              type="button"
              role="switch"
              aria-checked={unlockRecipes}
              className={`ios-switch ${unlockRecipes ? 'on' : ''}`}
              onClick={() => setUnlockRecipes(v => !v)}
            >
              <span className="knob" />
            </button>
          </label>
          <p className="hint" style={{ marginTop: 8 }}>
            Al habilitarlo, podrás elegir cualquier receta aunque no sea parte de tu plan actual.
            Tené en cuenta los riesgos de salir del plan: podrías afectar tu progreso.
          </p>
          <div style={{ height: 10 }}></div>
          <h3>Notificaciones y alertas</h3>
          <label className="switch-row">
            <span>Silenciar notificaciones</span>
            <button
              type="button"
              role="switch"
              aria-checked={muteToasts}
              className={`ios-switch ${muteToasts ? 'on' : ''}`}
              onClick={() => setMuteToasts(v => !v)}
            >
              <span className="knob" />
            </button>
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
