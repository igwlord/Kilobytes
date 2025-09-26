import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

const Welcome: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [animationComplete, setAnimationComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si el usuario ya ingresó su nombre
    const savedData = localStorage.getItem('kiloByteData');
    if (savedData) {
      const data = JSON.parse(savedData);
      if (data.perfil?.nombre) {
        navigate('/dashboard');
        return;
      }
    }

    // Completar la animación después de 4 segundos
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 4000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  const validarNombre = (nombre: string) => {
    return nombre.length >= 2 && nombre.length <= 20 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre);
  };

  const handleEnterApp = () => {
    const nombreTrimmed = nombre.trim();
    
    if (!nombreTrimmed) {
      setError('¡Por favor, ingresa tu nombre!');
      return;
    }

    if (!validarNombre(nombreTrimmed)) {
      setError('Tu nombre debe tener 2-20 caracteres y solo letras');
      return;
    }

    setError('');

    // Guardar nombre y datos iniciales
    const data = {
      perfil: { 
        nombre: nombreTrimmed, 
        peso: 70, 
        altura_cm: 175, 
        edad: 30, 
        genero: "masculino", 
        actividad: "1.375", 
        exclusiones: [], 
        objetivo: "mantener", 
        theme: 'dark' 
      },
      metas: { 
        peso_objetivo: 65, 
        kcal: 2000, 
        prote_g_dia: 140, 
        grasa_g_dia: 60, 
        carbs_g_dia: 225, 
        agua_ml: 2000, 
        pasos_dia: 8000 
      },
      log: {}
    };

    localStorage.setItem('kiloByteData', JSON.stringify(data));
    navigate('/dashboard');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEnterApp();
    }
  };

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1 className={`typewriter-title ${animationComplete ? 'complete' : ''}`}>
          KiloByte
        </h1>
        <p className="subtitle">Tu compañero inteligente para el seguimiento nutricional</p>
        
        <div className="input-group">
          <input 
            type="text" 
            placeholder="Ingresa tu nombre..." 
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              setError('');
            }}
            onKeyPress={handleKeyPress}
            className="name-input"
          />
          {error && <p className="error-message">{error}</p>}
        </div>
        
        <button 
          onClick={handleEnterApp}
          className="start-button"
        >
          Comenzar mi viaje nutricional
        </button>
      </div>
    </div>
  );
};

export default Welcome;