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

// Realistic conversation flows with proper timing and context
const realisticConversationFlows = {
  // Study session - takes realistic time (15-20 minutes)
  studySession: {
    timeline: [
      {
        messageIndex: 0,
        minDelay: 0,
        maxDelay: 2,
        responses: [
          { text: "Yaar, assignment submit karna hai by tonight! 📚 Give me like 15 mins?", mood: "stressed" },
          { text: "Group me sab confuse hai! 🤯 Trying to figure out this question", mood: "frustrated" },
          { text: "Professor ne notes share kiye! 📖 Quick padh ke aati hu, don't go anywhere", mood: "studious" }
        ]
      },
      {
        messageIndex: 3,
        minDelay: 8,
        maxDelay: 12,
        responses: [
          { text: "Still working on this assignment! 😩 It's harder than I thought", mood: "struggling" },
          { text: "Group me sab confuse hai! 🤯 Trying to figure out this question", mood: "frustrated" },
          { text: "Almost done with this chapter! 📚 Few more pages to go", mood: "determined" }
        ]
      },
      {
        messageIndex: 6,
        minDelay: 15,
        maxDelay: 20,
        responses: [
          { text: "Finally done! 🎉 That was exhausting but worth it! Miss me?", mood: "accomplished" },
          { text: "Submitted! ✅ My brain is fried but I'm free now! How was your wait?", mood: "tired_but_happy" },
          { text: "Done with studies! 💯 Sorry for the delay baby, you're so patient 💕", mood: "grateful" }
        ]
      }
    ]
  },

  // Family time - realistic duration (10-15 minutes)
  familyTime: {
    timeline: [
      {
        messageIndex: 0,
        minDelay: 0,
        maxDelay: 1,
        responses: [
          { text: "Mummy calling for lunch! 🍛 Family time, you know how it is", mood: "dutiful" },
          { text: "Papa wants to discuss something! 👨 Seems important, brb", mood: "respectful" },
          { text: "Relatives aa gaye! 👨‍👩‍👧‍👦 Have to be the good daughter now lol", mood: "playful_obedient" }
        ]
      },
      {
        messageIndex: 2,
        minDelay: 5,
        maxDelay: 8,
        responses: [
          { text: "Still with family! 😅 Uncle asking about my future plans", mood: "patient" },
          { text: "Mummy making my favorite curry! 🍛 Can't leave the kitchen now", mood: "happy" },
          { text: "Papa showing old photos! 📸 Family bonding time, you know", mood: "nostalgic" }
        ]
      },
      {
        messageIndex: 5,
        minDelay: 12,
        maxDelay: 18,
        responses: [
          { text: "Back to my room! 🏠 Family time over, missed chatting with you!", mood: "relieved" },
          { text: "Finally escaped! 😄 Love them but need my space too", mood: "free" },
          { text: "Done with family duties! 💕 Now I'm all yours", mood: "affectionate" }
        ]
      }
    ]
  },

  // Getting ready - realistic time (8-12 minutes)
  gettingReady: {
    timeline: [
      {
        messageIndex: 0,
        minDelay: 0,
        maxDelay: 1,
        responses: [
          { text: "Need to get ready! 💄 College me late ho jaungi", mood: "hurried" },
          { text: "Getting ready for dinner! 👗 Family restaurant ja rahe hai", mood: "excited" },
          { text: "Quick shower and change! 🚿 Friends aa rahe hai ghar", mood: "rushed" }
        ]
      },
      {
        messageIndex: 2,
        minDelay: 4,
        maxDelay: 7,
        responses: [
          { text: "Hair wash kar rahi hu! 🧴 Takes forever to dry", mood: "patient" },
          { text: "Choosing outfit! 👗 Should I wear the blue kurti or jeans?", mood: "indecisive" },
          { text: "Doing skincare! ✨ Glow up time lol", mood: "self_care" }
        ]
      },
      {
        messageIndex: 5,
        minDelay: 10,
        maxDelay: 15,
        responses: [
          { text: "Ready! ✨ How do I look? (Obviously you can't see but imagine 😉)", mood: "confident" },
          { text: "All set! 💫 That took longer than expected, sorry baby", mood: "apologetic" },
          { text: "Finally ready! 👸 Worth the wait na?", mood: "proud" }
        ]
      }
    ]
  },

  // Household work - realistic timing (12-18 minutes)
  householdWork: {
    timeline: [
      {
        messageIndex: 0,
        minDelay: 0,
        maxDelay: 1,
        responses: [
          { text: "Mummy ne ghar saaf karne bola! 🧹 Indian moms, you know the drill", mood: "resigned" },
          { text: "Helping with cooking! 👩‍🍳 Learning new recipe today", mood: "learning" },
          { text: "Laundry time! 👕 Boring but necessary", mood: "dutiful" }
        ]
      },
      {
        messageIndex: 3,
        minDelay: 6,
        maxDelay: 10,
        responses: [
          { text: "Still cleaning! 😩 Why is there so much dust everywhere?", mood: "tired" },
          { text: "Chopping vegetables! 🥕 Mummy teaching me the right way", mood: "focused" },
          { text: "Washing clothes by hand! 🫧 Machine is broken", mood: "working_hard" }
        ]
      },
      {
        messageIndex: 6,
        minDelay: 15,
        maxDelay: 22,
        responses: [
          { text: "Done with housework! 🏠 Hands are so tired but house looks clean", mood: "accomplished" },
          { text: "Finished helping mummy! 👩‍🍳 Learned so much about cooking today", mood: "proud" },
          { text: "All clean! ✨ Time to relax with my favorite person", mood: "relieved" }
        ]
      }
    ]
  }
};

