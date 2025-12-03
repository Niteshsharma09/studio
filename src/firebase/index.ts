
'use client';

// This file is the single entrypoint for all Firebase-related client-side code.

import {
  FirebaseProvider,
  useFirebase,
  useFirebaseApp,
  useAuth,
  useFirestore,
} from './provider';
import { useUser } from './auth/use-user';
import { useOrders } from './firestore/use-orders';


export {
    FirebaseProvider,
    useFirebase,
    useFirebaseApp,
    useAuth,
    useFirestore,
    useUser,
    useOrders,
};
