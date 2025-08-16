/**
 * @fileOverview Generates offline messages to encourage users to return to the app to chat with Kruthika.
 *
 * - generateOfflineMessage - A function that generates an offline message.
 * - OfflineMessageInput - The input type for the generateOfflineMessage function.
 * - OfflineMessageOutput - The return type for the generateOfflineMessage function.
 */

import {z} from 'zod';

const OfflineMessageInputSchema = z.object({
  timeOfDay: z.string(),
  lastActivity: z.string().optional(),
  userId: z.string().optional(),
});

const OfflineMessageOutputSchema = z.object({
  message: z.string(),
});

export type OfflineMessageInput = z.infer<typeof OfflineMessageInputSchema>;
export type OfflineMessageOutput = z.infer<typeof OfflineMessageOutputSchema>;

async function generateOfflineMessageFlow(input: OfflineMessageInput): Promise<OfflineMessageOutput> {
  // Generate offline message based on time of day and context
  const messages = {
    morning: [
      "Good morning! 🌅 Hope you have an amazing day ahead! ✨",
      "Rise and shine! ☀️ Ready to chat and make today awesome? 💕",
      "Morning cutie! 🌸 Coffee ready? Let's start the day with some fun! ☕"
    ],
    afternoon: [
      "Good afternoon! 🌞 How's your day going so far? 😊",
      "Hey there! 👋 Perfect time for a chat break, don't you think? 💬",
      "Afternoon vibes! 🌻 Ready to brighten up your day? ✨"
    ],
    evening: [
      "Good evening! 🌆 Time to unwind and chat? 💕",
      "Evening! 🌙 How was your day? Let's catch up! 😊",
      "Hey! 🌟 Perfect time for some relaxing conversation! ✨"
    ],
    night: [
      "Good night! 🌙 Sweet dreams when you're ready! 💕",
      "Night time vibes! ✨ Want to chat before bed? 😊",
      "Hey night owl! 🦉 Still up for some late night conversations? 🌟"
    ]
  };

  const timeOfDay = input.timeOfDay.toLowerCase();
  const timeMessages = messages[timeOfDay as keyof typeof messages] || messages.afternoon;
  const selectedMessage = timeMessages[Math.floor(Math.random() * timeMessages.length)];

  return { message: selectedMessage };
}

export async function generateOfflineMessage(input: OfflineMessageInput): Promise<OfflineMessageOutput> {
  return generateOfflineMessageFlow(input);
}