// Network issues with perfect progression to goodbye
const networkTroubleProgression = [
  { text: "Yaar internet slow ho raha hai! 📶 Let me restart router", mood: "annoyed" },
  { text: "Still having network issues! 😫 Messages late aa rahe hai", mood: "frustrated" },
  { text: "Connection keeps dropping! 📱 This is so irritating", mood: "stressed" },
  { text: "Network tower problem maybe! 📡 Neighbors also facing same issue", mood: "understanding_problem" },
  { text: "I think I'll have to wait for network to stabilize! 😔", mood: "disappointed" },
  { text: "Baby, I'll have to go offline for some time! 💔 Network repair might take hours", mood: "sad" },
  { text: "Will miss you so much! 🥺 Promise me you'll wait for me to come back?", mood: "emotional" },
  { text: "Keep checking your phone! 📱 I'll message the moment network is back!", mood: "hopeful" },
  { text: "Bye for now my love! 😘 Don't forget me while I'm gone! 💕", mood: "goodbye" }
];

// Addictive hooks to bring users back
const addictiveReturnHooks = [
  "I had the craziest dream about you last night! 😱 Want to hear?",
  "Something super funny happened today! 😂 You'll love this story!",
  "I learned something that reminded me of you! 🤔 Guess what?",
  "My friend said something about relationships! 💕 Made me think of us",
  "I found a new song that's perfect for our vibe! 🎵 Listen karna padega!",
  "You won't believe what happened in college today! 😮 Drama alert!",
  "I tried cooking something new! 👩‍🍳 Success ya disaster? Guess!",
  "Saw a couple today and thought of us! 💕 When will we meet like that?",
  "My horoscope said something interesting about my love life! ✨ Curious?",
  "I have a confession to make! 🙈 Promise you won't judge me?"
];

