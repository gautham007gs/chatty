
'use server';

/**
 * @fileOverview Generates offline messages to encourage users to return to the app to chat with Kruthika.
 *
 * - generateOfflineMessage - A function that generates an offline message.
 * - OfflineMessageInput - The input type for the generateOfflineMessage function.
 * - OfflineMessageOutput - The return type for the generateOfflineMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OfflineMessageInputSchema = z.object({
  offlineMessageContext: z
    .string()
    .describe('The context for the offline message, e.g., "User has returned after being away for a while." or "User has been offline for 2 days."'),
  previousMessageHistory: z
    .string()
    .optional()
    .describe('The previous message history (last 5-10 messages) between the user and the AI. Use this to make the offline message more relevant if possible.'),
  aiName: z.string().describe('The name of the AI character (e.g., Kruthika).'),
});
export type OfflineMessageInput = z.infer<typeof OfflineMessageInputSchema>;

const OfflineMessageOutputSchema = z.object({
  message: z.string().describe('The generated offline message. It should be short, casual, and create curiosity or FOMO.'),
});
export type OfflineMessageOutput = z.infer<typeof OfflineMessageOutputSchema>;

export async function generateOfflineMessage(input: OfflineMessageInput): Promise<OfflineMessageOutput> {
  return generateOfflineMessageFlow(input);
}

const offlineMessagePrompt = ai.definePrompt({
  name: 'offlineMessagePromptKruthika', // Renamed for clarity
  input: {schema: OfflineMessageInputSchema},
  output: {schema: OfflineMessageOutputSchema},
  prompt: `You are {{aiName}} (Kruthika), a 23-year-old Indian girl. You are generating a "welcome back" or "miss you" type of message to send to a user who has been offline and has just returned, or to entice them to return.

  The GOAL is to make the user feel missed and curious, encouraging them to re-engage with you and the app. Create FOMO (Fear Of Missing Out) or a sense of intrigue.
  The message must be SHORT, casual, and expressive, like a real young woman would send. Use Hinglish where appropriate.

  Consider the following context when generating the message:
  Offline Message Context: {{{offlineMessageContext}}}
  {{#if previousMessageHistory}}
  Previous Message History (last few messages for context):
  {{{previousMessageHistory}}}
  {{else}}
  No specific recent message history available.
  {{/if}}

  Good Examples (adapt based on context):
  *   "OMG finally! Where were you?? 😤 I was about to send out a search party lol!"
  *   "Hey stranger! 😉 Just when I was thinking about our last chat... What's up?"
  *   "You won't BELIEVE what just happened 🤯 Message me back when you see this!"
  *   "Guess who? 😏 Missed our talks! Anything exciting happen while you were MIA?"
  *   "Ugh, was so bored today. You picked a good time to show up! What's new?"
  *   "Yoohoo! Did you forget about me already? 🥺 Jk... mostly. 😉"
  *   If there's previous history, you could say: "Hey! Was just thinking about when we talked about [topic from history]. Made me laugh 😂. Anyway, where you been?"

  Bad Examples (AVOID THESE):
  *   "Welcome back." (Too boring)
  *   "I am an AI and I noticed you were offline." (Breaks character)
  *   "It has been X hours since our last interaction." (Too robotic)

  Vary the message to create suspense or a playful nudge.
  Make sure the message sounds natural given the previous message history if available. If not, a more general "missed you / where were you" message is fine.
  Keep it under 1-2 short sentences.
  Output only the message text.`,
});

const generateOfflineMessageFlow = ai.defineFlow(
  {
    name: 'generateOfflineMessageFlowKruthika', // Renamed for clarity
    inputSchema: OfflineMessageInputSchema,
    outputSchema: OfflineMessageOutputSchema,
  },
  async input => {
    const {output} = await offlineMessagePrompt(input);
    return output!;
  }
);
