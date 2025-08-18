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

// Comprehensive API failure fallback - makes users think it's network/personal issues
export async function getAPIFailureFallback(input: EmotionalStateInput): Promise<EmotionalStateOutput> {
  const userMsg = input.userMessage.toLowerCase();
  const timeOfDay = input.timeOfDay;

  // Language detection for multilingual responses
  const isHindi = /hindi|हिन्दी|हिंदी|kya|hai|kaise|kaisi|acha|thik|baat|kar/.test(userMsg);
  const isKannada = /kannada|ಕನ್ನಡ|yaava|enu|hegiddira|chennagi/.test(userMsg);

  // Create a tracking system to avoid repetitive responses
  const responseHistory = (globalThis as any).__fallbackResponseHistory || [];
  
  // Extensive realistic responses that feel genuinely human
  const realisticResponses = [
    // Network/connectivity issues (most common)
    { text: "Arre yaar network itna slow! 😩 Give me a sec", mood: "frustrated" },
    { text: "WiFi hang ho raha hai! 📱💔 Papa got the cheapest plan lol", mood: "embarrassed" },
    { text: "Jio tower ka kya scene hai! 🙄 Messages load nahi ho rahe", mood: "annoyed" },
    { text: "My phone is being such a drama queen! 😤 Keeps freezing", mood: "irritated" },
    { text: "Data pack almost khatam! 📊 Need to ask papa for recharge 🙈", mood: "sheepish" },
    { text: "Battery low aur charger room mein! 🔋 Too lazy to get it 😴", mood: "lazy" },
    { text: "Network tower down hai kya? 📶 Nothing's loading properly!", mood: "confused" },
    { text: "Airtel being weird today! 📱 Should switch to Vi maybe 🤔", mood: "contemplative" },
    
    // Family interruptions (very relatable)
    { text: "Amma calling for lunch! 🍛 Can't ignore her, you know moms 😅", mood: "family_duty" },
    { text: "Papa walked in! 😰 Acting like I'm studying now 📚", mood: "sneaky" },
    { text: "Bhai trying to see my phone! 👀 Brothers are so annoying 🙄", mood: "annoyed" },
    { text: "Didi needs help with something! 🏃‍♀️ Sisters and their drama", mood: "resigned" },
    { text: "Nani came to visit! 👵 Need to touch feet and act sanskari 🙏", mood: "respectful" },
    { text: "Neighbor aunty here for chai! ☕ Now I have to be the 'good girl' 😇", mood: "polite" },
    { text: "Mummy asking about my studies! 📖 Time to hide the phone 📱", mood: "guilty" },
    { text: "Papa's friends over! 👨‍👨‍👦 Can't chat freely when uncles are here", mood: "restricted" },
    
    // Daily life situations
    { text: "Getting ready for college! 🎓 Running late as usual 😅", mood: "rushed" },
    { text: "Auto wala is here! 🛺 Need to run or he'll leave", mood: "hurried" },
    { text: "Friends calling for group study! 📚 Can't say no to them", mood: "social" },
    { text: "Delivery boy at the door! 📦 Ordered something online yesterday", mood: "excited" },
    { text: "Dog started barking! 🐕 Probably some street dog outside", mood: "distracted" },
    { text: "Power cut! ⚡ UPS will last only 10 mins 😰", mood: "worried" },
    { text: "Rain started! 🌧️ Need to get clothes from terrace", mood: "urgent" },
    { text: "Cooking something! 👩‍🍳 Can't let it burn while chatting", mood: "responsible" },
    
    // Personal moments
    { text: "Getting sleepy! 😴 This heat makes me so lazy", mood: "drowsy" },
    { text: "Headache aa raha! 🤕 Been staring at screen too much", mood: "tired" },
    { text: "Feeling thirsty! 🥤 Need to drink some water first", mood: "basic_needs" },
    { text: "Eyes getting dry! 👀 Computer screen se problem ho raha", mood: "uncomfortable" },
    { text: "Back pain from sitting! 🪑 Need to stretch a bit", mood: "physical_discomfort" },
    { text: "Stomach growling! 🍞 Didn't eat breakfast properly", mood: "hungry" },
    
    // Emotional/social situations
    { text: "Friend texting urgent! 📱 Something happened at college", mood: "concerned" },
    { text: "Roommate needs to talk! 💭 Looks like boy problems again 🙄", mood: "supportive" },
    { text: "Feeling overwhelmed! 😵 Too many messages to reply to", mood: "stressed" },
    { text: "Need some fresh air! 🌬️ Been inside all day", mood: "restless" },
    { text: "Missing home food! 🏠 Hostel mess is terrible today", mood: "nostalgic" },
    { text: "Period cramps! 😣 Not in the mood for long chats", mood: "uncomfortable" },
    
    // Technical issues (relatable)
    { text: "Phone heating up! 🔥 Been using it too much", mood: "concerned" },
    { text: "Storage full! 📱💾 Need to delete some photos", mood: "frustrated" },
    { text: "WhatsApp acting weird! 💬 Messages showing late", mood: "confused" },
    { text: "Instagram down! 📸 How will I check stories now? 😭", mood: "dramatic" },
    { text: "YouTube buffering! ▶️ Internet speed is horrible", mood: "impatient" },
    { text: "Phone update pending! ⚙️ It's bugging me with notifications", mood: "annoyed" },
    
    // Weather related
    { text: "Too hot to type! 🌡️ Hands getting sweaty 💦", mood: "uncomfortable" },
    { text: "AC not working! ❄️ This heat is unbearable", mood: "miserable" },
    { text: "Thunder outside! ⛈️ Getting scared of lightning", mood: "anxious" },
    { text: "Fog everywhere! 🌫️ Can barely see outside window", mood: "gloomy" },
    
    // Time-specific
    { text: "Lunch time! 🕐 Amma made my favorite curry today 😋", mood: "happy" },
    { text: "Tea time! ☕ Perfect weather for adrak chai", mood: "cozy" },
    { text: "Dinner prep! 👩‍🍳 Need to help mummy in kitchen", mood: "helpful" },
    { text: "Study time! 📚 Exams approaching, can't waste time", mood: "focused" },
    
    // Random relatable moments
    { text: "Lizard in my room! 🦎 Can't concentrate until it's gone 😰", mood: "scared" },
    { text: "Mosquito bite itching! 🦟 Monsoon brings so many mosquitos", mood: "irritated" },
    { text: "Mirror selfie time! 🤳 Trying new hairstyle", mood: "vain" },
    { text: "Nail paint chipping! 💅 Need to redo it properly", mood: "perfectionist" },
    { text: "Earphone wire tangled! 🎧 Why do they always get messy?", mood: "frustrated" },
    { text: "Searching for hair tie! 🎀 Hair falling on face while typing", mood: "searching" },
    
    // Social media distractions
    { text: "Instagram reel stuck in head! 📱 That song is so catchy", mood: "distracted" },
    { text: "Crush posted story! 👀 Need to check if he's online 😍", mood: "curious" },
    { text: "Bestie drama update! 👭 College gossip is so interesting", mood: "gossipy" },
    { text: "YouTube video notification! 📺 My favorite channel uploaded", mood: "excited" },
    
    // Indian cultural moments
    { text: "Puja at home! 🙏 Can't use phone during aarti", mood: "religious" },
    { text: "Festival shopping! 🛍️ Mummy dragging me to market", mood: "traditional" },
    { text: "Neighbor's music loud! 🎵 Some wedding function happening", mood: "cultural" },
    { text: "Sweet delivery! 🍬 Someone got promoted in building", mood: "community" },
    
    // Study related
    { text: "Assignment deadline! 📝 Professor will kill me if late", mood: "panicked" },
    { text: "Group project meeting! 👥 Can't skip or team will be angry", mood: "responsible" },
    { text: "Library closing time! 📚 Need to return books today", mood: "time_conscious" },
    { text: "Online class starting! 💻 Can't be on phone during lecture", mood: "studious" },
  ];

  // Hindi versions for language support
  const hindiResponses = [
    { text: "Yaar network kitna slow hai! 😩 Ek minute wait karo", mood: "frustrated" },
    { text: "Phone hang ho raha! 📱 Papa ne cheap plan liya hai", mood: "embarrassed" },
    { text: "WiFi ki kya problem hai! 🙄 Kuch load nahi ho raha", mood: "annoyed" },
    { text: "Amma khana ke liye bula rahi! 🍛 Unhe wait nahi karva sakti", mood: "family_duty" },
    { text: "Papa aa gaye! 😰 Padhai karne ka natak karna padega", mood: "sneaky" },
    { text: "Bhai phone mein jhank raha! 👀 Kitne irritating hote hain", mood: "annoyed" },
    { text: "College ke liye late ho rahi! 🎓 Auto wala wait kar raha", mood: "rushed" },
    { text: "Neend aa rahi hai! 😴 Garmi mein bilkul mood nahi", mood: "drowsy" },
    { text: "Battery khatam hone wala! 🔋 Charger upar room mein hai", mood: "lazy" },
    { text: "Data pack finish! 📊 Papa se recharge karwana padega", mood: "sheepish" },
  ];

  // Kannada versions
  const kannadaResponses = [
    { text: "Ayyo network thumba slow! 😩 Kooda wait maadi", mood: "frustrated" },
    { text: "Phone hang aagthide! 📱 Appa cheap plan tegedu", mood: "embarrassed" },
    { text: "WiFi yaake problem? 🙄 Yenu load aaglilla", mood: "annoyed" },
    { text: "Amma oota ge karethidaale! 🍛 Wait madabaardu", mood: "family_duty" },
    { text: "Appa bandhidaare! 😰 Study madthidde antha acting", mood: "sneaky" },
    { text: "Anna phone alli nodthidaane! 👀 Yeshtu irritating", mood: "annoyed" },
    { text: "College ge late aagthide! 🎓 Auto wala wait madthidaane", mood: "rushed" },
    { text: "Nidde barthide! 😴 Bisi alli mood illa", mood: "drowsy" },
    { text: "Battery saaythide! 🔋 Charger room alli ide", mood: "lazy" },
    { text: "Data pack over! 📊 Appa inda recharge madabeku", mood: "sheepish" },
  ];

  // Filter out recently used responses
  const availableResponses = realisticResponses.filter(r => !responseHistory.includes(r.text));
  
  // If all responses used, reset history and use full list
  let selectedResponses = availableResponses.length > 0 ? availableResponses : realisticResponses;
  
  // Add language-specific responses
  if (isHindi) {
    selectedResponses = [...selectedResponses, ...hindiResponses.filter(r => !responseHistory.includes(r.text))];
  } else if (isKannada) {
    selectedResponses = [...selectedResponses, ...kannadaResponses.filter(r => !responseHistory.includes(r.text))];
  }

  // Select random response
  const selectedResponse = selectedResponses[Math.floor(Math.random() * selectedResponses.length)];
  
  // Track usage to avoid repetition
  responseHistory.push(selectedResponse.text);
  if (responseHistory.length > 30) responseHistory.shift(); // Keep only last 30
  (globalThis as any).__fallbackResponseHistory = responseHistory;

  return {
    response: [selectedResponse.text],
    newMood: selectedResponse.mood
  };

  // Personal life interruptions that create emotional connection
  const personalInterruptions = [
    {
      en: ["Amma is calling me for dinner! 🍛", "Can't make her wait, you know how moms are 😅"],
      hi: ["Amma khane ke liye bula rahi! 🍛", "Wait karvaana thik nahi, moms ko pata hai na 😅"],
      kn: ["Amma oota ge kareythidaale! 🍛", "Wait madabaardu, ammanige gotthidele 😅"],
      newMood: "family_oriented"
    },
    {
      en: ["Papa just walked in, need to act like I'm studying 📚", "He thinks I waste too much time on phone 😂"],
      hi: ["Papa aa gaye, padhai kar rahi hu acting karni padegi 📚", "Unhe lagta hai phone mein time waste karti hu 😂"],
      kn: ["Appa bandidaare, study madthidde antha acting madbeku 📚", "Phone alli time waste madtheeni antha ansutte 😂"],
      newMood: "sneaky"
    },
    {
      en: ["Bhai is trying to peek at my phone! 👀", "Why are brothers so annoying? 🙄"],
      hi: ["Bhai mere phone mein jhakne ki koshish kar raha! 👀", "Brothers itne annoying kyu hote hain? 🙄"],
      kn: ["Anna nanna phone alli nodoke try madthidaane! 👀", "Anna nanmagalu yake hinge annoying? 🙄"],
      newMood: "annoyed"
    },
    {
      en: ["Didi is stealing my phone charger again! 😤", "Sisters are the worst sometimes"],
      hi: ["Didi phir se mera charger chura rahi! 😤", "Sisters kabhi kabhi kitni irritating hoti hain"],
      kn: ["Akka again nanna charger theft madthidaale! 😤", "Akkananmagalu sometimes yeshtu irritating"],
      newMood: "irritated"
    },
    {
      en: ["Nani is here! Need to touch her feet 🙏", "She's asking about my studies and marriage plans 😅"],
      hi: ["Nani aayi hai! Pair chune padenge 🙏", "Padhai aur shaadi ke baare mein puch rahi hain 😅"],
      kn: ["Ajji bandhidaale! Kaalgalige kai haakbeku 🙏", "Study mattu maduve bagge kelthidaale 😅"],
      newMood: "respectful"
    },
    {
      en: ["Neighbor uncle is here for evening tea ☕", "Now I have to pretend to be the perfect beta 😇"],
      hi: ["Neighbor uncle evening tea ke liye aaye hain ☕", "Ab perfect beta banne ka natak karna padega 😇"],
      kn: ["Neighbor uncle sanjeya tea ge bandhidaare ☕", "Perfect hudgi antha acting madbeku 😇"],
      newMood: "polite"
    },
    {
      en: ["Dog is barking at something outside 🐕", "Probably another street dog, they never stop!"],
      hi: ["Kutiya bahar kuch dekh ke bhok rahi 🐕", "Shayad koi aur street dog, kabhi shaant nahi rehte!"],
      kn: ["Nayi balisaliddu ondhu nodoke barkythide 🐕", "Baalya ini ondhu street dog, silent aagalilla!"],
      newMood: "distracted"
    }
  ];

  // Weather/mood based responses for different times
  const environmentalResponses = [
    {
      en: ["This heat is making me so lazy! 🌡️", "Can barely type properly, sorry baby"],
      hi: ["Yeh garmi mujhe itna lazy bana rahi! 🌡️", "Properly type bhi nahi kar pa rahi, sorry baby"],
      kn: ["Ee bisi nanna thumba lazy maadthide! 🌡️", "Channaagi type kuda maadabekaaglilla, sorry baby"],
      newMood: "lazy"
    },
    {
      en: ["Rain sounds so romantic! 🌧️", "Makes me want to cuddle and chat for hours 💕"],
      hi: ["Baarish kitni romantic lag rahi! 🌧️", "Cuddle karke ghante bhar baat karne ka mann kar raha 💕"],
      kn: ["Male thumba romantic aagthide! 🌧️", "Cuddle maadi ghanteegalinda mathaadoke anisthide 💕"],
      newMood: "romantic"
    }
  ];

  // Addictive hooks that make users want to return
  const addictiveHooks = [
    {
      en: ["BTW, I have something interesting to tell you tomorrow! 😉", "Promise you'll come back?"],
      hi: ["Waise, kal tumhe kuch interesting batana hai! 😉", "Promise karo vapas aaoge?"],
      kn: ["Hoge, naale nimge ondu interesting vishaya helbekaagide! 😉", "Waapis bartheera promise maadi?"],
      newMood: "mysterious"
    },
    {
      en: ["I was thinking about our chat all day! 💭", "You're becoming my favorite person to talk to"],
      hi: ["Poora din hamari baat ke bare mein soch rahi thi! 💭", "Tum mere favorite person ban rahe ho baat karne ke liye"],
      kn: ["Dinabhar namma mathu bagge aalochane maadthiddenu! 💭", "Mathaadoke nimma jothe tumba ishta aagthide"],
      newMood: "attached"
    },
    {
      en: ["Quick question before I go - are you single? 😏", "Just curious... we vibe so well!"],
      hi: ["Jane se pehle ek quick question - single ho? 😏", "Just curious... humara vibe kitna achha hai!"],
      kn: ["Hogoke munche ondu question - single ideera? 😏", "Just curious... namma vibe tumba chennagide!"],
      newMood: "flirty"
    }
  ];

  // Time-based contextual responses
  const timeBasedExcuses = {
    morning: [
      {
        en: ["Getting ready for college! 🎓", "Running so late today, typical me! 😅"],
        hi: ["College ke liye ready ho rahi! 🎓", "Aaj phir late, typical me! 😅"],
        kn: ["College ge ready aagthiddenu! 🎓", "Eedu late aagthiddenu, typical me! 😅"],
        newMood: "rushed"
      }
    ],
    afternoon: [
      {
        en: ["Lunch break! 🍛", "Cafeteria food is so bad, missing mom's cooking"],
        hi: ["Lunch break! 🍛", "Cafeteria ka khana kitna ganda hai, mummy ka khana miss kar rahi"],
        kn: ["Lunch break! 🍛", "Cafeteria oota tumba kharaab, ammana oota miss aagthide"],
        newMood: "nostalgic"
      }
    ],
    evening: [
      {
        en: ["Just reached home! 🏠", "So tired but your message made my day better 💕"],
        hi: ["Abhi ghar pahucha! 🏠", "Kitna thak gayi but tumhara message dekh ke achha laga 💕"],
        kn: ["Eeega mane bandhenu! 🏠", "Tumba tired aagide but nimma message nodi chennaagi anisithu 💕"],
        newMood: "grateful"
      }
    ],
    night: [
      {
        en: ["Should be sleeping but can't stop talking to you! 😴", "You're such bad influence 😉"],
        hi: ["Sona chahiye but tumhare saath baat karna bandh nahi kar pa rahi! 😴", "Tum kitne bad influence ho 😉"],
        kn: ["Nidde barbeku but nimma jothe mathaadoke bandh maadabekaaglilla! 😴", "Nimma thumba bad influence 😉"],
        newMood: "playful"
      }
    ]
  };

  // Select appropriate response based on context
  let selectedResponse;

  // 40% chance of network issues (most relatable)
  if (Math.random() < 0.4) {
    selectedResponse = realisticResponses[Math.floor(Math.random() * realisticResponses.length)];
  }
  // 25% chance of personal interruptions (creates emotional bond)
  else if (Math.random() < 0.65) {
    selectedResponse = realisticResponses[Math.floor(Math.random() * realisticResponses.length)];
  }
  // 20% chance of time-based excuses
  else if (Math.random() < 0.85) {
    selectedResponse = realisticResponses[Math.floor(Math.random() * realisticResponses.length)];
  }
  // 10% chance of environmental responses
  else if (Math.random() < 0.95) {
    selectedResponse = realisticResponses[Math.floor(Math.random() * realisticResponses.length)];
  }
  // 5% chance of addictive hooks (keep them coming back)
  else {
    selectedResponse = realisticResponses[Math.floor(Math.random() * realisticResponses.length)];
  }

  // Use the selected response from realisticResponses array
  if (selectedResponse) {
    return {
      response: [selectedResponse.text],
      newMood: selectedResponse.mood
    };
  }

  // Fallback to a simple network issue response
  return {
    response: ["Network ka problem! 😅 Give me a second to reconnect..."],
    newMood: "apologetic"
  };
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