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
  // signInWithPopup, // No longer used
  signInWithRedirect,
  getRedirectResult,    
  type Auth as FirebaseAuthType 
} from "firebase/auth";
import { useRouter } from "next/navigation";
import type { LoginFormValues } from "@/app/auth/login/page";
import type { RegisterFormValues } from "@/app/auth/register/page";

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean; // Combined loading state (initial auth check + redirect processing)
  isFirebaseEnabled: boolean; 
  login: (data: LoginFormValues) => Promise<FirebaseUser | null>;
  register: (data: RegisterFormValues) => Promise<FirebaseUser | null>;
  signInWithGoogle: () => Promise<void>; // Changed return type
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [initialAuthCheckLoading, setInitialAuthCheckLoading] = useState(true);
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(true);
  const isFirebaseEnabled = !!firebaseAuthModule; 
  const router = useRouter();

  const combinedLoading = initialAuthCheckLoading || isProcessingRedirect;

  const setupSession = async (firebaseUser: FirebaseUser | null): Promise<boolean> => {
    if (firebaseUser) {
      try {
        const token = await firebaseUser.getIdToken(true); 
        document.cookie = `firebaseAuthToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`; 
        console.log("AuthContext setupSession: Token cookie set for user:", firebaseUser.email);
        return true;
      } catch (error) {
        console.error("AuthContext setupSession: Error setting auth token cookie:", error);
        document.cookie = "firebaseAuthToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        return false; 
      }
    } else {
      document.cookie = "firebaseAuthToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      console.log("AuthContext setupSession: Token cookie cleared (user is null).");
      return true; 
    }
  };

  useEffect(() => {
    console.log("AuthContext useEffect: Initializing auth state listener. Firebase enabled:", isFirebaseEnabled);
    if (!isFirebaseEnabled || !firebaseAuthModule) { 
      setInitialAuthCheckLoading(false);
      setIsProcessingRedirect(false); // Ensure all loading states are false
      setUser(null);
      setupSession(null); 
      console.warn(
          "AuthContext: Firebase Auth module is not initialized. Authentication features disabled."
      );
      return;
    }

    const authInstance = firebaseAuthModule as FirebaseAuthType; 
    
    // Listener for general auth state changes (e.g., manual login, logout, token expiry)
    const unsubscribeAuthState = onAuthStateChanged(authInstance, async (currentFirebaseUser) => {
      console.log("AuthContext onAuthStateChanged: User state changed. Current user:", currentFirebaseUser?.email || null);
      setUser(currentFirebaseUser);
      await setupSession(currentFirebaseUser);
      setInitialAuthCheckLoading(false); // Initial check via onAuthStateChanged is done
      console.log("AuthContext onAuthStateChanged: User and loading state updated. InitialAuthLoading:", false, "User:", currentFirebaseUser?.email || null);
    });

    // Check for redirect result on initial load
    const processRedirect = async () => {
      console.log("AuthContext: Checking for redirect result...");
      setIsProcessingRedirect(true);
      try {
        const result = await getRedirectResult(authInstance);
        if (result && result.user) {
          console.log("AuthContext getRedirectResult: Success. User:", result.user.email);
          // Set user and session. onAuthStateChanged might also fire, but this ensures immediate update.
          setUser(result.user); 
          await setupSession(result.user);
        } else {
          console.log("AuthContext getRedirectResult: No pending redirect result or no user found.");
        }
      } catch (error) {
        const authError = error as AuthError;
        console.error("AuthContext getRedirectResult Error:", authError.code, authError.message);
        // Handle specific errors like 'auth/account-exists-with-different-credential'
        // Potentially show a toast to the user from here or let the page handle it
        if (authError.code === 'auth/account-exists-with-different-credential') {
           // TODO: Consider how to inform the user (e.g., toast from context or propogate error)
           console.warn("AuthContext: An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.");
        }
        await setupSession(null); // Clear session on error
        setUser(null);
      } finally {
        setIsProcessingRedirect(false); // Finished processing redirect
        console.log("AuthContext getRedirectResult: Processing finished. IsProcessingRedirect:", false);
      }
    };
    
    processRedirect();

    return () => {
      console.log("AuthContext useEffect: Cleaning up auth state listener.");
      unsubscribeAuthState();
    }
  }, [isFirebaseEnabled]); 

  const handleAuthOperationError = async (error: any, operationName: string): Promise<null> => {
    console.error(`AuthContext ${operationName}: Error:`, error);
    await setupSession(null); 
    const authError = error as AuthError;
    // setUser(null) will be handled by onAuthStateChanged if signOut is called or error implies invalid user
    throw authError; 
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
          await signOut(authInstance); 
          throw new Error("Error al configurar la sesión después del inicio de sesión. Inténtalo de nuevo.");
        }
        console.log("AuthContext login: Sign-in and session setup successful for:", userCredential.user.email);
      }
      return userCredential.user; 
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

  const signInWithGoogle = async (): Promise<void> => {
    if (!isFirebaseEnabled || !firebaseAuthModule) {
      console.error("AuthContext signInWithGoogle: Firebase not configured.");
      throw new Error("Firebase no está configurado correctamente. No se puede iniciar sesión con Google.");
    }
    const authInstance = firebaseAuthModule as FirebaseAuthType;
    const provider = new GoogleAuthProvider();
    console.log(`AuthContext signInWithGoogle: Using auth domain: ${authInstance.config.authDomain}`); 
    try {
      console.log("AuthContext signInWithGoogle: Attempting Google sign-in with redirect.");
      await signInWithRedirect(authInstance, provider);
      // Page will redirect, user will be caught by getRedirectResult on page load.
    } catch (error) {
      console.error("AuthContext signInWithGoogle: Error initiating redirect:", error);
      const authError = error as AuthError;
      // This error happens *before* redirect, e.g. network issue, config.
      // It's unlikely to be auth/popup-closed-by-user here.
      throw authError;
    }
  };

  const logout = async () => {
    console.log("AuthContext logout: Attempting logout.");
    if (!isFirebaseEnabled || !firebaseAuthModule) {
      setUser(null);
      setInitialAuthCheckLoading(false); 
      setIsProcessingRedirect(false);
      await setupSession(null); 
      router.push("/auth/login");
      console.warn("AuthContext logout: Firebase not configured. Session closed locally.");
      return;
    }
    const authInstance = firebaseAuthModule as FirebaseAuthType;
    try {
      await signOut(authInstance);
      console.log("AuthContext logout: Firebase signOut successful. onAuthStateChanged will handle global state updates & cookie clearing.");
      // onAuthStateChanged will set user to null and call setupSession(null).
      // It will also set initialAuthCheckLoading to false.
      // We should also ensure isProcessingRedirect is false.
      setIsProcessingRedirect(false);
      router.push("/auth/login"); 
    } catch (error) {
      console.error("AuthContext logout: Error during Firebase signOut:", error);
      await setupSession(null); 
      setUser(null); 
      setInitialAuthCheckLoading(false);
      setIsProcessingRedirect(false);
      router.push("/auth/login"); 
      const authError = error as AuthError;
      throw authError;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading: combinedLoading, login, register, signInWithGoogle, logout, isFirebaseEnabled }}>
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
