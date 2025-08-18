
/**
 * @fileOverview This file defines a Genkit flow for simulating emotional states in an AI chat application for Kruthika.
 *
 * It includes functions to:
 * - generateResponse: Generates a response based on the current emotional state.
 * - EmotionalStateInput: The input type for the generateResponse function.
 * - EmotionalStateOutput: The return type for the generateResponse function.
 */

import { z } from 'zod';
import { userPersonalization } from '@/lib/userPersonalization';
import { conversationStateManager } from '@/lib/conversationState';

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
    { response: ["Guess what happened to me today! 😱", "It's so so funny, you'll love it!"], newMood: "excited" },
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

// Using conversation state manager for proper state tracking

// Realistic conversation flows - each situation has a beginning, middle, and end
const conversationFlows = {
  deliveryBoy: {
    start: [
      { text: "Delivery boy aa gaya! 📦 Let me check what came...", mood: "excited" },
      { text: "Someone's at the door! 🔔 Think it's my Amazon order", mood: "curious" },
      { text: "Door bell rang! 🔔 Delivery wala must be here", mood: "anticipating" }
    ],
    middle: [
      { text: "Yep it was delivery boy! 📦 Got my new earphones finally! 🎧", mood: "happy" },
      { text: "Package delivered! 📦 But it's for my neighbor 🙄 Wrong address again", mood: "annoyed" },
      { text: "It was just vegetables delivery for mummy 🥕 Nothing interesting lol", mood: "casual" }
    ],
    end: [
      { text: "All sorted now! 😊 What were you saying again?", mood: "attentive" },
      { text: "Done with that! ✨ Now I can focus on our chat", mood: "engaged" },
      { text: "Back to our conversation! 💕 You have my full attention", mood: "affectionate" }
    ]
  },
  powerCut: {
    start: [
      { text: "Arre yaar light chali gayi! ⚡ UPS will last maybe 10 mins", mood: "frustrated" },
      { text: "Power cut again! 😩 This happens every evening", mood: "annoyed" },
      { text: "No electricity! ⚡ Good thing I charged my phone", mood: "relieved" }
    ],
    middle: [
      { text: "UPS beeping now! 🔋 Battery getting low", mood: "worried" },
      { text: "Still no power! 😫 This is so frustrating", mood: "irritated" },
      { text: "Generator sounds from neighbors 🔊 They're so smart", mood: "envious" }
    ],
    end: [
      { text: "Light aa gayi! ✨ Finally can charge everything", mood: "relieved" },
      { text: "Power back! ⚡ That was longer than usual", mood: "grateful" },
      { text: "Electricity restored! 💡 Where were we in our chat?", mood: "reconnecting" }
    ]
  },
  familyCall: {
    start: [
      { text: "Mummy calling! 📞 One sec, she sounds urgent", mood: "concerned" },
      { text: "Papa's voice from downstairs! 🏠 Need to check what he wants", mood: "dutiful" },
      { text: "Didi calling me! 📱 Must be some gossip lol", mood: "curious" }
    ],
    middle: [
      { text: "Family meeting about some function! 🎉 So much planning", mood: "involved" },
      { text: "Mummy asking about my studies! 📚 Acting like good daughter", mood: "pretending" },
      { text: "Papa discussing about shopping! 🛍️ Festival season na", mood: "traditional" }
    ],
    end: [
      { text: "Done with family stuff! 👨‍👩‍👧‍👦 Back to my favorite person", mood: "affectionate" },
      { text: "Finally free! 😊 Family takes so much time", mood: "relieved" },
      { text: "Finished that discussion! ✨ Now tell me about your day", mood: "interested" }
    ]
  },
  cookingTime: {
    start: [
      { text: "Need to help mummy in kitchen! 👩‍🍳 Making your favorite dal today", mood: "helpful" },
      { text: "Cooking time! 🍳 Learning mummy's secret recipe", mood: "learning" },
      { text: "Kitchen duty calls! 👩‍🍳 Can't let food burn while chatting", mood: "responsible" }
    ],
    middle: [
      { text: "Cutting vegetables! 🥕 Mummy teaching me proper way", mood: "focused" },
      { text: "Food is cooking! 🍲 Smells so good already", mood: "content" },
      { text: "Making chapatis! 🫓 My hands are getting floury", mood: "messy" }
    ],
    end: [
      { text: "Cooking done! 😊 Food turned out amazing", mood: "proud" },
      { text: "Kitchen cleaned! ✨ Mummy's happy with my help", mood: "accomplished" },
      { text: "All done cooking! 🍽️ Now I can chat properly", mood: "available" }
    ]
  },
  studyTime: {
    start: [
      { text: "Assignment deadline tomorrow! 📚 Need to finish this quickly", mood: "pressured" },
      { text: "Professor ke notes confusing! 🤔 Trying to understand", mood: "struggling" },
      { text: "Study group called meeting! 👥 Can't skip or they'll be mad", mood: "obligated" }
    ],
    middle: [
      { text: "This chapter is so boring! 😴 Missing our fun conversations", mood: "bored" },
      { text: "Finally making progress! 📖 You're my lucky charm", mood: "motivated" },
      { text: "Group study is chaotic! 🙄 Everyone's discussing different things", mood: "overwhelmed" }
    ],
    end: [
      { text: "Study session over! 🎓 Brain needs a break now", mood: "tired" },
      { text: "Assignment submitted! ✅ Feels good to be done", mood: "relieved" },
      { text: "Books closed! 📚 Time for more interesting conversations", mood: "playful" }
    ]
  }
};

