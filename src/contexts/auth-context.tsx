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
  signInWithGoogle: () => Promise<void>; 
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [initialAuthCheckLoading, setInitialAuthCheckLoading] = useState(true);
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(true); // Start true, as we always check on load
  const isFirebaseEnabled = !!firebaseAuthModule; 
  const router = useRouter();

  const combinedLoading = initialAuthCheckLoading || isProcessingRedirect;

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
      setIsProcessingRedirect(false); 
      setUser(null);
      setupSession(null); 
      console.warn(
          `[${timestampInit}] AuthContext: Firebase Auth module NOT INITIALIZED. Auth features disabled.`
      );
      return;
    }

    const authInstance = firebaseAuthModule as FirebaseAuthType; 
    
    const processRedirect = async () => {
      const timestampStart = new Date().toISOString();
      // setIsProcessingRedirect(true) is already set initially or by previous effect cleanup
      console.log(`[${timestampStart}] AuthContext: processRedirect START. Current user before getRedirectResult: ${authInstance.currentUser?.email || 'null'}`);
      try {
        const result = await getRedirectResult(authInstance);
        const timestampResult = new Date().toISOString();
        console.log(`[${timestampResult}] AuthContext: getRedirectResult raw result:`, result);
        if (result && result.user) {
          console.log(`[${timestampResult}] AuthContext getRedirectResult: SUCCESS. User from redirect: ${result.user.email}`);
          setUser(result.user); 
          await setupSession(result.user);
          setInitialAuthCheckLoading(false); // Redirect result is a definitive auth state.
        } else {
          console.log(`[${timestampResult}] AuthContext getRedirectResult: No pending redirect result or no user from result.`);
        }
      } catch (error) {
        const authError = error as AuthError;
        const timestampError = new Date().toISOString();
        console.error(`[${timestampError}] AuthContext getRedirectResult ERROR: Code: ${authError.code}, Message: ${authError.message}`, authError);
        if (authError.code === 'auth/account-exists-with-different-credential') {
           console.warn(`[${timestampError}] AuthContext: Account exists with different credentials.`);
        }
        // Do not set user to null or clear session here; let onAuthStateChanged handle the definitive state if redirect fails.
      } finally {
        setIsProcessingRedirect(false); 
        const timestampEnd = new Date().toISOString();
        console.log(`[${timestampEnd}] AuthContext: processRedirect END. isProcessingRedirect: false. User state: ${authInstance.currentUser?.email || 'null'}`);
      }
    };
    
    const unsubscribeAuthState = onAuthStateChanged(authInstance, async (currentFirebaseUser) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] AuthContext onAuthStateChanged: FIRED. User: ${currentFirebaseUser?.email || 'null'}. isProcessingRedirect: ${isProcessingRedirect}. initialAuthCheckLoading: ${initialAuthCheckLoading}`);
      
      setUser(currentFirebaseUser);
      await setupSession(currentFirebaseUser); // Ensure session matches this state
      
      // Only set initialAuthCheckLoading to false. isProcessingRedirect is handled by processRedirect.
      if(initialAuthCheckLoading) {
        setInitialAuthCheckLoading(false); 
      }
      console.log(`[${timestamp}] AuthContext onAuthStateChanged: State updated. initialAuthCheckLoading: ${initialAuthCheckLoading}, User: ${currentFirebaseUser?.email || 'null'}`);
    });

    processRedirect(); // Call after onAuthStateChanged is set up so it can react to changes from getRedirectResult

    return () => {
      const timestampCleanup = new Date().toISOString();
      console.log(`[${timestampCleanup}] AuthContext useEffect: CLEANUP auth state listener.`);
      unsubscribeAuthState();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFirebaseEnabled]); // Rerun if isFirebaseEnabled changes (e.g. from null to initialized)

  const handleAuthOperationError = async (error: any, operationName: string): Promise<null> => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] AuthContext ${operationName}: Error:`, error);
    await setupSession(null); 
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
      if (userCredential.user) {
        const sessionSetupSuccess = await setupSession(userCredential.user);
        if (!sessionSetupSuccess) {
          console.warn(`[${timestamp}] AuthContext login: Session setup FAILED after login. Signing out.`);
          await signOut(authInstance); 
          throw new Error("Error al configurar la sesión después del inicio de sesión. Inténtalo de nuevo.");
        }
        console.log(`[${timestamp}] AuthContext login: Sign-in and session setup SUCCESSFUL for:`, userCredential.user.email);
      }
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
      if (userCredential.user) {
         const sessionSetupSuccess = await setupSession(userCredential.user);
        if (!sessionSetupSuccess) {
          console.warn(`[${timestamp}] AuthContext register: Session setup FAILED after registration. Signing out.`);
          await signOut(authInstance);
          throw new Error("Error al configurar la sesión después del registro. Inténtalo de nuevo.");
        }
        console.log(`[${timestamp}] AuthContext register: Registration and session setup SUCCESSFUL for:`, userCredential.user.email);
      }
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
    console.log(`[${timestamp}] AuthContext signInWithGoogle: Using auth domain: ${authInstance.config.authDomain}`); 
    try {
      console.log(`[${timestamp}] AuthContext signInWithGoogle: Attempting Google sign-in with REDIRECT.`);
      // DO NOT set isProcessingRedirect here. It's for the *return* journey.
      // LoginPage's local isGoogleLoading handles UI during this initiation.
      await signInWithRedirect(authInstance, provider);
      // Page will redirect. Code execution stops here for this path.
    } catch (error) {
      const errorTimestamp = new Date().toISOString();
      console.error(`[${errorTimestamp}] AuthContext signInWithGoogle: Error INITIATING REDIRECT:`, error);
      const authError = error as AuthError;
      // If signInWithRedirect itself fails (e.g. network, misconfig), this catch runs.
      // isProcessingRedirect should not be managed here.
      throw authError;
    }
  };

  const logout = async () => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] AuthContext logout: Attempting logout. Current user: ${user?.email}`);
    if (!isFirebaseEnabled || !firebaseAuthModule) {
      setUser(null);
      setInitialAuthCheckLoading(false); 
      setIsProcessingRedirect(false);
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
      // It will also set initialAuthCheckLoading to false.
      setIsProcessingRedirect(false); // Explicitly set this to false as part of logout.
      router.push("/auth/login"); 
    } catch (error) {
      const errorTimestamp = new Date().toISOString();
      console.error(`[${errorTimestamp}] AuthContext logout: Error during Firebase signOut:`, error);
      await setupSession(null); 
      setUser(null); 
      setInitialAuthCheckLoading(false);
      setIsProcessingRedirect(false);
      router.push("/auth/login"); 
      const authError = error as AuthError;
      throw authError;
    }
  };

  // Log combinedLoading state changes
  useEffect(() => {
    console.log(`[${new Date().toISOString()}] AuthContext: combinedLoading state changed: ${combinedLoading} (initialAuth: ${initialAuthCheckLoading}, processingRedirect: ${isProcessingRedirect}) User: ${user?.email || 'null'}`);
  }, [combinedLoading, initialAuthCheckLoading, isProcessingRedirect, user]);


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

    