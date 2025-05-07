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
  signInWithPopup,    
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
  signInWithGoogle: () => Promise<FirebaseUser | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const isFirebaseEnabled = !!firebaseAuthModule; 
  const router = useRouter();

  const setupSession = async (firebaseUser: FirebaseUser | null): Promise<void> => {
    if (firebaseUser) {
      try {
        const token = await firebaseUser.getIdToken(true); // Force refresh token
        // Set cookie. In a real app, consider HttpOnly if managing via backend.
        // Secure flag should be used if served over HTTPS.
        document.cookie = `firebaseAuthToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`; // 7 days
      } catch (error) {
        console.error("Error setting auth token cookie:", error);
        // Clear cookie if token cannot be obtained
        document.cookie = "firebaseAuthToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      }
    } else {
      // Clear cookie on logout or if user is null
      document.cookie = "firebaseAuthToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    }
  };

  useEffect(() => {
    if (!isFirebaseEnabled) { 
      setLoading(false);
      setUser(null);
      setupSession(null); // Ensure cookie is cleared
      console.warn(
          "Firebase Auth module is not initialized, likely due to missing or invalid Firebase configuration. Authentication features will be disabled."
      );
      return;
    }

    const authInstance = firebaseAuthModule as FirebaseAuthType; 
    const unsubscribe = onAuthStateChanged(authInstance, async (currentFirebaseUser) => {
      setUser(currentFirebaseUser); // Update user state first
      await setupSession(currentFirebaseUser); // Then setup session (cookie)
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
      if (userCredential.user) {
        await setupSession(userCredential.user); // Ensure cookie is set before resolving
      }
      // onAuthStateChanged will also set user state in context
      return userCredential.user;
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      await setupSession(null); // Clear session on error
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
      if (userCredential.user) {
        await setupSession(userCredential.user); // Ensure cookie is set before resolving
      }
      // onAuthStateChanged will also set user state in context
      return userCredential.user;
    } catch (error) {
      console.error("Error al registrar:", error);
      await setupSession(null); // Clear session on error
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
      if (result.user) {
        await setupSession(result.user); // Ensure cookie is set before resolving
      }
      // onAuthStateChanged will also set user state in context
      return result.user;
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      await setupSession(null); // Clear session on error
      const authError = error as AuthError;
      throw authError;
    }
  };

  const logout = async () => {
    if (!isFirebaseEnabled || !firebaseAuthModule) {
      setUser(null);
      setLoading(false); 
      await setupSession(null); // Ensure cookie is cleared
      router.push("/auth/login");
      console.warn("Firebase no está configurado. Sesión cerrada localmente.");
      return;
    }
    const authInstance = firebaseAuthModule as FirebaseAuthType;
    try {
      await signOut(authInstance);
      // onAuthStateChanged will handle setUser(null) and clearing the cookie via setupSession(null)
      router.push("/auth/login"); 
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // It's good practice to ensure session is cleared even if signOut fails for some reason,
      // though onAuthStateChanged should ideally handle this.
      await setupSession(null);
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
