
'use client';

// This file is the single entrypoint for all Firebase-related client-side code.

import {
  FirebaseProvider,
  useFirebase,
  useFirebaseApp,
  useAuth,
  useFirestore,
  useStorage,
} from './provider';
import { useUser } from './auth/use-user';
import { useOrders } from './firestore/use-orders';
import { useAdmin } from './auth/use-admin';


export {
    FirebaseProvider,
    useFirebase,
    useFirebaseApp,
    useAuth,
    useFirestore,
    useStorage,
    useUser,
    useOrders,
    useAdmin,
};

    