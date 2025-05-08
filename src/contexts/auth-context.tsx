// src/contexts/auth-context.tsx
"use client";

import type { User as FirebaseUser, AuthError } from "firebase/auth";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { auth as firebaseAuthModule, db as firestoreDB } from "@/lib/firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  type Auth as FirebaseAuthType
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import type { LoginFormValues } from "@/app/auth/login/page";
import type { RegisterFormValues } from "@/app/auth/register/page";
import type { AppUser } from "@/types/user";

interface AuthContextType {
  user: FirebaseUser | null;
  appUser: AppUser | null; // Application-specific user data with role
  loading: boolean;
  isFirebaseEnabled: boolean;
  login: (data: LoginFormValues) => Promise<FirebaseUser | null>;
  register: (data: RegisterFormValues) => Promise<FirebaseUser | null>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [initialAuthCheckLoading, setInitialAuthCheckLoading] = useState(true);
  const isFirebaseEnabled = !!firebaseAuthModule && !!firestoreDB;
  const router = useRouter();

  const loading = initialAuthCheckLoading;

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

  const getUserProfile = async (uid: string): Promise<AppUser | null> => {
    if (!firestoreDB) return null;
    const userDocRef = doc(firestoreDB, "users", uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      return {
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate ? (data.createdAt as Timestamp).toDate() : new Date(data.createdAt || Date.now()),
      } as AppUser;
    }
    return null;
  };

