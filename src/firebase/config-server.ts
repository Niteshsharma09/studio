
// This file contains the server-side configuration for Firebase Admin.
// It is crucial that this file is ONLY used in server-side environments
// and never exposed to the client.

// The service account key is now expected to be a Base64 encoded string
// stored in an environment variable.
const serviceAccountKeyBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountKeyBase64) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set. Server-side Firebase features will not work.");
}

// Decode the Base64 string to get the original JSON string
const serviceAccountJson = Buffer.from(serviceAccountKeyBase64, 'base64').toString('utf8');
const serviceAccount = JSON.parse(serviceAccountJson);

export const firebaseAdminConfig = {
    credential: {
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key,
    },
};
