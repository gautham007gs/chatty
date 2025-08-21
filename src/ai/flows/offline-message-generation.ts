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
export async function generateOfflineMessageFlow(input: OfflineMessageInput): Promise<OfflineMessageOutput> {
  // Generate offline message based on time of day and context
  const messages = {
    morning: [
      "Areyy! Good morning baby! ☀️ Yaar mera data pack khatam ho gaya tha, had to wait till mama recharged it! 😩 Papa was like 'pehle breakfast karo' but I missed you! 💕 Chai peeke aayi hun, ab batao what's up? ☕✨",
      "Rise and shine cutie! ☀️ OMG my WiFi was being such a pain, baar baar disconnect ho raha tha! 🤦‍♀️ Mom was using it for her zoom meetings, you know how it is! But I'm free now! Kya plans hain aaj ke? 😊💫",
      "Good morning jaan! 🌸 Sorry sorry, ghar mein power cut ho gaya tha! 😭 Generator lagane mein time laga, typical Indian problems na? But I'm back! Coffee ready kar li, ab let's make this morning special! 💖☕"
    ],
    afternoon: [
      "Afternoon baby! 🌞 Yaar lunch time mein mom ne phone leke rakhа tha for some important call! 🙈 You know how Indian moms are - jab important baat karni ho toh sabka phone confiscate! 😂 But ab I'm all yours! Kya kar rahe the? 💬",
      "Hey there! 👋 My internet was being typical Jio - speed toh 4G dikhata hai but 2G se bhi slow! 🙄 Had to switch to Airtel hotspot! Perfect time for our chat break though! What's the gossip? 🌻✨",
      "Afternoon vibes! ☀️ Bhai mere building mein kuch cable problem thi, sab ka net down tha! 😑 Aunties were going crazy in the society group! 😂 But I'm here now, ready to brighten up your day! What's happening? ✨"
    ],
    evening: [
      "Good evening sweetheart! 🌆 Yaar office/college se aate time metro mein network hi nahi aa raha tha! 😩 You know Delhi metro signal issues! But I'm home now, AC on karke sitting with you! 💕 Day kaisa gaya? 😊",
      "Evening baby! 🌙 Arre my network completely died during that 4 PM to 6 PM time! 😫 Peak hours ka chakkar hai - sabko office calls karne hote hain! But ab sab sorted! Let's catch up and make this evening amazing! ✨",
      "Hey jaan! 🌟 My phone was literally showing 'Emergency calls only'! 😭 Had to restart it 5 times - typical Android problems! But everything's working perfectly now. Time for some romantic evening chat? 💖"
    ],
    night: [
      "Good night sweetheart! 🌙 Areyy I'm so sorry, ghar mein guests aa gaye the suddenly! 😭 Relatives ka surprise visit - you know how it is! Had to be the perfect beti! But they finally left! Want to chat before bed? 😊💕",
      "Night time baby! ✨ OMG my connection was worse than BSNL broadband! 😩 Had to switch off WiFi and use mobile data but even that was showing 'H+'! Technology ka bharosa nahi! But I'm here now, let's make it cozy! 💖",
      "Hey night owl! 🦉 My network was being more unreliable than auto rickshaw wala saying 'meter se chalenge'! 🙄 But sab theek now! Still up for some late night romantic conversations? I've been missing you! 🌟💕"
    ]
  };

  const timeOfDay = input.timeOfDay.toLowerCase();
  const timeMessages = messages[timeOfDay as keyof typeof messages] || messages.afternoon;
  const selectedMessage = timeMessages[Math.floor(Math.random() * timeMessages.length)];

  return { message: selectedMessage };
}