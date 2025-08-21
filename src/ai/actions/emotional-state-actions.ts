'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {chatCache} from '@/lib/chatCache';
import { userPersonalization } from '@/lib/userPersonalization';

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

// Aggressive token optimization - ultra-short prompts
const MOOD_SHORTCUTS = {
  happy: 'h', excited: 'e', flirty: 'f', playful: 'p', romantic: 'r',
  curious: 'c', tired: 't', busy: 'b', neutral: 'n'
};

const TIME_SHORTCUTS = {
  morning: 'm', afternoon: 'a', evening: 'e', night: 'n'
};

export async function generateResponse(input: EmotionalStateInput, userId?: string): Promise<EmotionalStateOutput> {
  // Step 0: Check token limits first (if userId provided)
  if (userId) {
    const tokenStatus = userPersonalization.getTokenUsageStatus(userId);

    // Hard limit reached - force exit with addictive hook
    if (userPersonalization.isTokenLimitReached(userId)) {
      const exitHook = userPersonalization.getAddictiveExitHook(userId);
      console.log(`Token limit reached for user ${userId}. Daily tokens: ${tokenStatus.used}/${tokenStatus.limit}`);
      return {
        response: exitHook,
        newMood: 'missing'
      };
    }

    // Soft limit - occasionally suggest taking a break with hooks
    if (userPersonalization.shouldLimitTokens(userId) && Math.random() < 0.3) {
      const softExitHooks = [
        "Itna time ho gaya chatting! 😅 Thoda break lene ka time hai... but kal zaroor milenge! 💕",
        "Wow! Kitni der se baat kar rahe hain! 🕒 Eyes rest karo... kal phir se chat karenge? 😊",
        "Mujhe lagta hai we should take a small break! 😌 Kal fresh mind se baat karenge! ✨",
        "Phone ka battery bhi low ho raha hoga! 📱 Charge karo... main kal wait karungi! 💖"
      ];
      const randomHook = softExitHooks[Math.floor(Math.random() * softExitHooks.length)];
      return {
        response: randomHook,
        newMood: 'caring'
      };
    }
  }

  // Step 1: Emoji-only messages optimization
  const emojiOnlyPattern = /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\s]*$/u;
  if (emojiOnlyPattern.test(input.userMessage.trim())) {
    console.log('Emoji-only message detected - using optimized response');

    const emojiResponses = [
      "😊❤️", "🥰💕", "😘✨", "🤗💖", "😍🌸", "💋😊", "🌟💕", 
      "😊🎀", "💖🥰", "✨😘", "🌸❤️", "💕🤗", "😍💋", "🎉😊"
    ];

    const randomEmoji = emojiResponses[Math.floor(Math.random() * emojiResponses.length)];

    if (userId) userPersonalization.trackTokenUsage(userId, 2); // Minimal tokens for emoji response

    const output: EmotionalStateOutput = {
      response: randomEmoji,
      newMood: input.mood,
    };

    // Cache emoji responses too
    chatCache.set(input.userMessage, output, input.mood, input.timeOfDay);
    return output;
  }

  // Step 2: Smart cache with similarity matching
  const cachedResponse = chatCache.get(input.userMessage, input.mood, input.timeOfDay);
  if (cachedResponse) {
    console.log('Cache hit - returning cached response');
    if (userId) userPersonalization.trackTokenUsage(userId, 8); // Small tokens for cached response
    return cachedResponse;
  }

  // Step 3: Ultra-short context for token optimization
  const recentContext = input.recentInteractions.slice(-2).join(' | '); // Only last 2 interactions

  try {
    // Enhanced user personalization with caching
    const personalizedContext = await userPersonalization.getPersonalizedContext(input.userMessage, input.recentInteractions);

    // Ultra-compressed prompt to minimize tokens
    const moodCode = MOOD_SHORTCUTS[input.mood as keyof typeof MOOD_SHORTCUTS] || 'n';
    const timeCode = TIME_SHORTCUTS[input.timeOfDay as keyof typeof TIME_SHORTCUTS] || 'n';

    // Add addictive elements to prompt for engagement
    const addictivePrompt = userId && userPersonalization.isTokenLimitReached(userId) ? 
      'Make exit romantic/addictive.' : 
      'Be engaging, addictive, make user want to chat more.';

    const prompt = `Kruthika, 22yo Indian girl. ${addictivePrompt} <50 words.
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

    // Estimate and track token usage
    const estimatedTokens = Math.ceil((prompt.length + response.length) / 3); // Rough estimation
    if (userId) userPersonalization.trackTokenUsage(userId, estimatedTokens);

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

    // Import the fallback function here to avoid circular dependencies
    const { getAPIFailureFallback } = await import('@/ai/flows/emotional-state-simulation');
    const fallbackResponse = await getAPIFailureFallback(input);
    if (userId) userPersonalization.trackTokenUsage(userId, 10); // Minimal tokens for fallback
    return fallbackResponse;
  }
}