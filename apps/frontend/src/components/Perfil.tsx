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
}

const Perfil: React.FC<PerfilProps> = ({ appState, updateAppState }) => {
  const [perfil, setPerfil] = useState<PerfilModel>({
    nombre: '',
    peso: 70,
    altura_cm: 175,
    edad: 30,
    genero: 'masculino',
    actividad: '1.375',
    theme: 'dark'
  });
  // Local input states to avoid forcing 0 when user clears the field
  const [pesoStr, setPesoStr] = useState<string>('70');
  const [alturaStr, setAlturaStr] = useState<string>('175');
  const [edadStr, setEdadStr] = useState<string>('30');

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
      // Sync input strings with current values
      setPesoStr(String((appState.perfil.peso as number) ?? 70));
      setAlturaStr(String((appState.perfil.altura_cm as number) ?? 175));
      setEdadStr(String((appState.perfil.edad as number) ?? 30));
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
    const peso = parseFloat(pesoStr || String(perfil.peso)) || 0;
    const altura = parseFloat(alturaStr || String(perfil.altura_cm)) || 0;
    const edadNum = parseInt(edadStr || String(perfil.edad)) || 0;
    if (perfil.genero === 'masculino') {
      return 10 * peso + 6.25 * altura - 5 * edadNum + 5;
    }
    return 10 * peso + 6.25 * altura - 5 * edadNum - 161;
  };

  const calculateTDEE = () => {
    return calculateTMB() * parseFloat(perfil.actividad);
  };

  // Respaldo (exportar/importar) y selección de tema se manejan exclusivamente desde Configuración.

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
    const peso = parseFloat(pesoStr || String(perfil.peso));
    const altura = parseFloat(alturaStr || String(perfil.altura_cm));
    if (!peso || !altura) return 0;
    const alturaM = altura / 100;
    return Math.round((peso / (alturaM * alturaM)) * 10) / 10;
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
              value={pesoStr}
              onChange={(e) => {
                const val = e.target.value;
                setPesoStr(val);
                const n = parseFloat(val);
                if (!isNaN(n)) actualizarCampo('peso', n);
              }}
              className="form-input"
              min="30"
              max="200"
              step="0.1"
              placeholder="Ej: 70.5"
            />
          </div>

          <div className="form-group">
            <label htmlFor="altura">Altura (cm)</label>
            <input
              type="number"
              id="altura"
              value={alturaStr}
              onChange={(e) => {
                const val = e.target.value;
                setAlturaStr(val);
                const n = parseFloat(val);
                if (!isNaN(n)) actualizarCampo('altura_cm', n);
              }}
              className="form-input"
              min="120"
              max="220"
              placeholder="Ej: 175"
            />
          </div>

          <div className="form-group">
            <label htmlFor="edad">Edad</label>
            <input
              type="number"
              id="edad"
              value={edadStr}
              onChange={(e) => {
                const val = e.target.value;
                setEdadStr(val);
                const n = parseInt(val);
                if (!isNaN(n)) actualizarCampo('edad', n);
              }}
              className="form-input"
              min="15"
              max="100"
              placeholder="Ej: 30"
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

      {/* Gestión de datos y preferencias movidas a Configuración (única fuente) */}
    </div>
  );
};

export default Perfil;