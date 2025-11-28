'use client';
import {useEffect, useState} from 'react';
import {initializeApp, type FirebaseApp} from 'firebase/app';
import {getAuth, type Auth} from 'firebase/auth';
import {getFirestore, type Firestore} from 'firebase/firestore';
import {firebaseConfig} from './config';
import {FirebaseProvider} from './provider';

let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

function getFirebaseInstances() {
  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
  }
  return {firebaseApp, auth, firestore};
}

/**
 * A client-side component that initializes Firebase and provides it to all child components.
 * This should be used at the root of your application.
 */
export function FirebaseClientProvider({children}: {children: React.ReactNode}) {
  const [instances, setInstances] = useState(getFirebaseInstances);

  useEffect(() => {
    // This effect ensures that we only initialize Firebase once on the client
    // and that we're not trying to do it on the server.
    if (typeof window !== 'undefined' && !firebaseApp) {
      setInstances(getFirebaseInstances());
    }
  }, []);

  if (!instances.firebaseApp) {
    return null; // or a loading spinner
  }

  return (
    <FirebaseProvider
      firebaseApp={instances.firebaseApp}
      auth={instances.auth!}
      firestore={instances.firestore!}
    >
      {children}
    </FirebaseProvider>
  );
}
