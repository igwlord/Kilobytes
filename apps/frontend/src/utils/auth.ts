import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { initFirebase } from './firebase';

// Detectar si estamos en móvil para usar redirect en lugar de popup
const isMobileDevice = () => {
  // Detectar móviles por User Agent
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Detectar si tiene touch sin mouse (típico de móviles)
  const isTouchOnly = 'ontouchstart' in window && !window.matchMedia('(pointer: fine)').matches;
  
  // Combinación: UA de móvil O (touch sin mouse Y pantalla pequeña)
  return isMobileUA || (isTouchOnly && window.innerWidth <= 768);
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { auth } = initFirebase();
    console.log('[auth] init, listening for auth state changes');
    
    let isSubscribed = true;
    
    // Primero: Verificar si hay resultado de redirect (solo pasa en móviles al volver de Google)
    getRedirectResult(auth)
      .then((result) => {
        if (!isSubscribed) return;
        
        if (result?.user) {
          console.log('[auth] ✅ Redirect login success for', result.user.email);
          console.log('[auth] User UID:', result.user.uid);
        } else {
          console.log('[auth] No redirect result (primera carga normal)');
        }
      })
      .catch((error) => {
        if (!isSubscribed) return;
        console.error('[auth] ❌ Error processing redirect result:', error);
      });

    // Segundo: Escuchar cambios de auth (funciona tanto en desktop como móvil)
    const unsub = onAuthStateChanged(auth, (u: User | null) => {
      if (!isSubscribed) return;
      
      console.log('[auth] 🔄 state change:', u ? `logged in as ${u.email}` : 'logged out');
      setUser(u);
      setLoading(false);
    });
    
    return () => {
      isSubscribed = false;
      unsub();
    };
  }, []);

  return { user, loading };
}

export async function signInWithGoogle(): Promise<User | 'REDIRECT_INITIATED'> {
  const { auth, provider } = initFirebase();
  
  // En móviles usar redirect, en desktop usar popup
  if (isMobileDevice()) {
    console.log('[auth] 📱 Mobile detected, using redirect flow');
    console.log('[auth] 🔄 Iniciando redirect a Google...');
    try {
      await signInWithRedirect(auth, provider);
      console.log('[auth] ✅ Redirect iniciado, la página se recargará...');
      // El redirect redirige la página completa, no hay return
      // Marcamos con un flag especial para que el caller sepa que inició redirect
      return 'REDIRECT_INITIATED';
    } catch (error) {
      console.error('[auth] ❌ Error en signInWithRedirect:', error);
      throw error;
    }
  }
  
  // Flujo original para desktop
  console.log('[auth] 🖥️ Desktop detected, using popup flow');
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
