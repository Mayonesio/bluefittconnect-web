// src/contexts/auth-context.tsx
"use client";

import type { User as FirebaseUser, AuthError } from "firebase/auth";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { auth as firebaseAuthModule } from "@/lib/firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup, // Changed from signInWithRedirect, getRedirectResult
  type Auth as FirebaseAuthType
} from "firebase/auth";
import { useRouter } from "next/navigation";
import type { LoginFormValues } from "@/app/auth/login/page";
import type { RegisterFormValues } from "@/app/auth/register/page";

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean; // Was combinedLoading, now effectively initialAuthCheckLoading
  isFirebaseEnabled: boolean;
  login: (data: LoginFormValues) => Promise<FirebaseUser | null>;
  register: (data: RegisterFormValues) => Promise<FirebaseUser | null>;
  signInWithGoogle: () => Promise<void>; // void, as success/failure is observed via onAuthStateChanged and page-level error handling
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [initialAuthCheckLoading, setInitialAuthCheckLoading] = useState(true);
  const isFirebaseEnabled = !!firebaseAuthModule;
  const router = useRouter();

  const loading = initialAuthCheckLoading; // Simplified loading state

  const setupSession = async (firebaseUser: FirebaseUser | null): Promise<boolean> => {
    const timestamp = new Date().toISOString();
    if (firebaseUser) {
      try {
        const token = await firebaseUser.getIdToken(true);
        document.cookie = `firebaseAuthToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        console.log(`[${timestamp}] AuthContext setupSession: Token cookie SET for user:`, firebaseUser.email);
        return true;
      } catch (error) {
        console.error(`[${timestamp}] AuthContext setupSession: Error setting auth token cookie for ${firebaseUser.email}:`, error);
        document.cookie = "firebaseAuthToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        return false;
      }
    } else {
      document.cookie = "firebaseAuthToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      console.log(`[${timestamp}] AuthContext setupSession: Token cookie CLEARED (user is null).`);
      return true;
    }
  };

  useEffect(() => {
    const timestampInit = new Date().toISOString();
    console.log(`[${timestampInit}] AuthContext useEffect: Initializing. Firebase enabled: ${isFirebaseEnabled}. Current user state: ${user?.email || 'null'}`);

    if (!isFirebaseEnabled || !firebaseAuthModule) {
      setInitialAuthCheckLoading(false);
      setUser(null);
      setupSession(null);
      console.warn(
        `[${timestampInit}] AuthContext: Firebase Auth module NOT INITIALIZED. Auth features disabled.`
      );
      return;
    }

    const authInstance = firebaseAuthModule as FirebaseAuthType;

    const unsubscribeAuthState = onAuthStateChanged(authInstance, async (currentFirebaseUser) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] AuthContext onAuthStateChanged: FIRED. User: ${currentFirebaseUser?.email || 'null'}. initialAuthCheckLoading was: ${initialAuthCheckLoading}`);

      setUser(currentFirebaseUser);
      await setupSession(currentFirebaseUser); // Ensure session matches this state

      if (initialAuthCheckLoading) { // This will only be true once at the start or if Firebase re-initializes
        setInitialAuthCheckLoading(false);
      }
      console.log(`[${timestamp}] AuthContext onAuthStateChanged: State updated. initialAuthCheckLoading: false, User: ${currentFirebaseUser?.email || 'null'}`);
    });

    return () => {
      const timestampCleanup = new Date().toISOString();
      console.log(`[${timestampCleanup}] AuthContext useEffect: CLEANUP auth state listener.`);
      unsubscribeAuthState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFirebaseEnabled]);

  const handleAuthOperationError = async (error: any, operationName: string): Promise<null> => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] AuthContext ${operationName}: Error:`, error);
    // onAuthStateChanged will handle null user and clear session if auth fails.
    // No need to call setupSession(null) here explicitly, as that could race with onAuthStateChanged.
    const authError = error as AuthError;
    throw authError;
  };

  const login = async (data: LoginFormValues): Promise<FirebaseUser | null> => {
    const timestamp = new Date().toISOString();
    if (!isFirebaseEnabled || !firebaseAuthModule) {
      console.error(`[${timestamp}] AuthContext login: Firebase not configured.`);
      throw new Error("Firebase no está configurado correctamente. No se puede iniciar sesión.");
    }
    const authInstance = firebaseAuthModule as FirebaseAuthType;
    try {
      console.log(`[${timestamp}] AuthContext login: Attempting sign-in for email:`, data.email);
      const userCredential = await signInWithEmailAndPassword(authInstance, data.email, data.password);
      // onAuthStateChanged is now the sole handler for setUser and setupSession.
      console.log(`[${timestamp}] AuthContext login: Sign-in SUCCESSFUL for:`, userCredential.user.email, ". Waiting for onAuthStateChanged.");
      return userCredential.user;
    } catch (error) {
      return handleAuthOperationError(error, "login");
    }
  };

  const register = async (data: RegisterFormValues): Promise<FirebaseUser | null> => {
    const timestamp = new Date().toISOString();
    if (!isFirebaseEnabled || !firebaseAuthModule) {
      console.error(`[${timestamp}] AuthContext register: Firebase not configured.`);
      throw new Error("Firebase no está configurado correctamente. No se puede registrar.");
    }
    const authInstance = firebaseAuthModule as FirebaseAuthType;
    try {
      console.log(`[${timestamp}] AuthContext register: Attempting registration for email:`, data.email);
      const userCredential = await createUserWithEmailAndPassword(authInstance, data.email, data.password);
      // onAuthStateChanged is now the sole handler for setUser and setupSession.
      console.log(`[${timestamp}] AuthContext register: Registration SUCCESSFUL for:`, userCredential.user.email, ". Waiting for onAuthStateChanged.");
      return userCredential.user;
    } catch (error) {
      return handleAuthOperationError(error, "register");
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    const timestamp = new Date().toISOString();
    if (!isFirebaseEnabled || !firebaseAuthModule) {
      console.error(`[${timestamp}] AuthContext signInWithGoogle: Firebase not configured.`);
      throw new Error("Firebase no está configurado correctamente. No se puede iniciar sesión con Google.");
    }
    const authInstance = firebaseAuthModule as FirebaseAuthType;
    const provider = new GoogleAuthProvider();
    console.log(`[${timestamp}] AuthContext signInWithGoogle: Attempting Google sign-in with POPUP.`);
    try {
      // The signInWithPopup promise resolves when the sign-in is complete.
      // onAuthStateChanged will then fire with the new user, which updates user state and session.
      await signInWithPopup(authInstance, provider);
      console.log(`[${new Date().toISOString()}] AuthContext signInWithGoogle (POPUP): signInWithPopup promise RESOLVED successfully. Waiting for onAuthStateChanged.`);
    } catch (error) {
      const authError = error as AuthError;
      const errorTimestamp = new Date().toISOString();
      // Specific logging for common popup errors
      if (authError.code === 'auth/popup-closed-by-user') {
        console.warn(`[${errorTimestamp}] AuthContext signInWithGoogle (POPUP) WARN: Popup closed by user. Code: ${authError.code}, Message: ${authError.message}`);
      } else if (authError.code === 'auth/popup-blocked') {
        console.warn(`[${errorTimestamp}] AuthContext signInWithGoogle (POPUP) WARN: Popup blocked by browser. Code: ${authError.code}, Message: ${authError.message}`);
      } else {
        console.error(`[${errorTimestamp}] AuthContext signInWithGoogle (POPUP) ERROR: Code: ${authError.code}, Message: ${authError.message}`, authError);
      }
      throw authError; // Re-throw for page components to handle UI and display appropriate toasts
    }
  };

  const logout = async () => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] AuthContext logout: Attempting logout. Current user: ${user?.email}`);
    if (!isFirebaseEnabled || !firebaseAuthModule) {
      setUser(null);
      setInitialAuthCheckLoading(false);
      await setupSession(null);
      router.push("/auth/login");
      console.warn(`[${timestamp}] AuthContext logout: Firebase not configured. Session closed locally.`);
      return;
    }
    const authInstance = firebaseAuthModule as FirebaseAuthType;
    try {
      await signOut(authInstance);
      console.log(`[${timestamp}] AuthContext logout: Firebase signOut successful. onAuthStateChanged will handle global state.`);
      // onAuthStateChanged will set user to null and call setupSession(null).
      // It will also set initialAuthCheckLoading to false via its own logic.
      router.push("/auth/login");
    } catch (error) {
      const errorTimestamp = new Date().toISOString();
      console.error(`[${errorTimestamp}] AuthContext logout: Error during Firebase signOut:`, error);
      // Ensure state is cleared even if signOut fails unexpectedly
      await setupSession(null);
      setUser(null);
      setInitialAuthCheckLoading(false);
      router.push("/auth/login");
      const authError = error as AuthError;
      throw authError;
    }
  };

  // Log loading state changes
  useEffect(() => {
    console.log(`[${new Date().toISOString()}] AuthContext: loading state changed: ${loading} (initialAuthCheckLoading: ${initialAuthCheckLoading}) User: ${user?.email || 'null'}`);
  }, [loading, initialAuthCheckLoading, user]);


  return (
    <AuthContext.Provider value={{ user, loading, login, register, signInWithGoogle, logout, isFirebaseEnabled }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
