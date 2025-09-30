import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { initFirebase } from './firebase';

// Detectar si estamos en móvil para usar redirect en lugar de popup
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
    || window.innerWidth <= 768;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { auth } = initFirebase();
    console.log('[auth] init, listening for auth state changes');
    
    // Verificar si hay un resultado de redirect pendiente
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        console.log('[auth] Redirect login success for', result.user.email);
        // setUser se llamará automáticamente por onAuthStateChanged
      }
    }).catch((error) => {
      console.error('[auth] Error processing redirect result:', error);
    });

    const unsub = onAuthStateChanged(auth, (u: User | null) => {
      console.log('[auth] state change:', u ? `logged in as ${u.email}` : 'logged out');
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { user, loading };
}

export async function signInWithGoogle(): Promise<User> {
  const { auth, provider } = initFirebase();
  
  // En móviles usar redirect, en desktop usar popup
  if (isMobileDevice()) {
    console.log('[auth] Mobile detected, using redirect flow');
    try {
      await signInWithRedirect(auth, provider);
      // En redirect no hay respuesta inmediata, el resultado se maneja en useAuth
      return new Promise(() => {}); // Este promise no se resuelve, el redirect maneja el flujo
    } catch (error) {
      console.error('[auth] Error en signInWithRedirect:', error);
      throw error;
    }
  }
  
  // Flujo original para desktop
  try {
    const res = await signInWithPopup(auth, provider);
    
    // Validar que el resultado del login es completo
    if (!res.user || !res.user.uid || !res.user.email) {
      throw new Error('Login incompleto: información del usuario faltante');
    }
    
    console.log('[auth] Google sign-in success for', res.user.email);
    return res.user;
  } catch (error: unknown) {
    // Si el usuario cancela el popup, no loguear como error
    const err = error as { code?: string };
    if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
      console.log('[auth] Login cancelado por el usuario');
      throw new Error('Login cancelado');
    }
    console.error('[auth] Error en signInWithGoogle:', error);
    throw error;
  }
}

export async function signOutUser() {
  const { auth } = initFirebase();
  await signOut(auth);
  console.log('[auth] signed out');
}
