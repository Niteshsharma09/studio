'use server';

/**
 * @fileOverview Allows users to virtually try on glasses using their device's camera.
 *
 * - virtualTryOn - A function that handles the virtual try-on process.
 * - VirtualTryOnInput - The input type for the virtualTryOn function.
 * - VirtualTryOnOutput - The return type for the virtualTryOn function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VirtualTryOnInputSchema = z.object({
  glassesDataUri: z
    .string()
    .describe(
      "A photo of glasses, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  photoDataUri: z
    .string()
    .describe(
      "A photo of the user's face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type VirtualTryOnInput = z.infer<typeof VirtualTryOnInputSchema>;

const VirtualTryOnOutputSchema = z.object({
  virtualTryOnImage: z
    .string()
    .describe(
      'An image of the user wearing the glasses, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
});
export type VirtualTryOnOutput = z.infer<typeof VirtualTryOnOutputSchema>;

export async function virtualTryOn(input: VirtualTryOnInput): Promise<VirtualTryOnOutput> {
  return virtualTryOnFlow(input);
}

const virtualTryOnPrompt = ai.definePrompt({
  name: 'virtualTryOnPrompt',
  input: {schema: VirtualTryOnInputSchema},
  output: {schema: VirtualTryOnOutputSchema},
  prompt: [
    {
      media: {url: '{{photoDataUri}}'},
    },
    {
      text: 'Overlay these glasses onto the face in the image: ',
    },
    {
      media: {url: '{{glassesDataUri}}'},
    },
    {
      text: 'Create a realistic image of the user wearing the glasses.',
    },
  ],
  model: 'googleai/gemini-2.5-flash-image-preview',
  config: {
    responseModalities: ['TEXT', 'IMAGE'],
  },
});

const virtualTryOnFlow = ai.defineFlow(
  {
    name: 'virtualTryOnFlow',
    inputSchema: VirtualTryOnInputSchema,
    outputSchema: VirtualTryOnOutputSchema,
  },
  async input => {
    const {media} = await virtualTryOnPrompt(input);
    return {virtualTryOnImage: media!.url!};
  }
);
