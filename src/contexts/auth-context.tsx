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

  // Returns true if session setup was successful (cookie set or cleared appropriately),
  // false if token could not be obtained for an existing user.
  const setupSession = async (firebaseUser: FirebaseUser | null): Promise<boolean> => {
    if (firebaseUser) {
      try {
        const token = await firebaseUser.getIdToken(true); // Force refresh token
        document.cookie = `firebaseAuthToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`; // 7 days
        console.log("AuthContext setupSession: Token cookie set for user:", firebaseUser.email);
        return true;
      } catch (error) {
        console.error("AuthContext setupSession: Error setting auth token cookie:", error);
        // Clear cookie if token fetching fails, to ensure middleware sees unauthenticated state
        document.cookie = "firebaseAuthToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        return false; // Indicate failure
      }
    } else {
      // Clearing cookie for a null user
      document.cookie = "firebaseAuthToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      console.log("AuthContext setupSession: Token cookie cleared (user is null).");
      return true; // Clearing cookie is a "successful" operation in this context
    }
  };

  useEffect(() => {
    console.log("AuthContext useEffect: Initializing auth state listener. Firebase enabled:", isFirebaseEnabled);
    if (!isFirebaseEnabled) { 
      setLoading(false);
      setUser(null);
      setupSession(null); // Ensure cookie is cleared if Firebase isn't enabled
      console.warn(
          "AuthContext: Firebase Auth module is not initialized. Authentication features disabled."
      );
      return;
    }

    const authInstance = firebaseAuthModule as FirebaseAuthType; 
    const unsubscribe = onAuthStateChanged(authInstance, async (currentFirebaseUser) => {
      console.log("AuthContext onAuthStateChanged: User state changed. Current user:", currentFirebaseUser?.email || null);
      
      const sessionSetupSuccess = await setupSession(currentFirebaseUser);

      if (currentFirebaseUser && !sessionSetupSuccess) {
        // If a user object exists but we failed to get/set the ID token (cookie),
        // this means the middleware won't see them as authenticated.
        // To prevent redirect loops and inconsistent states, sign the user out.
        // This will trigger onAuthStateChanged again, but with currentFirebaseUser as null.
        console.warn("AuthContext: Session setup (getIdToken) failed for user. Signing out user to ensure consistent state.");
        await signOut(authInstance); 
        // setUser(null) and setLoading(false) will be handled by the *next* onAuthStateChanged call.
        // Cookie is already cleared by the failed setupSession call.
        return; // Important: return early to avoid setting user/loading state based on inconsistent data
      }
      
      setUser(currentFirebaseUser); 
      setLoading(false);
      console.log("AuthContext onAuthStateChanged: User and loading state updated. Loading:", false, "User:", currentFirebaseUser?.email || null);
    });
    return () => {
      console.log("AuthContext useEffect: Cleaning up auth state listener.");
      unsubscribe();
    }
  }, [isFirebaseEnabled]); // isFirebaseEnabled should not change, but good practice.

  const handleAuthOperationError = async (error: any, operationName: string) => {
    console.error(`AuthContext ${operationName}: Error:`, error);
    await setupSession(null); // Ensure cookie is cleared on any auth operation error
    const authError = error as AuthError;
    throw authError; // Re-throw for the UI to handle
  };

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
        const sessionSetupSuccess = await setupSession(userCredential.user);
        if (!sessionSetupSuccess) {
          console.warn("AuthContext login: Session setup failed after login. Signing out.");
          await signOut(authInstance); // Triggers onAuthStateChanged to nullify user
          throw new Error("Error al configurar la sesión después del inicio de sesión. Inténtalo de nuevo.");
        }
        console.log("AuthContext login: Sign-in and session setup successful for:", userCredential.user.email);
      }
      return userCredential.user; // `onAuthStateChanged` will set the global state
    } catch (error) {
      return handleAuthOperationError(error, "login");
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
         const sessionSetupSuccess = await setupSession(userCredential.user);
        if (!sessionSetupSuccess) {
          console.warn("AuthContext register: Session setup failed after registration. Signing out.");
          await signOut(authInstance);
          throw new Error("Error al configurar la sesión después del registro. Inténtalo de nuevo.");
        }
        console.log("AuthContext register: Registration and session setup successful for:", userCredential.user.email);
      }
      return userCredential.user;
    } catch (error) {
      return handleAuthOperationError(error, "register");
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
        const sessionSetupSuccess = await setupSession(result.user);
        if (!sessionSetupSuccess) {
          console.warn("AuthContext signInWithGoogle: Session setup failed after Google sign-in. Signing out.");
          await signOut(authInstance);
          throw new Error("Error al configurar la sesión después del inicio de sesión con Google. Inténtalo de nuevo.");
        }
        console.log("AuthContext signInWithGoogle: Google sign-in and session setup successful for:", result.user.email);
      }
      return result.user;
    } catch (error) {
      return handleAuthOperationError(error, "signInWithGoogle");
    }
  };

  const logout = async () => {
    console.log("AuthContext logout: Attempting logout.");
    if (!isFirebaseEnabled || !firebaseAuthModule) {
      // Simulate logout if Firebase isn't configured
      setUser(null);
      setLoading(false); 
      await setupSession(null); // Clear cookie
      router.push("/auth/login");
      console.warn("AuthContext logout: Firebase not configured. Session closed locally.");
      return;
    }
    const authInstance = firebaseAuthModule as FirebaseAuthType;
    try {
      await signOut(authInstance);
      console.log("AuthContext logout: Firebase signOut successful. onAuthStateChanged will handle global state updates & cookie.");
      // onAuthStateChanged will handle setUser(null), setLoading(false), and clearing the cookie via setupSession(null)
      router.push("/auth/login"); 
    } catch (error) {
       // Even if signOut fails, attempt to clear local state
      console.error("AuthContext logout: Error during Firebase signOut:", error);
      await setupSession(null); // Clear cookie
      setUser(null); // Force local state update
      setLoading(false);
      const authError = error as AuthError;
      throw authError; // Re-throw for UI or further handling
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
