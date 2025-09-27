import React, { useState, useEffect } from 'react';
import './Perfil.css';

type PerfilModel = {
  nombre: string;
  peso: number;
  altura_cm: number;
  edad: number;
  genero: 'masculino' | 'femenino';
  actividad: string; // factor as string e.g. "1.375"
  theme: 'dark' | 'light' | string;
};
// Accept a broader app state shape coming from Dashboard (actividad can be number or string)
type PerfilInput = {
  nombre?: string;
  peso?: number;
  altura_cm?: number;
  edad?: number;
  genero?: 'masculino' | 'femenino';
  actividad?: number | string;
  theme?: 'dark' | 'light' | string;
};
type AppStateLite = { perfil?: PerfilInput; metas?: unknown; log?: unknown };

interface PerfilProps {
  appState: AppStateLite;
  updateAppState: (newState: unknown) => void;
  showToast: (message: string) => void;
}

const Perfil: React.FC<PerfilProps> = ({ appState, updateAppState, showToast }) => {
  const [perfil, setPerfil] = useState<PerfilModel>({
    nombre: '',
    peso: 70,
    altura_cm: 175,
    edad: 30,
    genero: 'masculino',
    actividad: '1.375',
    theme: 'dark'
  });

  useEffect(() => {
    if (appState.perfil) {
      const actividad = appState.perfil.actividad;
      const actividadStr = typeof actividad === 'number' ? String(actividad) : (actividad || '1.375');
      setPerfil({
        nombre: appState.perfil.nombre ?? '',
        peso: (appState.perfil.peso as number) ?? 70,
        altura_cm: (appState.perfil.altura_cm as number) ?? 175,
        edad: (appState.perfil.edad as number) ?? 30,
        genero: (appState.perfil.genero as 'masculino' | 'femenino') ?? 'masculino',
        actividad: actividadStr,
        theme: (appState.perfil.theme as string) ?? 'dark'
      });
    }
  }, [appState.perfil]);

  const actualizarCampo = (campo: keyof PerfilModel, valor: PerfilModel[keyof PerfilModel]) => {
    const nuevoPerfil = { ...perfil, [campo]: valor };
    setPerfil(nuevoPerfil);
    
    const newState = {
      ...appState,
      perfil: nuevoPerfil
    };
    
    updateAppState(newState);
  };

  const calculateTMB = () => {
    if (perfil.genero === 'masculino') {
      return 10 * perfil.peso + 6.25 * perfil.altura_cm - 5 * perfil.edad + 5;
    }
    return 10 * perfil.peso + 6.25 * perfil.altura_cm - 5 * perfil.edad - 161;
  };

  const calculateTDEE = () => {
    return calculateTMB() * parseFloat(perfil.actividad);
  };

  const cambiarTema = (nuevoTema: string) => {
    actualizarCampo('theme', nuevoTema);
    const isDark = nuevoTema === 'dark';
    document.body.classList.toggle('dark', isDark);
    document.body.classList.toggle('light', !isDark);
    // Persist also immediately
    const saved = localStorage.getItem('kiloByteData');
    try {
      const state = saved ? JSON.parse(saved) : { perfil: {}, metas: {}, log: {} };
      state.perfil = { ...(state.perfil || {}), theme: nuevoTema };
      localStorage.setItem('kiloByteData', JSON.stringify(state));
    } catch (err) {
      // Fallback: ignore persistence errors silently in non-supported environments
      void err;
    }
    showToast(`Tema cambiado a ${isDark ? 'oscuro' : 'claro'} ✨`);
  };

  const exportarDatos = () => {
    const dataStr = JSON.stringify(appState, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `kilobyte_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    showToast('Datos exportados correctamente ✅');
  };

  const importarDatos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedState = JSON.parse(e.target?.result as string);
        if (importedState.perfil && importedState.metas) {
          updateAppState(importedState);
          setPerfil(importedState.perfil);
          showToast('Datos importados correctamente ✅');
        } else {
          throw new Error('Formato de archivo no válido.');
        }
      } catch (error) {
        alert('Error al importar el archivo: ' + (error as Error).message);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const tmb = Math.round(calculateTMB());
  const tdee = Math.round(calculateTDEE());

  const getNivelActividad = (valor: string) => {
    switch (valor) {
      case '1.2': return 'Sedentario';
      case '1.375': return 'Ligero';
      case '1.55': return 'Moderado';
      case '1.725': return 'Alto';
      default: return 'Moderado';
    }
  };

  const getIMC = () => {
    const alturaM = perfil.altura_cm / 100;
    return Math.round((perfil.peso / (alturaM * alturaM)) * 10) / 10;
  };

  const getCategoriaIMC = (imc: number) => {
    if (imc < 18.5) return { categoria: 'Bajo peso', color: 'warning' };
    if (imc < 25) return { categoria: 'Normal', color: 'success' };
    if (imc < 30) return { categoria: 'Sobrepeso', color: 'warning' };
    return { categoria: 'Obesidad', color: 'error' };
  };

  const imc = getIMC();
  const categoriaIMC = getCategoriaIMC(imc);

  return (
    <div className="perfil-container">
      <h1 className="perfil-title">Mi Perfil</h1>
      
      {/* Información personal */}
      <div className="perfil-card">
        <h2 className="card-title">Información Personal</h2>
        
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              value={perfil.nombre}
              onChange={(e) => actualizarCampo('nombre', e.target.value)}
              className="form-input"
              placeholder="Tu nombre"
              title="Tu nombre"
            />
          </div>

          <div className="form-group">
            <label htmlFor="peso">Peso (kg)</label>
            <input
              type="number"
              id="peso"
              value={perfil.peso}
              onChange={(e) => actualizarCampo('peso', parseFloat(e.target.value) || 0)}
              className="form-input"
              min="30"
              max="200"
              step="0.1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="altura">Altura (cm)</label>
            <input
              type="number"
              id="altura"
              value={perfil.altura_cm}
              onChange={(e) => actualizarCampo('altura_cm', parseFloat(e.target.value) || 0)}
              className="form-input"
              min="120"
              max="220"
            />
          </div>

          <div className="form-group">
            <label htmlFor="edad">Edad</label>
            <input
              type="number"
              id="edad"
              value={perfil.edad}
              onChange={(e) => actualizarCampo('edad', parseInt(e.target.value) || 0)}
              className="form-input"
              min="15"
              max="100"
            />
          </div>

          <div className="form-group">
            <label htmlFor="genero">Género</label>
            <select
              id="genero"
              value={perfil.genero}
              onChange={(e) => actualizarCampo('genero', e.target.value)}
              className="form-select"
            >
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="actividad">Nivel de actividad</label>
            <select
              id="actividad"
              value={perfil.actividad}
              onChange={(e) => actualizarCampo('actividad', e.target.value)}
              className="form-select"
            >
              <option value="1.2">Sedentario</option>
              <option value="1.375">Ligero</option>
              <option value="1.55">Moderado</option>
              <option value="1.725">Alto</option>
            </select>
          </div>
        </div>
      </div>

      {/* Métricas calculadas */}
      <div className="perfil-card">
        <h2 className="card-title">Métricas Calculadas</h2>
        
        <div className="metricas-grid">
          <div className="metrica-item">
            <div className="metrica-icon">📊</div>
            <div className="metrica-info">
              <h3>IMC</h3>
              <p className="metrica-valor">{imc}</p>
              <span className={`metrica-categoria ${categoriaIMC.color}`}>
                {categoriaIMC.categoria}
              </span>
            </div>
          </div>

          <div className="metrica-item">
            <div className="metrica-icon">🔥</div>
            <div className="metrica-info">
              <h3>TMB</h3>
              <p className="metrica-valor">{tmb} kcal</p>
              <span className="metrica-descripcion">Metabolismo basal</span>
            </div>
          </div>

          <div className="metrica-item">
            <div className="metrica-icon">⚡</div>
            <div className="metrica-info">
              <h3>TDEE</h3>
              <p className="metrica-valor">{tdee} kcal</p>
              <span className="metrica-descripcion">Gasto energético total</span>
            </div>
          </div>

          <div className="metrica-item">
            <div className="metrica-icon">🏃‍♂️</div>
            <div className="metrica-info">
              <h3>Actividad</h3>
              <p className="metrica-valor">{perfil.actividad}x</p>
              <span className="metrica-descripcion">{getNivelActividad(perfil.actividad)}</span>
            </div>
          </div>
        </div>

        <div className="metricas-info">
          <p><strong>TMB:</strong> Calorías que tu cuerpo necesita en reposo absoluto</p>
          <p><strong>TDEE:</strong> Calorías totales que quemas incluyendo actividad física</p>
          <p><strong>IMC:</strong> Índice de masa corporal basado en peso y altura</p>
        </div>
      </div>

      {/* Preferencias */}
      <div className="perfil-card">
        <h2 className="card-title">Preferencias</h2>
        
        <div className="preferencias-section">
          <div className="preferencia-item">
            <span className="preferencia-label">Tema de la App</span>
            <div className="theme-toggle">
              <button
                className={`theme-btn ${perfil.theme === 'light' ? 'active' : ''}`}
                onClick={() => cambiarTema('light')}
              >
                ☀️
              </button>
              <button
                className={`theme-btn ${perfil.theme === 'dark' ? 'active' : ''}`}
                onClick={() => cambiarTema('dark')}
              >
                🌙
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gestión de datos */}
      <div className="perfil-card">
        <h2 className="card-title">Gestión de Datos</h2>
        
        <div className="datos-section">
          <p className="datos-descripcion">
            Exporta tu información para crear una copia de respaldo o importa datos desde un archivo previo.
          </p>
          
          <div className="datos-buttons">
            <button
              onClick={exportarDatos}
              className="btn-datos export"
            >
              📤 Exportar JSON
            </button>
            
            <label htmlFor="import-file" className="btn-datos import">
              📥 Importar JSON
            </label>
            <input
              type="file"
              id="import-file"
              accept=".json"
              onChange={importarDatos}
              style={{ display: 'none' }}
            />
          </div>

          <div className="datos-warning">
            <p>⚠️ Importar datos sobrescribirá toda tu información actual. Asegúrate de exportar una copia de respaldo antes.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;