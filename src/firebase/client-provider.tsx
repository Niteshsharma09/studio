
'use client';
import {useEffect, useState} from 'react';
import {initializeApp, type FirebaseApp} from 'firebase/app';
import {getAuth, type Auth} from 'firebase/auth';
import {getFirestore, type Firestore} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import {firebaseConfig} from './config';
import {FirebaseProvider} from './provider';
import { Loader2 } from 'lucide-react';

let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let storage: FirebaseStorage | null = null;

// This function is extracted to ensure it's only called on the client side.
function getFirebaseInstances() {
  if (typeof window !== 'undefined') {
    if (!firebaseApp) {
      firebaseApp = initializeApp(firebaseConfig);
      auth = getAuth(firebaseApp);
      firestore = getFirestore(firebaseApp);
      storage = getStorage(firebaseApp);
    }
    return {firebaseApp, auth, firestore, storage};
  }
  return {firebaseApp: null, auth: null, firestore: null, storage: null};
}

/**
 * A client-side component that initializes Firebase and provides it to all child components.
 * This should be used at the root of your application.
 */
export function FirebaseClientProvider({children}: {children: React.ReactNode}) {
  const [instances, setInstances] = useState(() => getFirebaseInstances());

  useEffect(() => {
    // This effect ensures that we only initialize Firebase once on the client
    // and that we're not trying to do it on the server.
    if (!instances.firebaseApp) {
      setInstances(getFirebaseInstances());
    }
  }, [instances.firebaseApp]);

  if (!instances.firebaseApp || !instances.auth || !instances.firestore || !instances.storage) {
    // You can return a loading spinner here if you want.
    // Returning null until Firebase is initialized.
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin" />
        </div>
    );
  }

  return (
    <FirebaseProvider
      firebaseApp={instances.firebaseApp}
      auth={instances.auth}
      firestore={instances.firestore}
      storage={instances.storage}
    >
      {children}
    </FirebaseProvider>
  );
}

    