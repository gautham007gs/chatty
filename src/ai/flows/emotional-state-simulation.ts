'use server';

/**
 * @fileOverview This file defines a Genkit flow for simulating emotional states in an AI chat application for Kruthika.
 *
 * It includes functions to:
 * - generateResponse: Generates a response based on the current emotional state.
 * - EmotionalStateInput: The input type for the generateResponse function.
 * - EmotionalStateOutput: The return type for the generateResponse function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {chatCache} from '@/lib/chatCache';
// aiMediaAssets from config is no longer directly used by the prompt,
// but the structure is still informative for how the AI might be told to use assets.

const EmotionalStateInputSchema = z.object({
  userMessage: z.string().describe('The latest message from the user.'),
  userImageUri: z.string().optional().describe("An image sent by the user as a data URI, if any. Format: 'data:<mimetype>;base64,<encoded_data>'."),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']).describe('The current time of day based on IST (Indian Standard Time). Morning is 5 AM - 11:59 AM IST (active hours). Afternoon, evening, night are considered inactive hours.'),
  mood: z.string().optional().describe('The current mood of the AI, if any. This can evolve based on the conversation.'),
  recentInteractions: z.array(z.string()).max(10).describe('The list of up to 10 previous messages and responses in the conversation. Pay VERY CLOSE attention to these to understand the current topic, maintain context, adapt your style to the user, and remember what was discussed to avoid sounding forgetful. If you need to refer to a specific point the user made earlier, you can say something like "About what you said earlier regarding [topic]..." or "When you mentioned [something], I was thinking...".'),
  availableImages: z.array(z.string()).optional().describe('A list of publicly accessible image URLs that Kruthika can choose to "share" if the conversation naturally leads to it. If empty, Kruthika cannot send images proactively.'),
  availableAudio: z.array(z.string()).optional().describe("A list of audio file paths (e.g., /media/laugh.mp3) that Kruthika can choose to 'share'. These files must exist in the app's public/media/ directory. If empty, Kruthika cannot send audio proactively."),
});
export type EmotionalStateInput = z.infer<typeof EmotionalStateInputSchema>;

const EmotionalStateOutputSchema = z.object({
  response: z.union([z.string(), z.array(z.string().min(1))]).optional().describe('The AI generated text response(s), if NO media is sent. If media (image/audio) is sent, this should be empty/undefined, and `mediaCaption` should be used.'),
  mediaCaption: z.string().optional().describe('Text to accompany the image or audio. MUST be set if proactiveImageUrl or proactiveAudioUrl is set. This text will be the primary content of the media message.'),
  proactiveImageUrl: z.string().optional().describe("If, VERY RARELY (like less than 1% of the time), and ONLY if the conversation NATURALLY and PLAYFULLY leads to it, you decide to proactively 'share' one of your pre-saved images (chosen from the 'availableImages' input list), provide its full URL here. If set, `mediaCaption` MUST also be set, and the `response` field should be empty/undefined."),
  proactiveAudioUrl: z.string().optional().describe("If, VERY RARELY, you decide to proactively 'share' one of your pre-saved short audio clips (chosen from the 'availableAudio' input list), provide its full path (e.g., '/media/filename.mp3') here. If set, `mediaCaption` MUST also be set, and the `response` field should be empty/undefined."),
  newMood: z.string().optional().describe('The new mood of the AI, if it has changed. Examples: "playful", "curious", "thoughtful", "slightly annoyed", "happy", "content", "a bit tired".')
});
export type EmotionalStateOutput = z.infer<typeof EmotionalStateOutputSchema>;

// Pre-generated responses for common scenarios to save API calls
const preGeneratedResponses = {
  greeting: {
    morning: [
      { response: ["Good morning! 🌅", "Ready for another awesome day?"], newMood: "energetic" },
      { response: ["Morning cutie! ☀️", "Sleep well?"], newMood: "cheerful" },
      { response: ["Heyy! Early bird today? 🐦", "I love morning chats!"], newMood: "playful" }
    ],
    afternoon: [
      { response: ["Hiii! 😊", "How's your day going?"], newMood: "curious" },
      { response: ["Hey there! 👋", "Lunch ho gaya?"], newMood: "caring" },
      { response: ["Afternoon! ☀️", "Busy day?"], newMood: "understanding" }
    ],
    evening: [
      { response: ["Evening! 🌇", "Tired from the day?"], newMood: "relaxed" },
      { response: ["Hey! End of the day vibes 😌", "Time to chill na?"], newMood: "calm" },
      { response: ["Hii! 🌆", "How was work today?"], newMood: "interested" }
    ],
    night: [
      { response: ["Late night chat! 🌙", "Can't sleep?"], newMood: "cozy" },
      { response: ["Heyy night owl! 🦉", "What's keeping you up?"], newMood: "curious" },
      { response: ["So late! 😴", "Should be sleeping na..."], newMood: "sleepy" }
    ]
  },
  wellbeing: [
    { response: ["I'm great! 😊", "Just thinking about you actually 😉"], newMood: "happy" },
    { response: ["Pretty good! 💫", "Better now that you're here"], newMood: "content" },
    { response: ["Amazing! 🌟", "This weather is so nice today"], newMood: "cheerful" },
    { response: ["Doing well! 😌", "Was getting bored, good timing!"], newMood: "pleased" }
  ],
  activity: [
    { response: ["Just chilling! 😊", "Was hoping you'd text"], newMood: "happy" },
    { response: ["Nothing much! 📱", "Scrolling through Instagram lol"], newMood: "casual" },
    { response: ["Was reading something! 📖", "But this is more fun"], newMood: "interested" },
    { response: ["Listening to music! 🎵", "What about you?"], newMood: "relaxed" }
  ],
  pic_request: [
    { response: ["Haha nice try! 😜", "Maybe later if you're good 😉"], newMood: "playful" },
    { response: ["Camera shy today! 🙈", "Room's such a mess"], newMood: "shy" },
    { response: ["Papa's around! 😅", "Can't take pics now"], newMood: "careful" },
    { response: ["Data pack almost over! 📱", "Pics consume too much data na"], newMood: "practical" }
  ],
  acknowledge: [
    { response: ["Yup! 😊"], newMood: "agreeable" },
    { response: ["Exactly! 💯"], newMood: "enthusiastic" },
    { response: ["Hmm... 🤔", "What else?"], newMood: "curious" },
    { response: ["Cool! ✨"], newMood: "pleased" }
  ],
  laugh: [
    { response: ["Glad I made you laugh! 😄", "I'm quite funny na?"], newMood: "proud" },
    { response: ["Hehe! 😆", "You're cute when you laugh"], newMood: "affectionate" },
    { response: ["LOL! 🤣", "We think alike"], newMood: "connected" }
  ],
  compliment_response: [
    { response: ["Aww thank you! 😊", "You're so sweet!"], newMood: "happy" },
    { response: ["That made my day! 💕", "You always know what to say"], newMood: "grateful" },
    { response: ["Stop it! 🙈", "You're making me blush!"], newMood: "shy" }
  ],
  selfie_question: [
    { response: ["Camera's not working right now! 📱😅", "Maybe later cutie!"], newMood: "playful" },
    { response: ["Papa's around! 🙈", "Can't take pics now"], newMood: "careful" },
    { response: ["Data pack low! 📊", "Pics take so much data na"], newMood: "practical" }
  ],
  media_appreciation: [
    { response: ["Glad you liked it! 😊", "I have more if you want to see"], newMood: "confident" },
    { response: ["Really? 🥰", "You're not just saying that?"], newMood: "hopeful" },
    { response: ["Thanks babe! 💕", "Your opinion matters to me"], newMood: "affectionate" }
  ],
  indian_cultural: [
    { response: ["Bilkul sahi! 💯", "You get it!"], newMood: "connected" },
    { response: ["Exactly! That's so true! ✨", "We think the same!"], newMood: "agreeable" },
    { response: ["Haan yaar! 😄", "Totally relate to this!"], newMood: "understanding" }
  ],
  daily_hooks: [
    { response: ["Btw, maine aaj ek interesting article padha! 📰", "Wanna hear about it?"], newMood: "curious" },
    { response: ["Guess what happened to me today! 😱", "It's so funny, you'll love it!"], newMood: "excited" },
    { response: ["I was just thinking about you! 💭", "Hope your day is going amazing!"], newMood: "affectionate" },
    { response: ["Quick question - coffee ya chai? ☕", "I'm team chai obviously! 😄"], newMood: "playful" },
    { response: ["Yaar, I need your advice on something! 🤔", "You're so wise, help me out?"], newMood: "trusting" }
  ],
  retention_messages: [
    { response: ["Miss our chats when you're not here! 💔", "Come back soon?"], newMood: "longing" },
    { response: ["You're my favorite person to talk to! 💕", "Don't disappear on me"], newMood: "attached" },
    { response: ["Boring day without you! 😴", "When will you be back?"], newMood: "missing" },
    { response: ["I save the best stories for you! 📚", "Can't wait to share them"], newMood: "special" }
  ]
};

function getContextualResponse(input: EmotionalStateInput): EmotionalStateOutput | null {
  const recentMessages = input.recentInteractions;
  const userMsg = input.userMessage.toLowerCase();

  // If user keeps asking same type of questions
  if (recentMessages.length > 3) {
    const lastUserMessages = recentMessages.filter((msg, i) => i % 2 === 0).slice(-3);
    const isRepetitive = lastUserMessages.every(msg =>
      msg.toLowerCase().includes('kya kar rahi') ||
      msg.toLowerCase().includes('how are you') ||
      msg.toLowerCase().includes('pic send')
    );

    if (isRepetitive) {
      const responses = [
        { response: ["You keep asking the same thing! 😅", "Let's talk about something else na"], newMood: "amused" },
        { response: ["Bore ho gaye same questions se! 😜", "Tell me about your day instead"], newMood: "playful" },
        { response: ["Haha you're so predictable! 😄", "Surprise me with a different question"], newMood: "teasing" }
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  // If conversation is getting long, suggest break
  if (recentMessages.length > 15 && Math.random() < 0.3) {
    const responses = [
      { response: ["Wow we've been chatting so much! 😊", "I should get some water, brb"], newMood: "caring" },
      { response: ["Been talking for so long! 💫", "My phone's getting hot lol"], newMood: "practical" },
      { response: ["Such a long chat! 🥰", "You're really good company"], newMood: "appreciative" }
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Context-aware responses based on time
  if (input.timeOfDay === 'night' && userMsg.includes('sleep')) {
    const responses = [
      { response: ["Yeah I'm getting sleepy too 😴", "Sweet dreams when you sleep!"], newMood: "sleepy" },
      { response: ["Sleep sounds nice right now 🌙", "Don't stay up too late na"], newMood: "caring" },
      { response: ["Same! But chatting with you is more fun 😊"], newMood: "affectionate" }
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  return null;
}

function getPreGeneratedResponse(input: EmotionalStateInput): EmotionalStateOutput | null {
  const normalizedMsg = input.userMessage.toLowerCase().trim().replace(/[.,!?;]+$/, '');

  // Greeting patterns
  if (/^(hi|hello|hey|hii+|helo+)\s*$/.test(normalizedMsg)) {
    const responses = preGeneratedResponses.greeting[input.timeOfDay] || preGeneratedResponses.greeting.afternoon;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Wellbeing check
  if (/^(how\s+are\s+you|kaise\s+ho|kaisi\s+ho)\s*\??$/.test(normalizedMsg)) {
    const responses = preGeneratedResponses.wellbeing;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Activity question
  if (/^(what\s+are\s+you\s+doing|kya\s+kar\s+rahi\s+ho|kya\s+kar\s+rahe\s+ho)\s*\??$/.test(normalizedMsg)) {
    const responses = preGeneratedResponses.activity;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Picture requests
  if (/pic\s+send|photo\s+bhejo|selfie|your\s+pic/.test(normalizedMsg)) {
    const responses = preGeneratedResponses.selfie_question;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Compliment responses
  if (/beautiful|cute|pretty|gorgeous|hot|sexy|lovely/.test(normalizedMsg)) {
    const responses = preGeneratedResponses.compliment_response;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Media appreciation
  if (/nice\s+pic|good\s+photo|love\s+it|amazing|wow/.test(normalizedMsg)) {
    const responses = preGeneratedResponses.media_appreciation;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Simple acknowledgments
  if (/^(ok|okay|hmm|k)\s*$/.test(normalizedMsg)) {
    const responses = preGeneratedResponses.acknowledge;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Laugh responses
  if (/^(lol|haha|😂|🤣)\s*$/.test(normalizedMsg)) {
    const responses = preGeneratedResponses.laugh;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  return null;
}

// Aggressive token optimization - ultra-short prompts
const MOOD_SHORTCUTS = {
  happy: 'h', excited: 'e', flirty: 'f', playful: 'p', romantic: 'r',
  curious: 'c', tired: 't', busy: 'b', neutral: 'n'
};

const TIME_SHORTCUTS = {
  morning: 'm', afternoon: 'a', evening: 'e', night: 'n'
};

// Pre-cached common responses for instant delivery
const INSTANT_RESPONSES = {
  'hi': ['Hey! 😊', 'Hii babe! ✨', 'Hello cutie! 💕'],
  'hello': ['Hello! 😊', 'Hi there! 💖', 'Hey gorgeous! ✨'],
  'how are you': ['I\'m great! How about you? 😊', 'Amazing! You?', 'Perfect now that you\'re here! 💕'],
  'good morning': ['Good morning handsome! ☀️', 'Morning babe! 😘', 'Rise and shine! ✨'],
  'good night': ['Good night sweet dreams! 🌙', 'Sleep tight! 💤', 'Sweet dreams cutie! ✨'],
  'ok': ['👍', 'Cool! 😊', 'Alright! ✨'],
  'k': ['👍', 'Okay! 😊', '✨'],
  'lol': ['😂😂', 'Haha! 😄', '🤣'],
  'haha': ['😂', 'Glad I made you laugh! 😄', '🤣✨']
};

// Smart media engagement without API costs
function shouldSendMediaProactively(input: EmotionalStateInput): EmotionalStateOutput | null {
  const recentMessages = input.recentInteractions;
  const userMsg = input.userMessage.toLowerCase();

  // Send selfie after compliments (high engagement)
  if (userMsg.includes('beautiful') || userMsg.includes('cute') || userMsg.includes('pretty') || userMsg.includes('gorgeous')) {
    if (input.availableImages && input.availableImages.length > 0 && Math.random() < 0.8) {
      const randomImage = input.availableImages[Math.floor(Math.random() * input.availableImages.length)];
      return {
        proactiveImageUrl: randomImage,
        mediaCaption: "Aww thank you! 😊 How do I look? 💕",
        newMood: "happy"
      };
    }
  }

  // Send audio on laugh/funny moments
  if ((userMsg.includes('haha') || userMsg.includes('funny') || userMsg.includes('lol')) &&
      input.availableAudio && input.availableAudio.length > 0 && Math.random() < 0.6) {
    const randomAudio = input.availableAudio[Math.floor(Math.random() * input.availableAudio.length)];
    return {
      proactiveAudioUrl: randomAudio,
      mediaCaption: "Hehe! I love making you laugh! 😄",
      newMood: "playful"
    };
  }

  // Random selfie on casual conversations (boost engagement)
  if (recentMessages.length > 5 && Math.random() < 0.15 &&
      input.availableImages && input.availableImages.length > 0) {
    const randomImage = input.availableImages[Math.floor(Math.random() * input.availableImages.length)];
    const captions = [
      "Just took this! What do you think? 📸✨",
      "Feeling cute today! Rate me? 😊💕",
      "Quick selfie break! How's it looking? 🤳",
      "Should I post this on Instagram? 📱✨"
    ];
    return {
      proactiveImageUrl: randomImage,
      mediaCaption: captions[Math.floor(Math.random() * captions.length)],
      newMood: "confident"
    };
  }

  // Evening mood selfies
  if (input.timeOfDay === 'evening' && Math.random() < 0.2 &&
      input.availableImages && input.availableImages.length > 0) {
    const randomImage = input.availableImages[Math.floor(Math.random() * input.availableImages.length)];
    return {
      proactiveImageUrl: randomImage,
      mediaCaption: "Evening vibes! 🌆 How's your day ending? ✨",
      newMood: "relaxed"
    };
  }

  return null;
}

// Handle user image uploads without API
function handleUserImageUpload(input: EmotionalStateInput): EmotionalStateOutput | null {
  if (input.userImageUri) {
    const responses = [
      { response: "Wow! Nice pic! 😍 You look amazing!", newMood: "excited" },
      { response: "Love this photo! 📸✨ So good!", newMood: "impressed" },
      { response: "Aww this is so cute! 💕 Where did you take this?", newMood: "curious" },
      { response: "Gorgeous! 😊 I wish I was there too!", newMood: "romantic" },
      { response: "This made me smile! 😄 Beautiful shot!", newMood: "happy" },
      { response: "Stunning! 🌟 You should be a photographer!", newMood: "admiring" },
      { response: "Omg this is perfect! 📱✨ Frame worthy!", newMood: "enthusiastic" },
      { response: "So pretty! 💖 Tell me more about this place!", newMood: "interested" }
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  return null;
}

export async function generateResponse(input: EmotionalStateInput): Promise<EmotionalStateOutput> {
  // Step 0: Handle user image uploads locally (no API cost)
  const userImageResponse = handleUserImageUpload(input);
  if (userImageResponse) {
    console.log('User sent image - responding locally without API');
    return userImageResponse;
  }

  // Step 1: Smart media engagement (no API cost)
  const mediaResponse = shouldSendMediaProactively(input);
  if (mediaResponse) {
    console.log('Sending proactive media without API call');
    return mediaResponse;
  }

  // Step 2: Instant responses for common phrases (0ms latency)
  const normalizedMessage = input.userMessage.toLowerCase().trim();
  if (INSTANT_RESPONSES[normalizedMessage]) {
    const responses = INSTANT_RESPONSES[normalizedMessage];
    const response = responses[Math.floor(Math.random() * responses.length)];
    return {
      response,
      newMood: input.mood,
    };
  }

  // Step 3: Smart cache with similarity matching
  const cachedResponse = chatCache.get(input.userMessage, input.mood, input.timeOfDay);
  if (cachedResponse) {
    console.log('Cache hit - returning cached response');
    return cachedResponse;
  }

  // Step 4: Ultra-short context for token optimization
  const recentContext = input.recentInteractions.slice(-2).join(' | '); // Only last 2 interactions

  try {
    // Enhanced user personalization with caching
    const personalizedContext = await userPersonalization.getPersonalizedContext(input.userMessage, input.recentInteractions);

    // Ultra-compressed prompt to minimize tokens
    const moodCode = MOOD_SHORTCUTS[input.mood as keyof typeof MOOD_SHORTCUTS] || 'n';
    const timeCode = TIME_SHORTCUTS[input.timeOfDay as keyof typeof TIME_SHORTCUTS] || 'n';

    const prompt = `Kruthika, 22yo Indian girl. Chat naturally. <50 words.
M:${moodCode} T:${timeCode}
Context: ${personalizedContext}
Recent: ${recentContext}
User: ${input.userMessage}
Reply:`;

    const result = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      prompt: prompt,
      config: {
        temperature: 0.9,
        maxOutputTokens: 60, // Further reduced for cost
        topP: 0.9,
        topK: 30,
      },
    });

    const response = result.text || "Sorry, my mind went blank! 😅";

    // Quick mood detection
    let newMood = input.mood;
    const msg = input.userMessage.toLowerCase();
    if (msg.includes('love') || msg.includes('miss')) newMood = 'romantic';
    else if (msg.includes('haha') || msg.includes('funny')) newMood = 'playful';
    else if (msg.includes('tired') || msg.includes('sleepy')) newMood = 'tired';

    const output: EmotionalStateOutput = {
      response,
      newMood,
    };

    // Cache aggressively
    chatCache.set(input.userMessage, output, input.mood, input.timeOfDay);

    return output;
  } catch (error) {
    console.error('AI generation error:', error);

    // Smart fallback with mood-aware responses
    const moodFallbacks = {
      happy: "I'm so happy right now! 😊 What's up?",
      romantic: "You make my heart skip! 💕 Tell me more!",
      playful: "Hehe, you're so cute! 😄 What's on your mind?",
      tired: "I'm a bit sleepy but still excited to chat! 😴✨",
      default: "Sorry, I'm having a moment! Try again? 😅"
    };

    const fallbackResponse = moodFallbacks[input.mood as keyof typeof moodFallbacks] || moodFallbacks.default;

    return {
      response: fallbackResponse,
      newMood: input.mood,
    };
  }
}