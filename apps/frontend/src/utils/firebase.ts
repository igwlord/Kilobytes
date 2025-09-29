// Minimal Firebase initialization for dev only
// Reads config from Vite env vars (VITE_FIREBASE_*)
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';

type FirebasePieces = {
  auth: Auth;
  provider: GoogleAuthProvider;
};

let cached: FirebasePieces | null = null;

export function initFirebase(): FirebasePieces {
  if (cached) return cached;

  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
    appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
    // measurementId optional in dev
  };

  if (!config.apiKey || !config.projectId) {
    // Surface a helpful error once in console but avoid breaking the UI
    console.warn('[firebase] Missing env config. Check .env.development');
  }

  const app = getApps().length ? getApps()[0] : initializeApp(config);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  cached = { auth, provider };
  return cached;
}

export type { Auth };
