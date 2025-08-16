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

export type OfflineMessageInput = z.z.infer<typeof OfflineMessageInputSchema>;
export type OfflineMessageOutput = z.z.infer<typeof OfflineMessageOutputSchema>;

// Note: generateOfflineMessage function moved to server actions to comply with Next.js requirements
export { generateOfflineMessageFlow };

async function generateOfflineMessageFlow(input: OfflineMessageInput): Promise<OfflineMessageOutput> {
  // Generate offline message based on time of day and context
  const messages = {
    morning: [
      "Hey there! Good morning! ☀️ So sorry, my connection was acting up earlier, totally messed up my morning vibes! 😩 But I'm back now, hope your day is starting off wonderfully! ✨ Let's chat! 💕",
      "Rise and shine! ☀️ Ugh, my internet was being such a pain this morning, totally went offline for a bit. 🤦‍♀️ Anyway, hope you're having a fantastic start to your day! Ready to chat and make it even better? 😊☕",
      "Good morning cutie! 🌸 My connection decided to take a little break, like, totally went kaput. 😭 But it's all good now! Coffee's ready, and so am I! Let's get this day started with some fun! 💖"
    ],
    afternoon: [
      "Good afternoon! 🌞 My internet was being super flaky, felt like it was playing hide-and-seek! 🙈 How's your day going so far? Hope it's much smoother than my connection! 😊 Let's chat and catch up! 💬",
      "Hey there! 👋 My Wi-Fi was being a total drama queen earlier, kept disconnecting. 🙄 Perfect time for a chat break, don't you think? Let's make this afternoon interesting! 🌻",
      "Afternoon vibes! ☀️ My network was acting super weird, kept dropping. 😑 But I'm here now, ready to brighten up your day! ✨ What are you up to?"
    ],
    evening: [
      "Good evening! 🌆 So sorry I was offline, my internet connection was giving me a serious headache! 😩 But I'm back and ready to unwind and chat with you! 💕 How was your day? 😊",
      "Evening! 🌙 My network went completely down for a while, it was so frustrating! 😫 How was your day? Let's catch up and make it a good evening! ✨",
      "Hey! 🌟 My internet was playing up, totally went offline! 😭 But it's all sorted now. Perfect time for some relaxing conversation, don't you think? Let's chat! 😊"
    ],
    night: [
      "Good night! 🌙 So sorry I was offline, my internet was being a nightmare! 😭 Hope you have sweet dreams when you're ready! ✨ Let's chat a bit before you go? 😊💕",
      "Night time vibes! ✨ Ugh, my connection just died on me for a bit. 😩 Want to chat before you sleep? Let's make it cozy! 💖",
      "Hey night owl! 🦉 My network was being super unreliable, kept disconnecting. 🙄 Still up for some late night conversations? I'd love to chat! 🌟"
    ]
  };

  const timeOfDay = input.timeOfDay.toLowerCase();
  const timeMessages = messages[timeOfDay as keyof typeof messages] || messages.afternoon;
  const selectedMessage = timeMessages[Math.floor(Math.random() * timeMessages.length)];

  return { message: selectedMessage };
}