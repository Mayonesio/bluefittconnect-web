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
  deleteUser as deleteFirebaseAuthUser,
  type Auth as FirebaseAuthType
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp, collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import type { LoginFormValues } from "@/app/auth/login/page";
import type { RegisterFormValues } from "@/app/auth/register/page";
import type { AppUser, UserRole } from "@/types/user";

interface AuthContextType {
  user: FirebaseUser | null;
  appUser: AppUser | null; // Application-specific user data with role
  loading: boolean;
  isFirebaseEnabled: boolean;
  login: (data: LoginFormValues) => Promise<FirebaseUser | null>;
  register: (data: RegisterFormValues) => Promise<FirebaseUser | null>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (profileData: Partial<Pick<AppUser, 'displayName' | 'company' | 'photoURL'>>) => Promise<void>;
  updateUserRoleByAdmin: (userId: string, newRole: UserRole) => Promise<void>;
  deleteUserAccount: () => Promise<void>; // For self-deletion
  // deleteUserByAdmin: (userId: string) => Promise<void>; // Requires Admin SDK for full auth deletion, client-side can only delete Firestore doc
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

  const createUserProfile = async (firebaseUser: FirebaseUser, role: UserRole = 'user'): Promise<AppUser> => {
    if (!firestoreDB) throw new Error("Firestore no está configurado.");
    const newUserProfile: Omit<AppUser, 'createdAt'> & { createdAt: any } = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Nuevo Usuario',
      photoURL: firebaseUser.photoURL,
      role,
      company: '', 
      createdAt: serverTimestamp(),
    };
    const userDocRef = doc(firestoreDB, "users", firebaseUser.uid);
    await setDoc(userDocRef, newUserProfile, { merge: true }); 
    console.log(`[${new Date().toISOString()}] AuthContext createUserProfile: Profile created/merged in Firestore for UID: ${firebaseUser.uid} with role ${role}`);
    return { ...newUserProfile, createdAt: new Date() } as AppUser;
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
          console.log(`[${timestamp}] AuthContext onAuthStateChanged: No Firestore profile found for ${currentFirebaseUser.uid}, creating default user profile.`);
          profile = await createUserProfile(currentFirebaseUser, 'user'); 
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
      await createUserProfile(userCredential.user, 'user'); 
      console.log(`[${timestamp}] AuthContext register: Firestore profile CREATED for:`, userCredential.user.email);
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
      let profile = await getUserProfile(result.user.uid);
      if (!profile) {
        console.log(`[${new Date().toISOString()}] AuthContext signInWithGoogle: No Firestore profile after Google Sign-In for ${result.user.uid}, creating.`);
        profile = await createUserProfile(result.user, 'user'); 
      }
      // onAuthStateChanged will handle setting user and appUser globally.
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

  const updateUserProfile = async (profileData: Partial<Pick<AppUser, 'displayName' | 'company' | 'photoURL'>>) => {
    if (!user || !firestoreDB || !appUser) throw new Error("Usuario no autenticado o Firestore no disponible.");
    const userDocRef = doc(firestoreDB, "users", user.uid);
    await updateDoc(userDocRef, profileData);
    setAppUser(prev => prev ? { ...prev, ...profileData } : null);
  };

  const updateUserRoleByAdmin = async (userId: string, newRole: UserRole) => {
    if (!firestoreDB || !appUser || appUser.role !== 'admin') throw new Error("No autorizado o Firestore no disponible.");
    const userDocRef = doc(firestoreDB, "users", userId);
    await updateDoc(userDocRef, { role: newRole });
    // Re-fetch or update local state for the admin page listing if necessary
  };

  const deleteUserAccount = async () => { // Self-deletion
    if (!user || !firestoreDB) throw new Error("Usuario no autenticado o Firestore no disponible.");
    const authInstance = firebaseAuthModule as FirebaseAuthType;
    const firebaseUserToDelete = authInstance.currentUser;
    if (!firebaseUserToDelete || firebaseUserToDelete.uid !== user.uid) {
      throw new Error("Discrepancia de usuario al eliminar cuenta.");
    }
    try {
      const userDocRef = doc(firestoreDB, "users", user.uid);
      await deleteDoc(userDocRef);
      await deleteFirebaseAuthUser(firebaseUserToDelete); // Deletes from Firebase Auth
      // Logout will be handled by onAuthStateChanged
    } catch (error) {
      console.error("Error deleting user account:", error);
      throw error;
    }
  };

  useEffect(() => {
    console.log(`[${new Date().toISOString()}] AuthContext: loading state changed: ${loading} (initialAuthCheckLoading: ${initialAuthCheckLoading}) User: ${user?.email || 'null'} AppUser Role: ${appUser?.role || 'null'}`);
  }, [loading, initialAuthCheckLoading, user, appUser]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      appUser, 
      loading, 
      login, 
      register, 
      signInWithGoogle, 
      logout, 
      isFirebaseEnabled,
      updateUserProfile,
      updateUserRoleByAdmin,
      deleteUserAccount
    }}>
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
