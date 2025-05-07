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
  GoogleAuthProvider, // Import GoogleAuthProvider
  signInWithPopup,    // Import signInWithPopup
  type Auth as FirebaseAuthType 
} from "firebase/auth";
import { useRouter } from "next/navigation";
import type { LoginFormValues } from "@/app/auth/login/page";
import type { RegisterFormValues } from "@/app/auth/register/page";

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  isFirebaseEnabled: boolean; 
  login: (data: LoginFormValues) => Promise<FirebaseUser | null>;
  register: (data: RegisterFormValues) => Promise<FirebaseUser | null>;
  signInWithGoogle: () => Promise<FirebaseUser | null>; // Add Google sign-in method
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const isFirebaseEnabled = !!firebaseAuthModule; 
  const router = useRouter();

  useEffect(() => {
    if (!isFirebaseEnabled) { 
      setLoading(false);
      setUser(null);
      console.warn(
          "Firebase Auth module is not initialized, likely due to missing or invalid Firebase configuration (e.g., API key). Authentication features will be disabled."
      );
      return;
    }

    const authInstance = firebaseAuthModule as FirebaseAuthType; 
    const unsubscribe = onAuthStateChanged(authInstance, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [isFirebaseEnabled]); 

  const login = async (data: LoginFormValues): Promise<FirebaseUser | null> => {
    if (!isFirebaseEnabled || !firebaseAuthModule) {
      throw new Error("Firebase no está configurado correctamente. No se puede iniciar sesión.");
    }
    const authInstance = firebaseAuthModule as FirebaseAuthType;
    try {
      const userCredential = await signInWithEmailAndPassword(authInstance, data.email, data.password);
      setUser(userCredential.user);
      return userCredential.user;
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      const authError = error as AuthError;
      throw authError; 
    }
  };

  const register = async (data: RegisterFormValues): Promise<FirebaseUser | null> => {
    if (!isFirebaseEnabled || !firebaseAuthModule) {
      throw new Error("Firebase no está configurado correctamente. No se puede registrar.");
    }
    const authInstance = firebaseAuthModule as FirebaseAuthType;
    try {
      const userCredential = await createUserWithEmailAndPassword(authInstance, data.email, data.password);
      setUser(userCredential.user);
      return userCredential.user;
    } catch (error) {
      console.error("Error al registrar:", error);
      const authError = error as AuthError;
      throw authError;
    }
  };

  const signInWithGoogle = async (): Promise<FirebaseUser | null> => {
    if (!isFirebaseEnabled || !firebaseAuthModule) {
      throw new Error("Firebase no está configurado correctamente. No se puede iniciar sesión con Google.");
    }
    const authInstance = firebaseAuthModule as FirebaseAuthType;
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(authInstance, provider);
      setUser(result.user);
      return result.user;
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      const authError = error as AuthError;
      // Handle specific Google sign-in errors if needed
      // e.g., authError.code === 'auth/popup-closed-by-user'
      throw authError;
    }
  };

  const logout = async () => {
    if (!isFirebaseEnabled || !firebaseAuthModule) {
      setUser(null);
      setLoading(false); 
      router.push("/auth/login");
      console.warn("Firebase no está configurado. Sesión cerrada localmente.");
      return;
    }
    const authInstance = firebaseAuthModule as FirebaseAuthType;
    try {
      await signOut(authInstance);
      setUser(null);
      router.push("/auth/login"); 
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      const authError = error as AuthError;
      throw authError;
    }
  };

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
