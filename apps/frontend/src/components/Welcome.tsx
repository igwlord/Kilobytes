import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';
import Spinner from './Spinner';
import { signInWithGoogle, useAuth } from '../utils/auth';
import { loadUserState, saveUserState } from '../utils/cloudSync';

const Welcome: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [animationComplete, setAnimationComplete] = useState(false);
  const [typedSlogan, setTypedSlogan] = useState('');
  const [sloganCaretVisible, setSloganCaretVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const typingTimerRef = useRef<number | null>(null);
  const caretTimerRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Si hay sesión, intentar cargar y navegar a dashboard
    if (user) {
      (async () => {
        try {
          const cloud = await loadUserState(user.uid);
          if (cloud) {
            localStorage.setItem('kiloByteData', JSON.stringify(cloud));
          }
        } finally {
          navigate('/dashboard');
        }
      })();
      return;
    } else {
      const savedData = localStorage.getItem('kiloByteData');
      if (savedData) {
        const data = JSON.parse(savedData);
        if (data.perfil?.nombre) {
          // Mantener compat local si no hay login aún
          // No navegamos automáticamente sin login
        }
      }
    }

    // Secuencia: 1) título aparece por fade-in (CSS); 2) luego se tipea el slogan
    // Disparamos el typewriter del slogan tras un pequeño delay
  const fullSlogan = 'Cero calorías, 100% productividad.';
    setAnimationComplete(true); // habilita el fade-in del título
    let i = 0;
    window.setTimeout(() => {
      typingTimerRef.current = window.setInterval(() => {
        i++;
        setTypedSlogan(fullSlogan.slice(0, i));
        if (i >= fullSlogan.length) {
          if (typingTimerRef.current) window.clearInterval(typingTimerRef.current);
        }
      }, 45);
      // caret del slogan
      caretTimerRef.current = window.setInterval(() => {
        setSloganCaretVisible((v) => !v);
      }, 520);
    }, 600);

    return () => {
      if (typingTimerRef.current) window.clearInterval(typingTimerRef.current);
      if (caretTimerRef.current) window.clearInterval(caretTimerRef.current);
    };
  }, [navigate, user]);

  const validarNombre = (nombre: string) => {
    return nombre.length >= 2 && nombre.length <= 20 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre);
  };

  const handleEnterApp = () => {
    if (loading) return;
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
  setLoading(true);
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

    try {
      localStorage.setItem('kiloByteData', JSON.stringify(data));
    } finally {
      // Breve delay visual para que se vea el spinner si la navegación es muy rápida
      setTimeout(() => {
        navigate('/dashboard');
      }, 150);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEnterApp();
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const u = await signInWithGoogle();
      // si hay datos locales, subimos como primer estado
      const local = localStorage.getItem('kiloByteData');
      if (local) {
        try { await saveUserState(u.uid, JSON.parse(local)); } catch (e) { console.warn('No se pudo subir estado local inicial', e); }
      }
      const cloud = await loadUserState(u.uid);
      // Solo pisar local si el cloud parece válido (tiene perfil y metas)
      const looksValid = (s: unknown): s is { perfil: { nombre?: string }; metas: unknown } => {
        if (!s || typeof s !== 'object') return false;
        const o = s as Record<string, unknown>;
        const hasPerfil = 'perfil' in o && typeof o.perfil === 'object' && o.perfil !== null;
        const hasMetas = 'metas' in o;
        return hasPerfil && hasMetas;
      };
      if (looksValid(cloud)) {
        localStorage.setItem('kiloByteData', JSON.stringify(cloud));
      }
      navigate('/dashboard');
    } catch (e) {
      console.warn('Fallo login con Google', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1 className={`kb-title ${animationComplete ? 'fade-in' : ''}`} aria-label="KiloByte">
          KiloByte
        </h1>
        <p className="slogan" aria-label="Slogan">
          <span className="slogan-text">{typedSlogan}</span>
          <span className={`slogan-caret ${sloganCaretVisible ? 'visible' : ''}`} aria-hidden="true">|</span>
        </p>

        {/* Botón de Google como método principal */}
        <button
          onClick={handleGoogleLogin}
          className="google-btn"
          disabled={loading || authLoading}
          aria-label="Entrar con Gmail"
        >
          {loading || authLoading ? (
            <Spinner tight label="Conectando…" />
          ) : (
            <>
              <span className="google-logo" aria-hidden>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611 20.083h-1.611V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12S17.373 12 24 12c3.059 0 5.842 1.158 7.961 3.039l5.657-5.657C34.676 6.053 29.623 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"/>
                  <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.23 18.961 12 24 12c3.059 0 5.842 1.158 7.961 3.039l5.657-5.657C34.676 6.053 29.623 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                  <path fill="#4CAF50" d="M24 44c5.176 0 9.86-1.978 13.409-5.197l-6.197-5.238C29.142 35.201 26.68 36 24 36c-5.204 0-9.62-3.317-11.278-7.952l-6.53 5.027C9.5 39.556 16.227 44 24 44z"/>
                  <path fill="#1976D2" d="M43.611 20.083h-1.611V20H24v8h11.303c-.793 2.239-2.279 4.166-4.18 5.565l.003-.002 6.197 5.238C35.043 40.19 40 34.667 40 24c0-1.341-.138-2.651-.389-3.917z"/>
                </svg>
              </span>
              <span>Entrar con Gmail</span>
              <span className="hover-check" aria-hidden>✅</span>
            </>
          )}
        </button>

        <p className="trust-text" aria-live="polite">No te preocupes, no vamos a espiarte el almuerzo 🍔.</p>

        {/* flujo local anterior opcional, oculto por ahora */}
        <div className="input-group" style={{ display: 'none' }}>
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
          <button onClick={handleEnterApp} className="start-button" disabled={loading}>Comenzar</button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;