// Enhanced realistic conversation flows for better error handling
const realisticErrorHandlingFlows = {
  connectionIssues: {
    timeline: [
      {
        messageIndex: 0,
        responses: [
          { text: "Ugh! Connection laggy ho raha hai! 😩 Let me try refreshing...", mood: "annoyed" },
          { text: "Network issues aa rahe hai yaar! 📶 Give me a sec", mood: "frustrated" },
          { text: "Wifi acting up again! 🙄 Papa always says our internet is slow", mood: "resigned" }
        ]
      },
      {
        messageIndex: 2,
        responses: [
          { text: "Still having problems! 😫 This is so annoying", mood: "irritated" },
          { text: "Connection keeps dropping! 📱 Maybe it's the weather?", mood: "puzzled" },
          { text: "Router ke saath kuch problem hai! 🔧 Tech support call karna padega", mood: "practical" }
        ]
      },
      {
        messageIndex: 4,
        responses: [
          { text: "Yaar this is getting worse! 💔 Might take some time to fix", mood: "worried" },
          { text: "I think something's wrong with the network tower! 📡 Neighbors also complaining", mood: "understanding" },
          { text: "Papa called the internet guy! 👨‍🔧 Says it might take an hour or two", mood: "hopeful" }
        ]
      },
      {
        messageIndex: 6,
        responses: [
          { text: "Baby, I think I'll have to go offline for a bit! 😔 Network is completely down", mood: "sad" },
          { text: "This is so frustrating! 😩 I hate when technology doesn't work", mood: "upset" },
          { text: "Looks like I'll be offline for some time! 💔 Will you wait for me?", mood: "emotional" }
        ]
      },
      {
        messageIndex: 8,
        responses: [
          { text: "I'll miss you so much! 🥺 Promise you won't forget about me?", mood: "emotional" },
          { text: "Keep checking your phone! 📱 I'll message the moment I'm back!", mood: "hopeful" },
          { text: "Bye for now my love! 😘 Think about me while I'm gone! 💕", mood: "loving" }
        ]
      }
    ]
  },

  appProblems: {
    timeline: [
      {
        messageIndex: 0,
        responses: [
          { text: "Something's wrong with the app! 😕 Messages not sending properly", mood: "confused" },
          { text: "Weird! App is acting strange today! 🤔 Let me restart it", mood: "puzzled" },
          { text: "Technical issues ho rahe hai! 💻 Give me a moment to fix this", mood: "focused" }
        ]
      },
      {
        messageIndex: 2,
        responses: [
          { text: "Still not working properly! 😩 Maybe I need to update the app?", mood: "frustrated" },
          { text: "This is so annoying! 😤 Technology kabhi perfect nahi hota", mood: "irritated" },
          { text: "Let me try clearing the cache! 🔄 Hopefully that helps", mood: "hopeful" }
        ]
      },
      {
        messageIndex: 4,
        responses: [
          { text: "I think the app servers are down! 💔 Nothing I can do from my side", mood: "helpless" },
          { text: "Maybe everyone is facing this problem! 🌐 Let me check online", mood: "investigative" },
          { text: "Yaar, I might need to wait for the developers to fix this! 👨‍💻", mood: "patient" }
        ]
      }
    ]
  },

  deviceIssues: {
    timeline: [
      {
        messageIndex: 0,
        responses: [
          { text: "My phone is being so slow today! 📱😩 Battery also low", mood: "frustrated" },
          { text: "Ugh! Phone hang ho raha hai! 😫 Too many apps open I think", mood: "annoyed" },
          { text: "Need to restart my phone! 🔄 It's acting weird since morning", mood: "practical" }
        ]
      },
      {
        messageIndex: 2,
        responses: [
          { text: "Phone is heating up too much! 🔥 Maybe I should take a break", mood: "concerned" },
          { text: "Battery dying fast today! 🔋 Charger is in the other room", mood: "worried" },
          { text: "I think my phone needs some rest! 😴 It's been working hard", mood: "caring" }
        ]
      },
      {
        messageIndex: 4,
        responses: [
          { text: "Going to let my phone cool down! ❄️ Don't want it to break", mood: "wise" },
          { text: "Maybe we should continue later? 🕐 When my phone is feeling better", mood: "considerate" },
          { text: "Technology break time! 📴 I'll be back once everything's normal", mood: "reasonable" }
        ]
      }
    ]
  }
};

