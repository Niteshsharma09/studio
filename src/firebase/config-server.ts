
// This file contains the server-side configuration for Firebase Admin.
// It is crucial that this file is ONLY used in server-side environments
// and never exposed to the client.

// The service account key is now expected to be a Base64 encoded string
// stored in an environment variable.
const serviceAccountKeyBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountKeyBase64) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set. Server-side Firebase features will not work.");
}

let serviceAccount: any;
try {
    // Decode the Base64 string to get the original JSON string
    const serviceAccountJson = Buffer.from(serviceAccountKeyBase64, 'base64').toString('utf8');
    serviceAccount = JSON.parse(serviceAccountJson);
} catch (e) {
    console.error("Failed to parse Firebase service account key. Make sure it's a valid Base64 encoded JSON string.", e);
    throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT_KEY.");
}


export const firebaseAdminConfig = {
    credential: {
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key,
    },
};
