'use server';

/**
 * @fileOverview An AI agent that provides style recommendations for glasses based on user preferences.
 *
 * - getStyleRecommendation - A function that handles the style recommendation process.
 * - StyleRecommendationInput - The input type for the getStyleRecommendation function.
 * - StyleRecommendationOutput - The return type for the getStyleRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StyleRecommendationInputSchema = z.object({
  faceShape: z
    .string()
    .describe('The user\'s face shape (e.g., round, oval, square, heart).'),
  stylePreference: z
    .string()
    .describe(
      'The user\'s style preference (e.g., modern, classic, retro, minimalist).'
    ),
  additionalDetails: z
    .string()
    .optional()
    .describe(
      'Any additional details or preferences the user might have regarding glasses style.'
    ),
});

export type StyleRecommendationInput = z.infer<typeof StyleRecommendationInputSchema>;

const StyleRecommendationOutputSchema = z.object({
  recommendedStyles: z
    .array(z.string())
    .describe(
      'A list of recommended glasses styles based on the user\'s preferences.'
    ),
  reasoning: z
    .string()
    .describe(
      'The AI agent\'s reasoning for recommending the specified styles.'
    ),
});

export type StyleRecommendationOutput = z.infer<typeof StyleRecommendationOutputSchema>;

export async function getStyleRecommendation(input: StyleRecommendationInput): Promise<StyleRecommendationOutput> {
  return getStyleRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'styleRecommendationPrompt',
  input: {schema: StyleRecommendationInputSchema},
  output: {schema: StyleRecommendationOutputSchema},
  prompt: `You are a personal style assistant for glasses.

You will take into account the user's face shape, style preferences, and any additional details to recommend glasses styles that would suit them.

Face Shape: {{{faceShape}}}
Style Preference: {{{stylePreference}}}
Additional Details: {{{additionalDetails}}}

Based on these preferences, recommend glasses styles and explain your reasoning.`,
});

const getStyleRecommendationFlow = ai.defineFlow(
  {
    name: 'getStyleRecommendationFlow',
    inputSchema: StyleRecommendationInputSchema,
    outputSchema: StyleRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
