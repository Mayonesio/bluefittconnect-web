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
        document.cookie = `firebaseAuthToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`; // 7 days
        console.log("AuthContext setupSession: Token cookie set for user:", firebaseUser.email);
      } catch (error) {
        console.error("AuthContext setupSession: Error setting auth token cookie:", error);
        document.cookie = "firebaseAuthToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      }
    } else {
      document.cookie = "firebaseAuthToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      console.log("AuthContext setupSession: Token cookie cleared.");
    }
  };

  useEffect(() => {
    console.log("AuthContext useEffect: Initializing auth state listener. Firebase enabled:", isFirebaseEnabled);
    if (!isFirebaseEnabled) { 
      setLoading(false);
      setUser(null);
      setupSession(null); 
      console.warn(
          "AuthContext: Firebase Auth module is not initialized. Authentication features disabled."
      );
      return;
    }

    const authInstance = firebaseAuthModule as FirebaseAuthType; 
    const unsubscribe = onAuthStateChanged(authInstance, async (currentFirebaseUser) => {
      console.log("AuthContext onAuthStateChanged: User state changed. Current user:", currentFirebaseUser?.email || null);
      setUser(currentFirebaseUser); 
      await setupSession(currentFirebaseUser); 
      setLoading(false);
      console.log("AuthContext onAuthStateChanged: User and loading state updated. Loading:", false, "User:", currentFirebaseUser?.email || null);
    });
    return () => {
      console.log("AuthContext useEffect: Cleaning up auth state listener.");
      unsubscribe();
    }
  }, [isFirebaseEnabled]); 

  const login = async (data: LoginFormValues): Promise<FirebaseUser | null> => {
    if (!isFirebaseEnabled || !firebaseAuthModule) {
      console.error("AuthContext login: Firebase not configured.");
      throw new Error("Firebase no está configurado correctamente. No se puede iniciar sesión.");
    }
    const authInstance = firebaseAuthModule as FirebaseAuthType;
    try {
      console.log("AuthContext login: Attempting sign-in for email:", data.email);
      const userCredential = await signInWithEmailAndPassword(authInstance, data.email, data.password);
      if (userCredential.user) {
        console.log("AuthContext login: Sign-in successful for:", userCredential.user.email);
        await setupSession(userCredential.user); 
      }
      return userCredential.user;
    } catch (error) {
      console.error("AuthContext login: Error during sign-in:", error);
      await setupSession(null); 
      const authError = error as AuthError;
      throw authError; 
    }
  };

  const register = async (data: RegisterFormValues): Promise<FirebaseUser | null> => {
    if (!isFirebaseEnabled || !firebaseAuthModule) {
      console.error("AuthContext register: Firebase not configured.");
      throw new Error("Firebase no está configurado correctamente. No se puede registrar.");
    }
    const authInstance = firebaseAuthModule as FirebaseAuthType;
    try {
      console.log("AuthContext register: Attempting registration for email:", data.email);
      const userCredential = await createUserWithEmailAndPassword(authInstance, data.email, data.password);
      if (userCredential.user) {
        console.log("AuthContext register: Registration successful for:", userCredential.user.email);
        await setupSession(userCredential.user);
      }
      return userCredential.user;
    } catch (error) {
      console.error("AuthContext register: Error during registration:", error);
      await setupSession(null); 
      const authError = error as AuthError;
      throw authError;
    }
  };

  const signInWithGoogle = async (): Promise<FirebaseUser | null> => {
    if (!isFirebaseEnabled || !firebaseAuthModule) {
      console.error("AuthContext signInWithGoogle: Firebase not configured.");
      throw new Error("Firebase no está configurado correctamente. No se puede iniciar sesión con Google.");
    }
    const authInstance = firebaseAuthModule as FirebaseAuthType;
    const provider = new GoogleAuthProvider();
    try {
      console.log("AuthContext signInWithGoogle: Attempting Google sign-in popup.");
      const result = await signInWithPopup(authInstance, provider);
      if (result.user) {
        console.log("AuthContext signInWithGoogle: Google sign-in successful for:", result.user.email);
        await setupSession(result.user); 
      }
      return result.user;
    } catch (error) {
      console.error("AuthContext signInWithGoogle: Error during Google sign-in:", error);
      await setupSession(null); 
      const authError = error as AuthError;
      throw authError;
    }
  };

  const logout = async () => {
    console.log("AuthContext logout: Attempting logout.");
    if (!isFirebaseEnabled || !firebaseAuthModule) {
      setUser(null);
      setLoading(false); 
      await setupSession(null);
      router.push("/auth/login");
      console.warn("AuthContext logout: Firebase not configured. Session closed locally.");
      return;
    }
    const authInstance = firebaseAuthModule as FirebaseAuthType;
    try {
      await signOut(authInstance);
      console.log("AuthContext logout: Firebase signOut successful. onAuthStateChanged will handle state updates.");
      // onAuthStateChanged will handle setUser(null), setLoading(false), and clearing the cookie via setupSession(null)
      router.push("/auth/login"); 
    } catch (error) {
      console.error("AuthContext logout: Error during Firebase signOut:", error);
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