
import { initializeApp, getApps, cert, getApp, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;

try {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined;
  
  if (serviceAccount) {
    app = !getApps().length
      ? initializeApp({
          credential: cert(serviceAccount),
        })
      : getApp();
  } else {
    console.warn("Firebase Service Account Key not found. Firestore server-side features will not be available.");
    if (getApps().length) {
      app = getApp();
    }
  }
} catch (e) {
  console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY or initialize Firebase Admin SDK:", e);
}


// @ts-ignore - app might be uninitialized
export const db = app ? getFirestore(app) : undefined;
