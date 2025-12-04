'use server';
/**
 * @fileOverview A flow to grant admin privileges to a user.
 * 
 * - setAdmin - A function to set a user as an admin.
 * - SetAdminInput - The input type for the setAdmin function.
 * - SetAdminOutput - The return type for the setAdmin function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { config } from 'dotenv';

// Load environment variables from .env file
config();


const SetAdminInputSchema = z.object({
  uid: z.string().describe("The User ID (UID) to grant admin privileges to."),
});
export type SetAdminInput = z.infer<typeof SetAdminInputSchema>;

const SetAdminOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type SetAdminOutput = z.infer<typeof SetAdminOutputSchema>;

// Ensure Firebase Admin is initialized
function initializeFirebaseAdmin(): App | undefined {
    if (getApps().length > 0) {
        return getApps()[0];
    }
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountKey) {
        try {
            const serviceAccount = JSON.parse(serviceAccountKey);
            return initializeApp({
                credential: cert(serviceAccount),
            });
        } catch (e) {
            console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY or initialize Firebase Admin SDK:", e);
            return undefined;
        }
    }
    console.warn("FIREBASE_SERVICE_ACCOUNT_KEY not found. Admin features will not work.");
    return undefined;
}


const setAdminFlow = ai.defineFlow(
  {
    name: 'setAdminFlow',
    inputSchema: SetAdminInputSchema,
    outputSchema: SetAdminOutputSchema,
  },
  async ({ uid }) => {
    const adminApp = initializeFirebaseAdmin();
    if (!adminApp) {
        return { success: false, message: "Firebase Admin SDK not initialized. Cannot set admin." };
    }

    try {
      await getAuth(adminApp).setCustomUserClaims(uid, { isAdmin: true });
      return { success: true, message: `Successfully made user ${uid} an admin.` };
    } catch (error: any) {
      console.error("Error setting admin claim:", error);
      return { success: false, message: error.message || "An unknown error occurred." };
    }
  }
);

export async function setAdmin(input: SetAdminInput): Promise<SetAdminOutput> {
  return setAdminFlow(input);
}