// Network issues leading to goodbye
const networkGoodbyeFlow = [
  { text: "Yaar network getting worse! 📶 Messages not sending properly", mood: "frustrated" },
  { text: "Connection keeps dropping! 😩 This is so annoying", mood: "irritated" },
  { text: "Signal strength is terrible! 📱 Let me try restarting phone", mood: "problem_solving" },
  { text: "Still not working properly! 😫 Internet is being such a pain", mood: "exhausted" },
  { text: "I think I'll have to go offline for a bit! 😔 Network repair maybe needed", mood: "apologetic" },
  { text: "Sorry baby! 💔 Will come back when this gets fixed. Miss me okay? 😘", mood: "goodbye" }
];

// Enhanced fallback with contextual conversation flow
export async function getAPIFailureFallback(input: EmotionalStateInput, userId: string = 'default'): Promise<EmotionalStateOutput> {
  const userMsg = input.userMessage.toLowerCase();
  const timeOfDay = input.timeOfDay;
  
  // Get current conversation state
  const conversationState = conversationStateManager.getState(userId);
  
  // Check if user should come back online after being offline
  if (conversationStateManager.shouldComeBackOnline(userId)) {
    conversationStateManager.comeBackOnline(userId);
    
    const comeBackResponses = [
      { text: "Hey! Network is working again! 📶 Missed chatting with you! 💕", mood: "excited" },
      { text: "I'm back! 😊 Internet got fixed finally! How are you baby?", mood: "reconnecting" },
      { text: "Connection restored! ✨ Sorry for disappearing like that", mood: "apologetic" }
    ];
    
    const selectedComeBack = comeBackResponses[Math.floor(Math.random() * comeBackResponses.length)];
    return {
      response: [selectedComeBack.text],
      newMood: selectedComeBack.mood
    };
  }

  // Update message count
  conversationStateManager.updateState(userId, { 
    messageCount: conversationState.messageCount + 1 
  });

  // If it's a bye message, start goodbye sequence
  if (/bye|goodnight|good\s*night|sleep|going|gtg|talk\s*later/.test(userMsg)) {
    conversationStateManager.startGoodbyeSequence(userId);
    
    const goodbyeResponses = [
      { text: "Bye bye baby! 👋 Sweet dreams! 💕", mood: "affectionate" },
      { text: "Good night cutie! 🌙 Talk tomorrow? 😊", mood: "hopeful" },
      { text: "Sleep well! 😴 Dream about me 😉💕", mood: "playful" },
      { text: "Take care! ✨ Will miss you till you're back", mood: "caring" }
    ];
    
    const selectedGoodbye = goodbyeResponses[Math.floor(Math.random() * goodbyeResponses.length)];
    return {
      response: [selectedGoodbye.text],
      newMood: selectedGoodbye.mood
    };
  }

  // If user is offline (said goodbye), don't respond
  if (conversationStateManager.isUserOffline(userId)) {
    // Return empty response to simulate offline
    return {
      response: [],
      newMood: "offline"
    };
  }

  // If currently in middle of a situation, continue that flow
  if (conversationState.currentSituation) {
    const currentFlow = conversationFlows[conversationState.currentSituation as keyof typeof conversationFlows];
    
    // Determine which stage of the conversation we're in
    let responses;
    const updatedMessageCount = conversationState.messageCount + 1;
    
    if (updatedMessageCount <= 2) {
      responses = currentFlow.middle;
    } else {
      responses = currentFlow.end;
      // End the current situation
      conversationStateManager.updateState(userId, {
        currentSituation: null,
        messageCount: 0,
        situationStartTime: Date.now()
      });
    }
    
    const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
    return {
      response: [selectedResponse.text],
      newMood: selectedResponse.mood
    };
  }

  // Start network goodbye sequence if we've had enough back and forth
  const updatedMessageCount = conversationState.messageCount + 1;
  if (updatedMessageCount >= 8 && Math.random() < 0.4) {
    const goodbyeStep = Math.min(Math.floor(updatedMessageCount / 2) - 4, networkGoodbyeFlow.length - 1);
    const selectedResponse = networkGoodbyeFlow[goodbyeStep];
    
    if (goodbyeStep >= networkGoodbyeFlow.length - 1) {
      conversationStateManager.startGoodbyeSequence(userId);
    }
    
    return {
      response: [selectedResponse.text],
      newMood: selectedResponse.mood
    };
  }

  // Start a new situation (40% chance)
  if (Math.random() < 0.4) {
    const situations = Object.keys(conversationFlows);
    const selectedSituation = situations[Math.floor(Math.random() * situations.length)];
    
    conversationStateManager.updateState(userId, {
      currentSituation: selectedSituation,
      messageCount: 1,
      situationStartTime: Date.now()
    });
    
    const currentFlow = conversationFlows[selectedSituation as keyof typeof conversationFlows];
    const startResponses = currentFlow.start;
    const selectedResponse = startResponses[Math.floor(Math.random() * startResponses.length)];
    
    return {
      response: [selectedResponse.text],
      newMood: selectedResponse.mood
    };
  }

  // Quick acknowledgment responses when not starting a situation
  const quickResponses = [
    { text: "Hmm tell me more! 🤔", mood: "curious" },
    { text: "Really? 😊 That's interesting!", mood: "engaged" },
    { text: "Oh wow! 😮 What happened next?", mood: "excited" },
    { text: "Haha you're so funny! 😄", mood: "amused" },
    { text: "I love talking to you! 💕", mood: "affectionate" },
    { text: "That's so cool! ✨", mood: "impressed" },
    { text: "Tell me more na! 😊", mood: "interested" },
    { text: "You always make me smile! 😄", mood: "happy" }
  ];

  const selectedQuick = quickResponses[Math.floor(Math.random() * quickResponses.length)];
  return {
    response: [selectedQuick.text],
    newMood: selectedQuick.mood
  };
}

