import React, { useState, useEffect } from 'react';
import './Plan.css';

interface PlanProps {
  appState: any;
  updateAppState: (newState: any) => void;
  showToast: (message: string) => void;
}

const Plan: React.FC<PlanProps> = ({ appState, updateAppState, showToast }) => {
  const [objetivo, setObjetivo] = useState('mantener');
  const [kcalObjetivo, setKcalObjetivo] = useState(1500);
  const [proteObjetivo, setProteObjetivo] = useState(110);
  const [grasaObjetivo, setGrasaObjetivo] = useState(50);
  const [carbsObjetivo, setCarbsObjetivo] = useState(150);
  const [exclusiones, setExclusiones] = useState<string[]>([]);

  useEffect(() => {
    if (appState.perfil && appState.metas) {
      setObjetivo(appState.perfil.objetivo || 'mantener');
      setKcalObjetivo(Math.round(appState.metas.kcal || 1500));
      setProteObjetivo(Math.round(appState.metas.prote_g_dia || 110));
      setGrasaObjetivo(Math.round(appState.metas.grasa_g_dia || 50));
      setCarbsObjetivo(Math.round(appState.metas.carbs_g_dia || 150));
      setExclusiones(appState.perfil.exclusiones || []);
    }
  }, [appState]);

  const calculateTMB = () => {
    const p = appState.perfil;
    if (!p) return 1500;
    if (p.genero === 'masculino') {
      return 10 * p.peso + 6.25 * p.altura_cm - 5 * p.edad + 5;
    }
    return 10 * p.peso + 6.25 * p.altura_cm - 5 * p.edad - 161;
  };

  const calculateTDEE = () => {
    return calculateTMB() * (appState.perfil?.actividad || 1.375);
  };

  const calculateAndSetMacros = () => {
    const tdee = calculateTDEE();
    let kcal = tdee;
    
    if (objetivo === 'bajar') kcal -= 450;
    if (objetivo === 'subir') kcal += 300;

    const peso = appState.perfil?.peso || 70;
    const prote_g = peso * 1.8;
    const grasa_g = peso * 0.9;
    const carbs_g = (kcal - (prote_g * 4) - (grasa_g * 9)) / 4;

    const newState = {
      ...appState,
      perfil: {
        ...appState.perfil,
        objetivo: objetivo
      },
      metas: {
        ...appState.metas,
        kcal,
        prote_g_dia: prote_g,
        grasa_g_dia: grasa_g,
        carbs_g_dia: carbs_g
      }
    };

    updateAppState(newState);
    setKcalObjetivo(Math.round(kcal));
    setProteObjetivo(Math.round(prote_g));
    setGrasaObjetivo(Math.round(grasa_g));
    setCarbsObjetivo(Math.round(carbs_g));
    showToast('Plan actualizado ✨');
  };

  const updateMacrosManually = (field: string, value: number) => {
    const newMetas = { ...appState.metas };
    
    switch (field) {
      case 'kcal':
        newMetas.kcal = value;
        setKcalObjetivo(value);
        break;
      case 'prote':
        newMetas.prote_g_dia = value;
        setProteObjetivo(value);
        break;
      case 'grasa':
        newMetas.grasa_g_dia = value;
        setGrasaObjetivo(value);
        break;
      case 'carbs':
        newMetas.carbs_g_dia = value;
        setCarbsObjetivo(value);
        break;
    }

    updateAppState({
      ...appState,
      metas: newMetas
    });
  };

  const toggleExclusion = (exclusion: string) => {
    const newExclusiones = exclusiones.includes(exclusion)
      ? exclusiones.filter(e => e !== exclusion)
      : [...exclusiones, exclusion];

    setExclusiones(newExclusiones);
    
    const newState = {
      ...appState,
      perfil: {
        ...appState.perfil,
        exclusiones: newExclusiones
      }
    };
    
    updateAppState(newState);
    showToast('Preferencias guardadas ✅');
  };

  const applyPlan = () => {
    showToast('Plan guardado y aplicado ✨');
  };

  return (
    <div className="plan-container">
      <h1 className="plan-title">Mi Plan Nutricional</h1>
      <div className="plan-card">
        <div className="plan-section">
          <label htmlFor="objetivo" className="plan-label">Mi objetivo principal</label>
          <select 
            id="objetivo" 
            className="plan-select"
            value={objetivo}
            onChange={(e) => setObjetivo(e.target.value)}
          >
            <option value="bajar">Bajar peso</option>
            <option value="mantener">Mantener peso</option>
            <option value="subir">Subir peso</option>
          </select>
        </div>

        <div className="plan-section">
          <h3 className="plan-subsection-title">Objetivos diarios</h3>
          <div className="plan-macros-grid">
            <div>
              <label htmlFor="kcal-objetivo" className="plan-input-label">Calorías (kcal)</label>
              <input 
                type="number" 
                id="kcal-objetivo" 
                value={kcalObjetivo} 
                onChange={(e) => updateMacrosManually('kcal', parseInt(e.target.value))}
                className="plan-input"
              />
            </div>
            <div>
              <label htmlFor="prote-objetivo" className="plan-input-label">Proteínas (g)</label>
              <input 
                type="number" 
                id="prote-objetivo" 
                value={proteObjetivo} 
                onChange={(e) => updateMacrosManually('prote', parseInt(e.target.value))}
                className="plan-input"
              />
            </div>
            <div>
              <label htmlFor="grasa-objetivo" className="plan-input-label">Grasas (g)</label>
              <input 
                type="number" 
                id="grasa-objetivo" 
                value={grasaObjetivo} 
                onChange={(e) => updateMacrosManually('grasa', parseInt(e.target.value))}
                className="plan-input"
              />
            </div>
            <div>
              <label htmlFor="carbs-objetivo" className="plan-input-label">Carbs (g)</label>
              <input 
                type="number" 
                id="carbs-objetivo" 
                value={carbsObjetivo} 
                onChange={(e) => updateMacrosManually('carbs', parseInt(e.target.value))}
                className="plan-input"
              />
            </div>
          </div>
          <button 
            onClick={calculateAndSetMacros}
            className="plan-calculate-btn"
          >
            Calcular automáticamente
          </button>
        </div>

        <div className="plan-section">
          <h3 className="plan-subsection-title">Exclusiones alimentarias</h3>
          <div className="plan-exclusions">
            {[
              { key: 'pescado', label: 'Sin pescado' },
              { key: 'yogur', label: 'Sin yogur' },
              { key: 'tacc', label: 'Sin TACC' },
              { key: 'vegetariano', label: 'Vegetariano' }
            ].map(exclusion => (
              <label key={exclusion.key} className="plan-exclusion-item">
                <input 
                  type="checkbox" 
                  checked={exclusiones.includes(exclusion.key)}
                  onChange={() => toggleExclusion(exclusion.key)}
                  className="plan-checkbox"
                />
                <span>{exclusion.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button 
          onClick={applyPlan}
          className="plan-apply-btn"
        >
          Aplicar a la semana
        </button>
      </div>
    </div>
  );
};

export default Plan;