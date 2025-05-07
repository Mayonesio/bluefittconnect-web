// src/lib/firebase/config.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

let app: FirebaseApp | null = null;
let authModule: Auth | null = null;

const essentialEnvVarsPresent = apiKey && authDomain && projectId;

if (!essentialEnvVarsPresent) {
  console.error(
    "CRITICAL Firebase Config Error: Essential environment variables (NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID) are missing or incomplete. " +
    "Firebase features, including authentication, will be disabled. " +
    "Please ensure these are correctly set in your .env.local file or deployment environment."
  );
} else {
  const firebaseConfigValues = {
    apiKey: apiKey!, // Known to be non-null due to the check above
    authDomain: authDomain!,
    projectId: projectId!,
    storageBucket: storageBucket, 
    messagingSenderId: messagingSenderId,
    appId: appId,
  };

  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfigValues);
    } catch (e) {
      console.error("Firebase initialization failed:", e);
      // app remains null
    }
  } else {
    app = getApp();
  }

  if (app) {
    try {
      authModule = getAuth(app);
    } catch (e) {
      console.error("Failed to initialize Firebase Authentication:", e);
      // This can catch errors like 'auth/invalid-api-key' if they occur at getAuth()
      // authModule remains null
    }
  }
}

// Export authModule as auth. It will be null if initialization failed.
export { app, authModule as auth };
