import React, { useState, useEffect } from 'react';
import './Metas.css';
import type { AppState, Metas as MetasState } from '../interfaces/AppState';

type CustomMetas = Required<Pick<MetasState, 'agua_ml' | 'pasos_dia' | 'ejercicio_min' | 'comidas_saludables'>>;

interface MetasProps {
  appState: AppState;
  updateAppState: (newState: AppState) => void;
  showToast: (message: string) => void;
}

const Metas: React.FC<MetasProps> = ({ appState, updateAppState, showToast }) => {
  const [pesoObjetivo, setPesoObjetivo] = useState<number>(appState.metas.peso_objetivo ?? 65);
  const [metasPersonalizadas, setMetasPersonalizadas] = useState<CustomMetas>({
    agua_ml: appState.metas.agua_ml ?? 2000,
    pasos_dia: appState.metas.pasos_dia ?? 8000,
    ejercicio_min: appState.metas.ejercicio_min ?? 30,
    comidas_saludables: appState.metas.comidas_saludables ?? 5,
  });

  useEffect(() => {
    setPesoObjetivo(appState.metas.peso_objetivo ?? 65);
    setMetasPersonalizadas({
      agua_ml: appState.metas.agua_ml ?? 2000,
      pasos_dia: appState.metas.pasos_dia ?? 8000,
      ejercicio_min: appState.metas.ejercicio_min ?? 30,
      comidas_saludables: appState.metas.comidas_saludables ?? 5,
    });
  }, [appState.metas]);

  const calcularProgresosPeso = () => {
    const pesoActual = appState.perfil.peso || 70;
    const pesoInicial = appState.perfil.peso_inicial || pesoActual + 5; // Simulamos peso inicial
    
    if (pesoInicial === pesoObjetivo) return 100;
    
    const progresoTotal = pesoInicial - pesoObjetivo;
    const progresoActual = pesoInicial - pesoActual;
    
    return Math.max(0, Math.min(100, (progresoActual / progresoTotal) * 100));
  };

  const actualizarPesoObjetivo = (nuevoPeso: number) => {
    setPesoObjetivo(nuevoPeso);
    
    const newState: AppState = {
      ...appState,
      metas: {
        ...appState.metas,
        peso_objetivo: nuevoPeso
      }
    };
    
    console.log('[metas] Actualizando peso objetivo:', nuevoPeso);
    updateAppState(newState);
    showToast('Meta de peso actualizada ✅');
  };

  const actualizarMetaPersonalizada = (
    campo: keyof typeof metasPersonalizadas,
    valor: number
  ) => {
    const nuevasMetas = { ...metasPersonalizadas, [campo]: valor };
    setMetasPersonalizadas(nuevasMetas);
    
    const newState: AppState = {
      ...appState,
      metas: {
        ...appState.metas,
        ...nuevasMetas
      }
    };
    
    console.log('[metas] Actualizando meta personalizada:', campo, valor);
    updateAppState(newState);
    showToast('Meta actualizada ✅');
  };

  const progresoPeso = calcularProgresosPeso();
  const pesoActual = appState.perfil?.peso || 70;
  const pesoInicial = appState.perfil?.peso_inicial || pesoActual + 5;
  const diferenciaPeso = pesoActual - pesoObjetivo;
  
  // Simulamos progreso de otras metas (en una app real vendría de tracking)
  const progresoMetas = {
    agua: 75, // 1.5L de 2L
    pasos: 65, // 3900 de 6000
    ejercicio: 80, // 24 min de 30
    comidas: 60  // 3 de 5
  };

  const obtenerMensajeMotivacional = () => {
    if (progresoPeso >= 80) return "¡Estás muy cerca de tu meta! 🎉";
    if (progresoPeso >= 60) return "¡Vas por buen camino! 💪";
    if (progresoPeso >= 40) return "Mantén el ritmo, estás progresando 📈";
    if (progresoPeso >= 20) return "Cada día cuenta, ¡sigue adelante! 🌟";
    return "¡Comenzaste el viaje hacia tu meta! 🚀";
  };

  return (
    <div className="metas-container">
      <h1 className="metas-title">Mis Metas</h1>
      
      {/* Meta principal de peso */}
      <div className="metas-card">
        <div className="meta-principal">
          <div className="meta-header">
            <h2 className="meta-title">
              Bajar a <span className="peso-objetivo">{pesoObjetivo} kg</span>
            </h2>
            <input
              type="range"
              min="50"
              max="100"
              value={pesoObjetivo}
              onChange={(e) => actualizarPesoObjetivo(parseInt(e.target.value))}
              className="peso-slider"
            />
          </div>
          
          <div className="progreso-principal">
            <div className="barra-progreso">
              <div 
                className="progreso-fill"
                style={{ width: `${progresoPeso}%` }}
              ></div>
            </div>
            <p className="progreso-porcentaje">{Math.round(progresoPeso)}%</p>
          </div>

          <div className="stats-peso">
            <div className="stat-peso">
              <span className="stat-label">Peso inicial</span>
              <span className="stat-value">{pesoInicial} kg</span>
            </div>
            <div className="stat-peso">
              <span className="stat-label">Peso actual</span>
              <span className="stat-value primary">{pesoActual} kg</span>
            </div>
            <div className="stat-peso">
              <span className="stat-label">Por bajar</span>
              <span className={`stat-value ${diferenciaPeso > 0 ? 'warning' : 'success'}`}>
                {diferenciaPeso > 0 ? `${Math.round(diferenciaPeso * 10) / 10} kg` : '¡Meta alcanzada!'}
              </span>
            </div>
          </div>

          <div className="mensaje-motivacional">
            <p>{obtenerMensajeMotivacional()}</p>
          </div>
        </div>
      </div>

      {/* Metas diarias */}
      <div className="metas-card">
        <h2 className="card-title">Metas Diarias</h2>
        
        <div className="metas-diarias">
          <div className="meta-item">
            <div className="meta-info">
              <div className="meta-icon">💧</div>
              <div className="meta-details">
                <h3>Hidratación</h3>
                <p>{metasPersonalizadas.agua_ml / 1000}L por día</p>
                <input
                  type="range"
                  min="1500"
                  max="4000"
                  step="250"
                  value={metasPersonalizadas.agua_ml}
                  onChange={(e) => actualizarMetaPersonalizada('agua_ml', parseInt(e.target.value))}
                  className="meta-slider"
                />
              </div>
            </div>
            <div className="meta-progreso">
              <div className="mini-progreso">
                <div 
                  className="mini-fill agua"
                  style={{ width: `${progresoMetas.agua}%` }}
                ></div>
              </div>
              <span className="progreso-text">{progresoMetas.agua}%</span>
            </div>
          </div>

          <div className="meta-item">
            <div className="meta-info">
              <div className="meta-icon">👟</div>
              <div className="meta-details">
                <h3>Pasos diarios</h3>
                <p>{metasPersonalizadas.pasos_dia.toLocaleString()} pasos</p>
                <input
                  type="range"
                  min="5000"
                  max="15000"
                  step="500"
                  value={metasPersonalizadas.pasos_dia}
                  onChange={(e) => actualizarMetaPersonalizada('pasos_dia', parseInt(e.target.value))}
                  className="meta-slider"
                />
              </div>
            </div>
            <div className="meta-progreso">
              <div className="mini-progreso">
                <div 
                  className="mini-fill pasos"
                  style={{ width: `${progresoMetas.pasos}%` }}
                ></div>
              </div>
              <span className="progreso-text">{progresoMetas.pasos}%</span>
            </div>
          </div>

          <div className="meta-item">
            <div className="meta-info">
              <div className="meta-icon">🏃‍♂️</div>
              <div className="meta-details">
                <h3>Ejercicio</h3>
                <p>{metasPersonalizadas.ejercicio_min} minutos</p>
                <input
                  type="range"
                  min="15"
                  max="90"
                  step="5"
                  value={metasPersonalizadas.ejercicio_min}
                  onChange={(e) => actualizarMetaPersonalizada('ejercicio_min', parseInt(e.target.value))}
                  className="meta-slider"
                />
              </div>
            </div>
            <div className="meta-progreso">
              <div className="mini-progreso">
                <div 
                  className="mini-fill ejercicio"
                  style={{ width: `${progresoMetas.ejercicio}%` }}
                ></div>
              </div>
              <span className="progreso-text">{progresoMetas.ejercicio}%</span>
            </div>
          </div>

          <div className="meta-item">
            <div className="meta-info">
              <div className="meta-icon">🥗</div>
              <div className="meta-details">
                <h3>Comidas saludables</h3>
                <p>{metasPersonalizadas.comidas_saludables} comidas</p>
                <input
                  type="range"
                  min="3"
                  max="7"
                  step="1"
                  value={metasPersonalizadas.comidas_saludables}
                  onChange={(e) => actualizarMetaPersonalizada('comidas_saludables', parseInt(e.target.value))}
                  className="meta-slider"
                />
              </div>
            </div>
            <div className="meta-progreso">
              <div className="mini-progreso">
                <div 
                  className="mini-fill comidas"
                  style={{ width: `${progresoMetas.comidas}%` }}
                ></div>
              </div>
              <span className="progreso-text">{progresoMetas.comidas}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen semanal */}
      <div className="metas-card">
        <h2 className="card-title">Resumen Semanal</h2>
        
        <div className="resumen-semanal">
          <div className="resumen-stat">
            <div className="resumen-icon success">✅</div>
            <div className="resumen-info">
              <h3>Metas completadas</h3>
              <p className="resumen-numero">23/28</p>
              <span className="resumen-porcentaje">82%</span>
            </div>
          </div>
          
          <div className="resumen-stat">
            <div className="resumen-icon warning">⚡</div>
            <div className="resumen-info">
              <h3>Área de mejora</h3>
              <p className="resumen-texto">Hidratación</p>
              <span className="resumen-consejo">Lleva una botella siempre contigo</span>
            </div>
          </div>
          
          <div className="resumen-stat">
            <div className="resumen-icon primary">🏆</div>
            <div className="resumen-info">
              <h3>Mejor día</h3>
              <p className="resumen-texto">Miércoles</p>
              <span className="resumen-consejo">¡4 de 4 metas completadas!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metas;