  const createUserProfile = async (firebaseUser: FirebaseUser, role: AppUser['role'] = 'user'): Promise<AppUser> => {
    if (!firestoreDB) throw new Error("Firestore no está configurado.");
    const newUserProfile: Omit<AppUser, 'createdAt'> & { createdAt: any } = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      role,
      company: '', // Default company to empty string
      createdAt: serverTimestamp(),
    };
    const userDocRef = doc(firestoreDB, "users", firebaseUser.uid);
    await setDoc(userDocRef, newUserProfile, { merge: true }); // Use merge:true to avoid overwriting if called multiple times (e.g. Google Sign In)
    console.log(`[${new Date().toISOString()}] AuthContext createUserProfile: Profile created/merged in Firestore for UID: ${firebaseUser.uid}`);
    return { ...newUserProfile, createdAt: new Date() } as AppUser; // Return with JS Date
  };


  useEffect(() => {
    const timestampInit = new Date().toISOString();
    console.log(`[${timestampInit}] AuthContext useEffect: Initializing. Firebase Auth enabled: ${!!firebaseAuthModule}. Firestore enabled: ${!!firestoreDB}. Current user state: ${user?.email || 'null'}`);

    if (!isFirebaseEnabled || !firebaseAuthModule) {
      setInitialAuthCheckLoading(false);
      setUser(null);
      setAppUser(null);
      setupSession(null);
      console.warn(
        `[${timestampInit}] AuthContext: Firebase Auth/Firestore module NOT INITIALIZED. Auth features disabled.`
      );
      return;
    }

    const authInstance = firebaseAuthModule as FirebaseAuthType;

    const unsubscribeAuthState = onAuthStateChanged(authInstance, async (currentFirebaseUser) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] AuthContext onAuthStateChanged: FIRED. Firebase User: ${currentFirebaseUser?.email || 'null'}. initialAuthCheckLoading was: ${initialAuthCheckLoading}`);

      setUser(currentFirebaseUser);
      await setupSession(currentFirebaseUser);

      if (currentFirebaseUser) {
        let profile = await getUserProfile(currentFirebaseUser.uid);
        if (!profile) {
          console.log(`[${timestamp}] AuthContext onAuthStateChanged: No Firestore profile found for ${currentFirebaseUser.uid}, creating default.`);
          // Ensure display name and photoURL from Firebase Auth are used if available during initial profile creation
          const updatedFirebaseUser = {
            ...currentFirebaseUser,
            displayName: currentFirebaseUser.displayName || currentFirebaseUser.email?.split('@')[0] || 'Usuario',
            photoURL: currentFirebaseUser.photoURL || null,
          };
          profile = await createUserProfile(updatedFirebaseUser); 
        }
        setAppUser(profile);
        console.log(`[${timestamp}] AuthContext onAuthStateChanged: AppUser set:`, profile);
      } else {
        setAppUser(null);
      }

      if (initialAuthCheckLoading) {
        setInitialAuthCheckLoading(false);
      }
      console.log(`[${timestamp}] AuthContext onAuthStateChanged: State updated. initialAuthCheckLoading: false, Firebase User: ${currentFirebaseUser?.email || 'null'}, AppUser role: ${appUser?.role || 'null'}`);
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
      console.log(`[${timestamp}] AuthContext login: Sign-in SUCCESSFUL for:`, userCredential.user.email, ". Waiting for onAuthStateChanged.");
      // onAuthStateChanged handles setUser, setAppUser, and setupSession.
      return userCredential.user;
    } catch (error) {
      return handleAuthOperationError(error, "login");
    }
  };

  const register = async (data: RegisterFormValues): Promise<FirebaseUser | null> => {
    const timestamp = new Date().toISOString();
    if (!isFirebaseEnabled || !firebaseAuthModule || !firestoreDB) {
      console.error(`[${timestamp}] AuthContext register: Firebase not configured.`);
      throw new Error("Firebase no está configurado correctamente. No se puede registrar.");
    }
    const authInstance = firebaseAuthModule as FirebaseAuthType;
    try {
      console.log(`[${timestamp}] AuthContext register: Attempting registration for email:`, data.email);
      const userCredential = await createUserWithEmailAndPassword(authInstance, data.email, data.password);
      console.log(`[${timestamp}] AuthContext register: Firebase Auth user CREATED for:`, userCredential.user.email);
      // Create Firestore profile AFTER auth user is created. onAuthStateChanged will also pick this up, 
      // but doing it here ensures profile exists before first redirect if any.
      // Default role is 'user'.
      await createUserProfile(userCredential.user, 'user'); 
      console.log(`[${timestamp}] AuthContext register: Firestore profile CREATED for:`, userCredential.user.email);
      // onAuthStateChanged handles setUser, setAppUser (from newly created profile), and setupSession.
      return userCredential.user;
    } catch (error) {
      return handleAuthOperationError(error, "register");
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    const timestamp = new Date().toISOString();
    if (!isFirebaseEnabled || !firebaseAuthModule || !firestoreDB) {
      console.error(`[${timestamp}] AuthContext signInWithGoogle: Firebase not configured.`);
      throw new Error("Firebase no está configurado correctamente. No se puede iniciar sesión con Google.");
    }
    const authInstance = firebaseAuthModule as FirebaseAuthType;
    const provider = new GoogleAuthProvider();
    console.log(`[${timestamp}] AuthContext signInWithGoogle: Attempting Google sign-in with POPUP.`);
    try {
      const result = await signInWithPopup(authInstance, provider);
      console.log(`[${new Date().toISOString()}] AuthContext signInWithGoogle (POPUP): signInWithPopup promise RESOLVED successfully for ${result.user.email}.`);
      // Check if Firestore profile exists, create if not. This is important for Google Sign-In where user might be new to Firestore.
      let profile = await getUserProfile(result.user.uid);
      if (!profile) {
        console.log(`[${new Date().toISOString()}] AuthContext signInWithGoogle: No Firestore profile after Google Sign-In for ${result.user.uid}, creating.`);
        profile = await createUserProfile(result.user); // Creates with default 'user' role
        setAppUser(profile); // Explicitly set appUser here as onAuthStateChanged might be slightly delayed or already fired.
      } else {
        setAppUser(profile); // Update appUser with existing profile
      }
      // onAuthStateChanged will also fire and handle setUser, and potentially re-fetch/confirm appUser and session.
    } catch (error) {
      const authError = error as AuthError;
      const errorTimestamp = new Date().toISOString();
      if (authError.code === 'auth/popup-closed-by-user') {
        console.warn(`[${errorTimestamp}] AuthContext signInWithGoogle (POPUP) WARN: Popup closed by user. Code: ${authError.code}, Message: ${authError.message}`);
      } else if (authError.code === 'auth/popup-blocked') {
        console.warn(`[${errorTimestamp}] AuthContext signInWithGoogle (POPUP) WARN: Popup blocked by browser. Code: ${authError.code}, Message: ${authError.message}`);
      } else {
        console.error(`[${errorTimestamp}] AuthContext signInWithGoogle (POPUP) ERROR: Code: ${authError.code}, Message: ${authError.message}`, authError);
      }
      throw authError;
    }
  };

  const logout = async () => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] AuthContext logout: Attempting logout. Current user: ${user?.email}`);
    if (!isFirebaseEnabled || !firebaseAuthModule) {
      setUser(null);
      setAppUser(null);
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
      router.push("/auth/login");
    } catch (error) {
      const errorTimestamp = new Date().toISOString();
      console.error(`[${errorTimestamp}] AuthContext logout: Error during Firebase signOut:`, error);
      await setupSession(null); 
      setUser(null);
      setAppUser(null);
      setInitialAuthCheckLoading(false);
      router.push("/auth/login");
      const authError = error as AuthError;
      throw authError;
    }
  };

  useEffect(() => {
    console.log(`[${new Date().toISOString()}] AuthContext: loading state changed: ${loading} (initialAuthCheckLoading: ${initialAuthCheckLoading}) User: ${user?.email || 'null'} AppUser Role: ${appUser?.role || 'null'}`);
  }, [loading, initialAuthCheckLoading, user, appUser]);

  return (
    <AuthContext.Provider value={{ user, appUser, loading, login, register, signInWithGoogle, logout, isFirebaseEnabled }}>
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
