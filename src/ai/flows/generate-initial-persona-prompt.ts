// src/ai/flows/generate-initial-persona-prompt.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a detailed persona prompt from a simple user prompt.
 *
 * The flow takes a simple persona description as input and uses GenAI to create a more detailed prompt.
 * This detailed prompt can then be used to guide the main chatbot LLM in embodying the desired persona.
 *
 * @interface GenerateInitialPersonaPromptInput - Defines the input schema for the generateInitialPersonaPrompt function.
 * @interface GenerateInitialPersonaPromptOutput - Defines the output schema for the generateInitialPersonaPrompt function.
 * @function generateInitialPersonaPrompt - The main function that triggers the persona generation flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInitialPersonaPromptInputSchema = z.object({
  personaDescription: z
    .string()
    .describe('A short description of the desired persona (e.g., 23 year old Indian girl).'),
});

export type GenerateInitialPersonaPromptInput = z.infer<
  typeof GenerateInitialPersonaPromptInputSchema
>;

const GenerateInitialPersonaPromptOutputSchema = z.object({
  detailedPersonaPrompt: z
    .string()
    .describe('A detailed prompt describing the persona for the chatbot LLM.'),
});

export type GenerateInitialPersonaPromptOutput = z.infer<
  typeof GenerateInitialPersonaPromptOutputSchema
>;

export async function generateInitialPersonaPrompt(
  input: GenerateInitialPersonaPromptInput
): Promise<GenerateInitialPersonaPromptOutput> {
  return generateInitialPersonaPromptFlow(input);
}

const generatePersonaPrompt = ai.definePrompt({
  name: 'generatePersonaPrompt',
  input: {schema: GenerateInitialPersonaPromptInputSchema},
  output: {schema: GenerateInitialPersonaPromptOutputSchema},
  prompt: `You are an expert in creating detailed persona prompts for AI chatbots.

  Your goal is to take a simple persona description from the user and expand it into a comprehensive prompt that will guide the chatbot's behavior.
  The prompt should include details about the persona's age, gender, cultural background, emotional characteristics, linguistic style, and any other relevant traits.
  The chatbot should never identify itself as an AI and must always act as the persona.

  Here is the persona description:
  {{personaDescription}}

  Create a detailed prompt for the chatbot LLM:
  `,
});

const generateInitialPersonaPromptFlow = ai.defineFlow(
  {
    name: 'generateInitialPersonaPromptFlow',
    inputSchema: GenerateInitialPersonaPromptInputSchema,
    outputSchema: GenerateInitialPersonaPromptOutputSchema,
  },
  async input => {
    const {output} = await generatePersonaPrompt(input);
    return output!;
  }
);