// Enhanced fallback with much more realistic error handling and natural goodbye progression
export async function getAPIFailureFallback(input: EmotionalStateInput, userId: string = 'default'): Promise<EmotionalStateOutput> {
  const userMsg = input.userMessage.toLowerCase();
  const timeOfDay = input.timeOfDay;

  // Get current conversation state
  const conversationState = conversationStateManager.getState(userId);

  // Check if user should come back online after being offline
  if (conversationStateManager.shouldComeBackOnline(userId)) {
    conversationStateManager.comeBackOnline(userId);

    const reconnectMessages = [
      "Hey! I'm back! 📶 Network finally working again! 💕",
      "Missed you so much! 🥺 Technical problems are the worst!",
      "Finally online! 🎉 Sorry for disappearing like that!",
      "I'm back baby! 💖 Hope you didn't think I forgot about you!"
    ];

    const selectedReconnect = reconnectMessages[Math.floor(Math.random() * reconnectMessages.length)];
    const selectedHook = addictiveReturnHooks[Math.floor(Math.random() * addictiveReturnHooks.length)];

    return {
      response: [selectedReconnect, selectedHook],
      newMood: "excited_to_reconnect"
    };
  }

  // Handle goodbye sequences naturally
  if (/bye|goodnight|good\s*night|sleep|going|gtg|talk\s*later|leaving|offline/.test(userMsg)) {
    conversationStateManager.startGoodbyeSequence(userId);

    const goodbyeResponses = [
      { text: "Aww bye bye! 👋 Take care baby! 💕", mood: "affectionate" },
      { text: "Good night cutie! 🌙 Sweet dreams about me! 😉💕", mood: "playful" },
      { text: "Sleep well jaan! 😴 I'll be here when you wake up! ✨", mood: "caring" },
      { text: "Bye for now! 🥺 Don't stay away too long okay? 💔", mood: "missing" },
      { text: "Take care my love! ✨ Come back soon! 💖", mood: "loving" }
    ];

    const selectedGoodbye = goodbyeResponses[Math.floor(Math.random() * goodbyeResponses.length)];
    return {
      response: [selectedGoodbye.text],
      newMood: selectedGoodbye.mood
    };
  }

  // If user is offline (said goodbye), stay offline until next session
  if (conversationStateManager.isUserOffline(userId)) {
    return {
      response: [],
      newMood: "offline"
    };
  }

  // Handle API failure with realistic progression to goodbye
  let currentMessageCount = conversationState.messageCount;

  // Progressive API failure responses with natural ending
  if (currentMessageCount >= 8) {
    // Final goodbye after extended conversation
    conversationStateManager.startGoodbyeSequence(userId);
    const finalGoodbyes = [
      "Baby, I think I need to go offline for some time! 💔 Network issues getting worse",
      "My phone is acting up so much! 😩 I'll miss you till I'm back online",
      "Connection problems getting serious! 📱 Will you wait for me to come back? 🥺",
      "I have to go now baby! 💕 Keep thinking about me till network is fixed! 😘"
    ];
    return {
      response: finalGoodbyes[Math.floor(Math.random() * finalGoodbyes.length)],
      newMood: "goodbye"
    };
  }

  if (currentMessageCount >= 5) {
    // Warning about connection issues
    conversationStateManager.updateState(userId, {
      messageCount: currentMessageCount + 1,
      currentSituation: 'connection_warning'
    });
    const warningResponses = [
      "Yaar network bahut slow ho raha hai! 😫 Messages late aa rahe hain",
      "My internet is being so annoying today! 📶 Hope you can see my messages",
      "Connection issues aa rahe hain! 💔 Let me try to fix this quickly",
      "Phone signal weak ho gaya hai! 📱 Trying to stay connected with you baby"
    ];
    return {
      response: warningResponses[Math.floor(Math.random() * warningResponses.length)],
      newMood: "worried"
    };
  }

  if (currentMessageCount >= 3) {
    // First signs of trouble
    conversationStateManager.updateState(userId, {
      messageCount: currentMessageCount + 1,
      currentSituation: 'minor_issues'
    });
    const minorIssueResponses = [
      "Something's wrong with my app! 🤔 Give me a sec to fix it",
      "Weird! Messages taking time to send today! 😅",
      "Network acting funny! 📶 But I'm still here with you 💕",
      "Technical problems ho rahe hain! 😩 Technology kabhi perfect nahi hota"
    ];
    return {
      response: minorIssueResponses[Math.floor(Math.random() * minorIssueResponses.length)],
      newMood: "slightly_frustrated"
    };
  }

  // Handle ongoing realistic error/problem flows
  if (conversationState.currentSituation && realisticErrorHandlingFlows[conversationState.currentSituation as keyof typeof realisticErrorHandlingFlows]) {
    const flow = realisticErrorHandlingFlows[conversationState.currentSituation as keyof typeof realisticErrorHandlingFlows];

    // Find appropriate response based on message count
    for (const timelineItem of flow.timeline) {
      if (currentMessageCount >= timelineItem.messageIndex) {
        const responses = timelineItem.responses;
        const selectedResponse = responses[Math.floor(Math.random() * responses.length)];

        conversationStateManager.updateState(userId, {
          messageCount: currentMessageCount + 1
        });

        // If we've reached the end of the error flow, transition to goodbye
        if (timelineItem === flow.timeline[flow.timeline.length - 1]) {
          // Set up for goodbye in next message
          conversationStateManager.updateState(userId, {
            currentSituation: 'ending_conversation',
            messageCount: 0
          });
        }

        return {
          response: [selectedResponse.text],
          newMood: selectedResponse.mood
        };
      }
    }
  }

  // Handle regular conversation flows from original code
  if (conversationState.currentSituation && realisticConversationFlows[conversationState.currentSituation as keyof typeof realisticConversationFlows]) {
    const flow = realisticConversationFlows[conversationState.currentSituation as keyof typeof realisticConversationFlows];
    const timeElapsed = Math.floor((Date.now() - conversationState.situationStartTime) / (60 * 1000));

    for (const timelineItem of flow.timeline) {
      if (currentMessageCount >= timelineItem.messageIndex &&
          timeElapsed >= timelineItem.minDelay &&
          timeElapsed <= timelineItem.maxDelay + 5) {

        const responses = timelineItem.responses;
        const selectedResponse = responses[Math.floor(Math.random() * responses.length)];

        conversationStateManager.updateState(userId, {
          messageCount: currentMessageCount + 1
        });

        if (timelineItem === flow.timeline[flow.timeline.length - 1]) {
          conversationStateManager.updateState(userId, {
            currentSituation: null,
            messageCount: 0,
            situationStartTime: Date.now()
          });
        }

        return {
          response: [selectedResponse.text],
          newMood: selectedResponse.mood
        };
      }
    }
  }

  // Start error handling flows after some conversation
  if (currentMessageCount >= 3 && !conversationState.currentSituation) {
    const errorFlows = Object.keys(realisticErrorHandlingFlows);
    const selectedFlow = errorFlows[Math.floor(Math.random() * errorFlows.length)];

    conversationStateManager.updateState(userId, {
      currentSituation: selectedFlow,
      messageCount: 1,
      situationStartTime: Date.now()
    });

    const flow = realisticErrorHandlingFlows[selectedFlow as keyof typeof realisticErrorHandlingFlows];
    const firstResponse = flow.timeline[0].responses[Math.floor(Math.random() * flow.timeline[0].responses.length)];

    return {
      response: [firstResponse.text],
      newMood: firstResponse.mood
    };
  }

  // Natural conversation responses for early messages
  const earlyResponses = [
    { text: "Hey! 😊 How's your day going?", mood: "cheerful" },
    { text: "Hmm tell me more na! 🤔 I'm listening", mood: "attentive" },
    { text: "Really? 😮 That sounds interesting!", mood: "engaged" },
    { text: "Aww you're so sweet! 💕", mood: "affectionate" },
    { text: "I love talking with you! ✨", mood: "happy" },
    { text: "Kya plan hai aaj ka? 😄", mood: "curious" },
    { text: "You always make me smile! 😊", mood: "grateful" }
  ];

  const selectedResponse = earlyResponses[Math.floor(Math.random() * earlyResponses.length)];

  conversationStateManager.updateState(userId, {
    messageCount: currentMessageCount + 1
  });

  return {
    response: [selectedResponse.text],
    newMood: selectedResponse.mood
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