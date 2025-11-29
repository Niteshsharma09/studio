
'use client';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';
import {
  FirebaseProvider,
  useFirebase,
  useFirebaseApp,
  useAuth,
  useFirestore,
} from './provider';
import { FirebaseClientProvider } from './client-provider';
import { useUser } from './auth/use-user';


let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

function initializeFirebase() {
  if (getApps().length === 0) {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
  }
  return { firebaseApp, auth, firestore };
}

export {
    initializeFirebase,
    FirebaseProvider,
    FirebaseClientProvider,
    useFirebase,
    useFirebaseApp,
    useAuth,
    useFirestore,
    useUser,
};

    