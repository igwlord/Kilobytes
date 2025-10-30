import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';
import { signInWithGoogle, useAuth } from '../utils/auth';
import { loadUserState, saveUserState } from '../utils/cloudSync';

const Welcome: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [redirectInProgress, setRedirectInProgress] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // NO hacer nada mientras auth está cargando
    if (authLoading) {
      console.log('[welcome] Esperando auth...');
      return;
    }
    
    // Si hay usuario, cargar datos y navegar
    if (user) {
      console.log('[welcome] ✅ Usuario detectado:', user.email);
      console.log('[welcome] UID:', user.uid);
      console.log('[welcome] Iniciando carga de datos y navegación...');
      
      (async () => {
        try {
          setLoading(true);
          const cloudData = await loadUserState(user.uid);
          if (cloudData) {
            localStorage.setItem('kiloByteData', JSON.stringify(cloudData));
            console.log('[welcome] ✅ Datos cargados desde la nube');
          } else {
            const initialData = {
              perfil: { 
                nombre: user.displayName || user.email?.split('@')[0] || 'Usuario', 
                peso: 70, 
                altura_cm: 175, 
                edad: 30, 
                genero: "masculino" as const, 
                actividad: 1.375, 
                exclusiones: [], 
                objetivo: "mantener" as const, 
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
            localStorage.setItem('kiloByteData', JSON.stringify(initialData));
            await saveUserState(user.uid, initialData);
            console.log('[welcome] ✅ Datos iniciales creados y guardados en la nube');
          }
          console.log('[welcome] 🚀 Navegando a dashboard...');
          navigate('/dashboard');
        } catch (error) {
          console.error('[welcome] ❌ Error cargando datos:', error);
          // Navegar de todas formas para no bloquear al usuario
          navigate('/dashboard');
        }
      })();
    } else {
      console.log('[welcome] No hay usuario, mostrando pantalla de login');
    }
  }, [user, authLoading, navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('[welcome] Iniciando login con Google');
      console.log('[welcome] User Agent:', navigator.userAgent);
      console.log('[welcome] Window width:', window.innerWidth);
      console.log('[welcome] Has touch:', 'ontouchstart' in window);
      
      const result = await signInWithGoogle();
      
      // Si es móvil, el redirect ya se inició y la página se recargará
      // No necesitamos hacer nada más aquí
      if (result === 'REDIRECT_INITIATED') {
        console.log('[welcome] Redirect iniciado, esperando respuesta de Google...');
        setRedirectInProgress(true);
        // Mantener loading true, la página se va a recargar
        return;
      }
      
      // Si es desktop con popup, el useEffect manejará la navegación
      console.log('[welcome] Login exitoso en desktop');
    } catch (e: unknown) {
      console.error('[welcome] Error en login:', e);
      const error = e as Error;
      if (error.message !== 'Login cancelado') {
        setError('Error al iniciar sesión con Google. Intenta de nuevo.');
      }
      setLoading(false);
      setRedirectInProgress(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="welcome-container">
        <div className="welcome-content">
          <div className="loading-spinner">
            {redirectInProgress ? 'Procesando autenticación...' : 'Verificando sesión...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        {/* Título con estilo dorado original */}
        <h1 className="kb-title fade-in">KiloByte</h1>
        <p className="slogan">Cero calorías, 100% productividad.</p>

        {/* Botón Google con el estilo anterior (logo + hover check) */}
        <button
          className="google-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
          aria-label="Continuar con Google"
        >
          <span className="google-logo" aria-hidden>
            <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.826 31.756 29.356 35 24 35c-7.18 0-13-5.82-13-13s5.82-13 13-13c3.313 0 6.332 1.234 8.634 3.266l5.657-5.657C34.676 3.043 29.59 1 24 1 11.85 1 2 10.85 2 23s9.85 22 22 22 22-9.85 22-22c0-1.473-.152-2.91-.389-4.917z"/>
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.816C14.407 15.163 18.834 12 24 12c3.313 0 6.332 1.234 8.634 3.266l5.657-5.657C34.676 3.043 29.59 1 24 1 15.318 1 7.889 5.676 4.053 12.308l2.253 2.383z"/>
              <path fill="#4CAF50" d="M24 45c5.268 0 10.085-2.018 13.71-5.312l-6.324-5.354C29.101 35.862 26.671 37 24 37c-5.33 0-9.779-3.29-11.43-7.927l-6.5 5.02C9.836 40.63 16.357 45 24 45z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.103 3.178-3.57 5.669-6.616 7.019l6.324 5.354C37.69 38.74 42 32.667 42 23c0-1.473-.152-2.91-.389-4.917z"/>
            </svg>
          </span>
          <span>
            {redirectInProgress 
              ? 'Redirigiendo a Google…' 
              : loading 
                ? 'Iniciando sesión…' 
                : 'Continuar con Google'}
          </span>
          <span className="hover-check" aria-hidden>✓</span>
        </button>

        {error && <p className="error-message" role="alert">{error}</p>}

        <p className="trust-text">Tus datos se sincronizan automáticamente en la nube</p>
      </div>
    </div>
  );
};

export default Welcome;
