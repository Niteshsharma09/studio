
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/get-style-recommendation.ts';
import '@/ai/flows/virtual-try-on.ts';
import '@/ai/flows/chatbot.ts';
import { setAdmin } from '@/ai/flows/set-admin.ts';

// To set an admin user, get their UID from the app's user menu,
// paste it below, then run `npm run genkit:dev` in your terminal.
// After it runs, you can remove the code.


setAdmin({ uid: "1d54RntVoYRPOlEpuS5AxuvKLKC3" })
  .then(console.log)
  .catch(console.error)
  .finally(() => process.exit());

