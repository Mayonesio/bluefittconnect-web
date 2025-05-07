// src/contexts/auth-context.tsx
"use client";

import type { User as FirebaseUser, AuthError } from "firebase/auth";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
// Import the potentially null auth object from Firebase config
import { auth as firebaseAuthModule } from "@/lib/firebase/config"; 
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  type Auth as FirebaseAuthType // Import Auth type for casting
} from "firebase/auth";
import { useRouter } from "next/navigation";
import type { LoginFormValues } from "@/app/auth/login/page";
import type { RegisterFormValues } from "@/app/auth/register/page";

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  isFirebaseEnabled: boolean; // New state to indicate if Firebase Auth is usable
  login: (data: LoginFormValues) => Promise<FirebaseUser | null>;
  register: (data: RegisterFormValues) => Promise<FirebaseUser | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  // isFirebaseEnabled is true if firebaseAuthModule (the Auth object from config) is not null
  const isFirebaseEnabled = !!firebaseAuthModule; 
  const router = useRouter();

  useEffect(() => {
    if (!isFirebaseEnabled) { 
      setLoading(false);
      setUser(null);
      // This warning will show if firebaseAuthModule is null (init failed)
      console.warn(
          "Firebase Auth module is not initialized, likely due to missing or invalid Firebase configuration (e.g., API key). Authentication features will be disabled."
      );
      return;
    }

    // At this point, firebaseAuthModule is expected to be a valid Auth instance.
    // We cast it to FirebaseAuthType to satisfy TypeScript.
    const authInstance = firebaseAuthModule as FirebaseAuthType; 
    const unsubscribe = onAuthStateChanged(authInstance, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [isFirebaseEnabled]); // Depend on isFirebaseEnabled

  const login = async (data: LoginFormValues): Promise<FirebaseUser | null> => {
    if (!isFirebaseEnabled || !firebaseAuthModule) {
      throw new Error("Firebase no está configurado correctamente. No se puede iniciar sesión.");
    }
    const authInstance = firebaseAuthModule as FirebaseAuthType;
    try {
      const userCredential = await signInWithEmailAndPassword(authInstance, data.email, data.password);
      setUser(userCredential.user);
      // router.push("/"); // Let middleware or calling page handle redirect
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
      // router.push("/"); 
      return userCredential.user;
    } catch (error) {
      console.error("Error al registrar:", error);
      const authError = error as AuthError;
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
    <AuthContext.Provider value={{ user, loading, login, register, logout, isFirebaseEnabled }}>
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
