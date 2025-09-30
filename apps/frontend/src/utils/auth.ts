import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { initFirebase } from './firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { auth } = initFirebase();
    console.log('[auth] init, listening for auth state changes');
    const unsub = onAuthStateChanged(auth, (u: User | null) => {
      setUser(u);
      setLoading(false);
      console.log('[auth] state change:', u ? `logged in as ${u.email}` : 'logged out');
    });
    return () => unsub();
  }, []);

  return { user, loading };
}

export async function signInWithGoogle(): Promise<User> {
  const { auth, provider } = initFirebase();
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
