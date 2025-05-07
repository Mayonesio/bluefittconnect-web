// src/contexts/auth-context.tsx
"use client";

import type { User as FirebaseUser, AuthError } from "firebase/auth";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { auth } from "@/lib/firebase/config";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { useRouter } from "next/navigation";
import type { LoginFormValues } from "@/app/auth/login/page";
import type { RegisterFormValues } from "@/app/auth/register/page";

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  login: (data: LoginFormValues) => Promise<FirebaseUser | null>;
  register: (data: RegisterFormValues) => Promise<FirebaseUser | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (data: LoginFormValues): Promise<FirebaseUser | null> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      setUser(userCredential.user);
      router.push("/"); // Redirect to dashboard after login
      return userCredential.user;
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      const authError = error as AuthError;
      throw authError; // Re-throw to be caught in the form
    }
  };

  const register = async (data: RegisterFormValues): Promise<FirebaseUser | null> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      // You might want to set a display name here if you collect it
      // await updateProfile(userCredential.user, { displayName: data.name });
      setUser(userCredential.user);
      router.push("/"); // Redirect to dashboard after registration
      return userCredential.user;
    } catch (error) {
      console.error("Error al registrar:", error);
      const authError = error as AuthError;
      throw authError; // Re-throw to be caught in the form
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      router.push("/auth/login"); // Redirect to login page after logout
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      const authError = error as AuthError;
      throw authError;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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
