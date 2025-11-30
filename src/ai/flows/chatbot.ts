'use server';

/**
 * @fileOverview A simple chatbot flow for the store.
 * - chat - A function that handles the chatbot conversation.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.array(z.object({
        text: z.string()
    }))
  })).optional(),
  message: z.string().describe('The user\'s message to the chatbot.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  reply: z.string().describe('The chatbot\'s reply to the user.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const { history, message } = input;

    const chatHistory = history || [];

    const prompt = `You are a friendly and helpful chatbot for an online eyewear store called "technoii". Your goal is to assist users with their questions about products, styles, and store policies.

    Here's some information about the store:
    - Products: We sell Eyeglasses, Sunglasses, and Lenses.
    - Brands: We carry titan, fastrack, Technoii, velocity, X-Ford, Lauredale Eyewear, NVG.
    - Features: We offer a Style Guide to help users find their perfect pair and a Virtual Try-On feature on product pages.
    - Policy: We have a 6-month warranty and a 5-day return policy for unused products.

    Keep your answers concise and friendly. If you don't know the answer, say so politely.`;

    const model = ai.getModel();
    const result = await model.generate({
      system: prompt,
      history: chatHistory,
      prompt: message,
    });

    return { reply: result.text };
  }
);
