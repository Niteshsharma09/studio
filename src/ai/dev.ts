
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/get-style-recommendation.ts';
import '@/ai/flows/virtual-try-on.ts';
import '@/ai/flows/chatbot.ts';
import { setAdmin } from '@/ai/flows/set-admin.ts';

// This file is now only for starting the Genkit Developer UI.
// To set an admin, please run `npm run set-admin`