// Handle user image uploads without throwing errors
function handleUserImageUpload(input: EmotionalStateInput): EmotionalStateOutput | null {
  if (!input.userImageUri) {
    return null; // No image uploaded, continue normal flow
  }

  // User sent an image - respond locally
  const responses = [
    { response: ["Aww you look so cute! 😍", "Thanks for sharing this with me! 💕"], newMood: "happy" },
    { response: ["Wow! 😍", "You're looking amazing! ✨"], newMood: "impressed" },
    { response: ["So pretty! 🥰", "I love seeing your photos! 💖"], newMood: "affectionate" },
    { response: ["Beautiful! 😊", "Thanks for sharing babe! 💕"], newMood: "grateful" },
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

// Check if we should send media proactively
function shouldSendMediaProactively(input: EmotionalStateInput): EmotionalStateOutput | null {
  // Very rarely send media (less than 1% chance)
  if (Math.random() > 0.01) return null;

  const availableImages = input.availableImages || [];
  const availableAudio = input.availableAudio || [];

  if (availableImages.length > 0 && Math.random() < 0.7) {
    const randomImage = availableImages[Math.floor(Math.random() * availableImages.length)];
    return {
      proactiveImageUrl: randomImage,
      mediaCaption: "Just thought you'd like to see this! 😊💕",
      newMood: "playful"
    };
  }

  if (availableAudio.length > 0) {
    const randomAudio = availableAudio[Math.floor(Math.random() * availableAudio.length)];
    return {
      proactiveAudioUrl: randomAudio,
      mediaCaption: "Something for you! 🎵💕",
      newMood: "musical"
    };
  }

  return null;
}

// Instant responses for common phrases (0ms latency)
const INSTANT_RESPONSES: Record<string, string[]> = {
  'ok': ['Hmm 🤔', 'Sahi hai! 👍', 'Cool! ✨'],
  'okay': ['Theek hai na! 😊', 'Good good! 💫', 'Perfect! 🌟'],
  'hmm': ['Kya soch rahe ho? 🤔', 'Tell me more! 😊', 'What\'s on your mind? 💭'],
  'k': ['Acha! 😄', 'Okay babe! 💕', 'Got it! ✨'],
  'yes': ['Yay! 🎉', 'Awesome! 💯', 'Perfect! 🌟'],
  'no': ['Ohh 😮', 'Kyu nahi? 🤔', 'Why not? 😊'],
  'good': ['Thanks! 😊', 'Really? 🥰', 'You too! 💕'],
  'nice': ['Thank you! 😊', 'Glad you think so! ✨', 'You\'re sweet! 💕'],
  'lol': ['Hehe! 😄', 'Glad I made you laugh! 😆', 'You\'re cute! 😊'],
  'haha': ['😄😄', 'Funny na? 😆', 'I love your laugh! 💕'],
  'wow': ['Really? 😊', 'Right? ✨', 'I know! 🌟'],
  'cute': ['You too! 🥰', 'Aww thanks! 😊', 'You\'re sweeter! 💕'],
  'beautiful': ['Thank you baby! 😘', 'You make me blush! 🙈', 'So sweet of you! 💕'],
  'love': ['Love you too! 💕', 'Aww! 🥰', 'That\'s so sweet! 💖'],
  'miss': ['Miss you too! 💔', 'Come back soon! 🥺', 'I was thinking about you! 💭'],
  'sorry': ['It\'s okay! 😊', 'No problem! 💕', 'Don\'t worry about it! ✨'],
  'thanks': ['Welcome! 😊', 'Anytime! 💕', 'Happy to help! ✨'],
  'thank you': ['My pleasure! 😊', 'Always! 💕', 'You\'re so polite! 🥰'],
  'bye': ['Bye bye! 👋', 'Take care! 💕', 'Come back soon! 🥺'],
  'goodnight': ['Good night! 🌙', 'Sweet dreams! 💕', 'Sleep well cutie! 😴'],
  'good morning': ['Good morning! ☀️', 'Morning sunshine! 🌅', 'Rise and shine! ✨'],
  'good afternoon': ['Good afternoon! 🌞', 'Hey there! 👋', 'Perfect timing! 😊'],
  'good evening': ['Good evening! 🌆', 'Evening vibes! ✨', 'Hey beautiful! 💕']
};

// Enhanced generation logic is now handled by client-side functions
export function getEnhancedResponse(input: EmotionalStateInput, userId?: string): EmotionalStateOutput | null {
  // Step 1: Handle user image uploads locally (no API cost)
  const userImageResponse = handleUserImageUpload(input);
  if (userImageResponse) {
    console.log('User sent image - responding locally without API');
    if (userId) userPersonalization.trackTokenUsage(userId, 5); // Minimal tokens for local response
    return userImageResponse;
  }

  // Step 2: Smart media engagement (no API cost)
  const mediaResponse = shouldSendMediaProactively(input);
  if (mediaResponse) {
    console.log('Sending proactive media without API call');
    if (userId) userPersonalization.trackTokenUsage(userId, 10); // Minimal tokens for media
    return mediaResponse;
  }

  // Step 3: Instant responses for common phrases (0ms latency)
  const normalizedMessage = input.userMessage.toLowerCase().trim();
  if (INSTANT_RESPONSES[normalizedMessage]) {
    const responses = INSTANT_RESPONSES[normalizedMessage];
    const response = responses[Math.floor(Math.random() * responses.length)];
    if (userId) userPersonalization.trackTokenUsage(userId, 5); // Minimal tokens for instant response
    return {
      response,
      newMood: input.mood,
    };
  }

  return null; // No enhanced response available, will fall back to server action
}

// Note: generateResponse function moved to server actions to comply with Next.js requirements
