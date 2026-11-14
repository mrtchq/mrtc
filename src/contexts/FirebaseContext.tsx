import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType, testFirestoreConnection } from '../firebase';

interface FirebaseContextValue {
  user: User | null;
  authReady: boolean;
  authLoading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  clearAuthError: () => void;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

function sanitizeProfileStrings(user: User) {
  return {
    uid: user.uid.slice(0, 128),
    displayName: (user.displayName ?? '').slice(0, 120),
    email: (user.email ?? '').slice(0, 254),
    photoURL: (user.photoURL ?? '').slice(0, 1024),
  };
}

async function syncUserProfileDocument(user: User) {
  if (!user.emailVerified || !user.email) return;

  const profilePath = `users/${user.uid}`;
  const userRef = doc(db, 'users', user.uid);
  const clean = sanitizeProfileStrings(user);

  let existingSnap;
  try {
    existingSnap = await getDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, profilePath);
  }

  if (!existingSnap.exists()) {
    try {
      await setDoc(userRef, {
        uid: clean.uid,
        displayName: clean.displayName,
        email: clean.email,
        photoURL: clean.photoURL,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, profilePath);
    }
  } else {
    try {
      await updateDoc(userRef, {
        displayName: clean.displayName,
        email: clean.email,
        photoURL: clean.photoURL,
        lastLoginAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, profilePath);
    }
  }
}

function formatFirebaseAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? '';
  const message = error instanceof Error ? error.message : String(error ?? '');
  if (code.includes('api-key-expired') || message.includes('api-key-expired')) {
    return 'Firebase Web API key has expired. Renew the API key in Google Cloud Console (APIs & Services > Credentials) or update your Firebase configuration.';
  }
  return message || 'Unable to sign in with Google.';
}

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let connectionTested = false;

    const runConnectionCheckOnce = () => {
      if (connectionTested) return;
      connectionTested = true;
      void testFirestoreConnection();
    };

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (!active) return;

      if (nextUser) {
        try {
          await nextUser.getIdToken();
        } catch (tokenError) {
          const code = (tokenError as { code?: string })?.code ?? '';
          const msg = tokenError instanceof Error ? tokenError.message : '';
          if (code.includes('api-key-expired') || msg.includes('api-key-expired')) {
            await signOut(auth).catch(() => undefined);
            if (!active) return;
            setUser(null);
            setAuthError(formatFirebaseAuthError(tokenError));
            setAuthReady(true);
            runConnectionCheckOnce();
            return;
          }
        }
      }

      if (!active) return;
      setUser(nextUser);
      setAuthReady(true);
      runConnectionCheckOnce();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      if (credential.user) {
        try {
          await syncUserProfileDocument(credential.user);
        } catch (syncError) {
          console.error('Failed to sync user profile:', syncError);
        }
      }
    } catch (error) {
      const code = (error as { code?: string })?.code ?? '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setAuthError(null);
      } else {
        setAuthError(formatFirebaseAuthError(error));
      }
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const signOutUser = useCallback(async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to sign out.');
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  return (
    <FirebaseContext.Provider
      value={{
        user,
        authReady,
        authLoading,
        authError,
        signInWithGoogle,
        signOutUser,
        clearAuthError,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebaseAuth() {
  const ctx = useContext(FirebaseContext);
  if (!ctx) {
    throw new Error('useFirebaseAuth must be used within a FirebaseProvider.');
  }
  return ctx;
}
