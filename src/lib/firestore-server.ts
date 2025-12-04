
import { initializeApp, getApps, cert, getApp, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;

// This function initializes the admin app, parsing the service account key
// from environment variables. It's robust and ensures a single initialization.
function initializeFirebaseAdmin() {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  const serviceAccountKeyBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKeyBase64) {
    console.error("FIREBASE_SERVICE_ACCOUNT_KEY is not set. Server-side Firestore will not be available.");
    return null;
  }

  try {
    const serviceAccountJson = Buffer.from(serviceAccountKeyBase64, 'base64').toString('utf8');
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    return initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (e) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY or initialize Firebase Admin SDK. Make sure it is a valid Base64 encoded JSON string.", e);
    return null;
  }
}

// Initialize the app
app = initializeFirebaseAdmin()!;

// Export the db instance. It will be undefined if initialization failed.
export const db = app ? getFirestore(app) : undefined;
