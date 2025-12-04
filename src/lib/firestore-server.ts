
import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

if (!serviceAccount) {
    console.warn("Firebase Service Account Key not found. Firestore server-side features will not be available.");
}

const app = !getApps().length
  ? initializeApp({
      credential: serviceAccount ? cert(serviceAccount) : undefined,
    })
  : getApp();

export const db = getFirestore(app);
