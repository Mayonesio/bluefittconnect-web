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
      
      // Update user state and loading status first.
      setUser(currentFirebaseUser);
      setLoading(false);

      // Attempt to set up or clear the session cookie based on the Firebase user state.
      const sessionSetupSuccess = await setupSession(currentFirebaseUser);

      if (currentFirebaseUser && !sessionSetupSuccess) {
        // If a Firebase user exists but we couldn't set up our session cookie (e.g., getIdToken failed),
        // log a warning. This state might cause issues if middleware relies on the cookie.
        // We are no longer calling signOut() here aggressively, as it might interrupt ongoing auth flows
        // like signInWithPopup. The individual auth methods (login, register, signInWithGoogle)
        // are responsible for handling signOut if their specific session setup fails.
        console.warn(
          "AuthContext onAuthStateChanged: Firebase user exists, but session cookie setup failed. User:",
          currentFirebaseUser.email,
          "This might lead to issues if the cookie is required by middleware or for subsequent operations."
        );
      }
      
      console.log("AuthContext onAuthStateChanged: User and loading state fully updated. Loading:", false, "User:", currentFirebaseUser?.email || null);
    });
    return () => {
      console.log("AuthContext useEffect: Cleaning up auth state listener.");
      unsubscribe();
    }
  }, [isFirebaseEnabled]); // isFirebaseEnabled should not change, but good practice.

  const handleAuthOperationError = async (error: any, operationName: string) => {
    console.error(`AuthContext ${operationName}: Error:`, error);
    // It's generally good to ensure the session is cleared if an auth operation fails,
    // especially if it's an error that implies an invalid or incomplete auth state.
    await setupSession(null); 
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
          await signOut(authInstance); // Triggers onAuthStateChanged to nullify user & clear cookie via its setupSession(null)
          throw new Error("Error al configurar la sesión después del inicio de sesión. Inténtalo de nuevo.");
        }
        console.log("AuthContext login: Sign-in and session setup successful for:", userCredential.user.email);
      }
      // onAuthStateChanged will handle setUser and setLoading.
      return userCredential.user; 
    } catch (error) {
      // error will be AuthError from signInWithEmailAndPassword or the custom error from session setup failure
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
    console.log(`AuthContext signInWithGoogle: Using auth domain: ${authInstance.config.authDomain}`); 
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
      console.log("AuthContext logout: Firebase signOut successful. onAuthStateChanged will handle global state updates & cookie clearing via its setupSession(null).");
      // onAuthStateChanged will handle setUser(null), setLoading(false), and clearing the cookie via setupSession(null)
      router.push("/auth/login"); 
    } catch (error) {
      console.error("AuthContext logout: Error during Firebase signOut:", error);
      // Attempt to clear local state and session even if Firebase signOut fails
      await setupSession(null); 
      setUser(null); 
      setLoading(false);
      router.push("/auth/login"); // Ensure redirection even on error
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
