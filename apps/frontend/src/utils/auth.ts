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
  const res = await signInWithPopup(auth, provider);
  console.log('[auth] Google sign-in success for', res.user.email);
  return res.user;
}

export async function signOutUser() {
  const { auth } = initFirebase();
  await signOut(auth);
  console.log('[auth] signed out');
}
