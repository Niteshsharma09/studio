
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/get-style-recommendation.ts';
import '@/ai/flows/virtual-try-on.ts';
import '@/ai/flows/chatbot.ts';

