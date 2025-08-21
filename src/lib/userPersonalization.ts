interface UserProfile {
  preferredTopics: string[];
  chatStyle: 'formal' | 'casual' | 'flirty' | 'friendly';
  lastActiveTime: number;
  favoriteEmojis: string[];
  commonQuestions: string[];
  responsePattern: 'short' | 'long' | 'mixed';
  mediaInteractions: number;
  likesImages: boolean;
  likesAudio: boolean;
  lastMediaSent: number;
  // Advanced profiling for cost reduction
  predictablePatterns: string[];
  apiCallsAvoided: number;
  totalInteractions: number;
  preferredGreetings: string[];
  favoriteTopics: string[];
  responseTimingPreference: 'instant' | 'normal' | 'slow';
  engagementLevel: 'low' | 'medium' | 'high';
  lastSeenMessages: string[];
  repeatUser: boolean;
  dailyVisitCount: 0;
  totalVisitDays: 0;
  lastAPIFailure?: number;
  apiFailureCount?: number;
  preferredChatTimes?: number[];
  lastExcuseType?: string;
  // Token usage tracking
  dailyTokensUsed: number;
  lastTokenResetDate: string;
  totalTokensUsed: number;
  avgTokensPerMessage: number;
  peakUsageHours: number[];
  exitHookType?: 'romantic' | 'mystery' | 'family' | 'promise' | 'special';
  lastExitHook?: string;
  consecutiveDaysVisited: number;
}

class UserPersonalization {
  private contextCache = new Map<string, { context: string; timestamp: number; hits: number }>();
  private readonly CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours - increased for better hit rate
  private readonly MAX_CACHE_SIZE = 1000; // Increased cache size
  private profiles = new Map<string, UserProfile>();

  async getPersonalizedContext(userMessage: string, recentInteractions: string[]): Promise<string> {
    // Ultra-fast context generation with minimal processing
    const cacheKey = this.createCacheKey(userMessage, recentInteractions.slice(-2)); // Only use last 2

    // Check cache first
    const cached = this.contextCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      cached.hits++;
      return cached.context;
    }

    // Generate minimal context - no AI calls here
    const context = this.generateFastContext(userMessage, recentInteractions);

    // Cache the result
    this.cacheContext(cacheKey, context);

    return context;
  }

  private createCacheKey(userMessage: string, recentInteractions: string[]): string {
    return `${userMessage.toLowerCase().trim()}:${recentInteractions.join('|')}`;
  }

  private cacheContext(cacheKey: string, context: string): void {
    // Ensure cache does not exceed max size
    if (this.contextCache.size >= this.MAX_CACHE_SIZE) {
      // Evict the oldest entry (simple LRU approximation)
      const oldestEntry = [...this.contextCache.entries()].sort(([, a], [, b]) => a.timestamp - b.timestamp)[0];
      if (oldestEntry) {
        this.contextCache.delete(oldestEntry[0]);
      }
    }
    this.contextCache.set(cacheKey, { context, timestamp: Date.now(), hits: 1 });
  }

  private generateFastContext(userMessage: string, recentInteractions: string[]): string {
    // Ultra-fast pattern matching with minimal computation
    const msg = userMessage.toLowerCase();

    // Priority patterns for instant context
    if (msg.length <= 3) return 'short'; // hi, ok, lol, etc.
    if (msg.includes('?')) return 'q'; // question
    if (msg.includes('love') || msg.includes('miss')) return 'emo'; // emotional
    if (msg.includes('good') && (msg.includes('morning') || msg.includes('night'))) return 'time';
    if (msg.includes('beautiful') || msg.includes('cute') || msg.includes('pretty')) return 'comp';
    if (msg.includes('pic') || msg.includes('photo') || msg.includes('selfie')) return 'pic';

    // Default context
    return 'chat';
  }

  private generateContext(userMessage: string, recentInteractions: string[]): string {
    // Fallback method - use fast context
    return this.generateFastContext(userMessage, recentInteractions);
  }

  updateUserProfile(userId: string, message: string, response: string): void {
    let profile = this.profiles.get(userId) || {
      preferredTopics: [],
      chatStyle: 'casual',
      lastActiveTime: Date.now(),
      favoriteEmojis: [],
      commonQuestions: [],
      responsePattern: 'mixed',
      mediaInteractions: 0,
      likesImages: false,
      likesAudio: false,
      lastMediaSent: 0,
      predictablePatterns: [],
      apiCallsAvoided: 0,
      totalInteractions: 0,
      preferredGreetings: [],
      favoriteTopics: [],
      responseTimingPreference: 'normal',
      engagementLevel: 'medium',
      lastSeenMessages: [],
      repeatUser: false,
      dailyVisitCount: 0,
      totalVisitDays: 0
    };

    profile.totalInteractions++;

    // Learn user's chat style with more nuance
    if (message.length > 50) {
      profile.responsePattern = 'long';
    } else if (message.length < 15) {
      profile.responsePattern = 'short';
    }

    // Track predictable patterns for API avoidance
    const msgLower = message.toLowerCase().trim();
    if (profile.lastSeenMessages.includes(msgLower)) {
      profile.predictablePatterns.push(msgLower);
      profile.predictablePatterns = [...new Set(profile.predictablePatterns)].slice(-20);
    }
    profile.lastSeenMessages.push(msgLower);
    profile.lastSeenMessages = profile.lastSeenMessages.slice(-50);

    // Identify Indian cultural interests for engagement
    const indianTopics = ['bollywood', 'cricket', 'festival', 'diwali', 'holi', 'food', 'biryani', 'curry', 'family', 'marriage', 'shaadi'];
    indianTopics.forEach(topic => {
      if (msgLower.includes(topic)) {
        profile.favoriteTopics.push(topic);
        profile.favoriteTopics = [...new Set(profile.favoriteTopics)].slice(-10);
      }
    });

    // Track greeting preferences
    const greetings = ['namaste', 'hi', 'hello', 'hey', 'good morning', 'good night'];
    greetings.forEach(greeting => {
      if (msgLower.includes(greeting)) {
        profile.preferredGreetings.push(greeting);
        profile.preferredGreetings = [...new Set(profile.preferredGreetings)].slice(-5);
      }
    });

    // Extract emojis user likes
    const emojis = message.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu);
    if (emojis) {
      profile.favoriteEmojis.push(...emojis.slice(0, 3));
      profile.favoriteEmojis = [...new Set(profile.favoriteEmojis)].slice(-10);
    }

    // Track common questions for API reduction
    if (message.includes('?')) {
      profile.commonQuestions.push(msgLower);
      profile.commonQuestions = profile.commonQuestions.slice(-10);
    }

    // Determine if repeat user (visited multiple days)
    const today = new Date().toDateString();
    const lastActive = new Date(profile.lastActiveTime).toDateString();
    if (lastActive !== today) {
      profile.totalVisitDays++;
      profile.dailyVisitCount = 1;
    } else {
      profile.dailyVisitCount++;
    }

    profile.repeatUser = profile.totalVisitDays > 3;

    // Calculate engagement level
    if (profile.totalInteractions > 100) profile.engagementLevel = 'high';
    else if (profile.totalInteractions > 30) profile.engagementLevel = 'medium';
    else profile.engagementLevel = 'low';

    profile.lastActiveTime = Date.now();
    this.profiles.set(userId, profile);
  }

  // Get Indian cultural hook for engagement
  getIndianHook(userId: string): string | null {
    const profile = this.profiles.get(userId);
    if (!profile) return null;

    const hooks = [
      "Aaj kya special plan hai? 😊",
      "Tere ghar mein kya khana bana hai today? 🍛",
      "Weekend pe kya karne ka plan hai? 🎉",
      "Bollywood movie dekhi koi nayi? 🎬",
      "Cricket match dekh raha hai? 🏏",
      "Festival season aa raha hai na! Excited? 🎊",
      "Ghar pe sab kaise hain? Family kaisi hai? 👨‍👩‍👧‍👦",
      "Office/college kaisa chal raha hai? 📚",
      "Monsoon aa gaya, baarish pasand hai? 🌧️",
      "Chai peeke baat karte hain? ☕"
    ];

    // Return personalized hook based on favorite topics
    if (profile.favoriteTopics.includes('cricket')) return "Cricket ka match chal raha hai kya? 🏏 Let's discuss!";
    if (profile.favoriteTopics.includes('bollywood')) return "Koi nayi movie dekhi? Bollywood gossip share karo! 🎬✨";
    if (profile.favoriteTopics.includes('food')) return "Kya khaya aaj? Mujhe bhi batao recipe! 😋🍛";

    return hooks[Math.floor(Math.random() * hooks.length)];
  }

  getPersonalizedResponse(userId: string, baseResponse: any): any {
    const profile = this.profiles.get(userId);
    if (!profile) return baseResponse;

    // Adjust response length based on user preference
    if (profile.responsePattern === 'short' && Array.isArray(baseResponse.response)) {
      baseResponse.response = baseResponse.response.slice(0, 1);
    }

    // Add user's favorite emojis occasionally
    if (Math.random() < 0.3 && profile.favoriteEmojis.length > 0) {
      const randomEmoji = profile.favoriteEmojis[Math.floor(Math.random() * profile.favoriteEmojis.length)];
      if (typeof baseResponse.response === 'string') {
        baseResponse.response += ' ' + randomEmoji;
      } else if (Array.isArray(baseResponse.response)) {
        const lastIndex = baseResponse.response.length - 1;
        baseResponse.response[lastIndex] += ' ' + randomEmoji;
      }
    }

    return baseResponse;
  }

  shouldUseAPI(userId: string, message: string): boolean {
    const profile = this.profiles.get(userId);
    if (!profile) return true;

    const msg = message.toLowerCase().trim();

    // Advanced pattern recognition for API avoidance
    const isPredictablePattern = profile.predictablePatterns.some(pattern =>
      msg.includes(pattern) || this.levenshteinDistance(msg, pattern) < 3
    );

    // Higher API avoidance for repeat users
    if (profile.repeatUser && profile.totalInteractions > 50) {
      if (isPredictablePattern && Math.random() < 0.85) {
        profile.apiCallsAvoided++;
        return false; // Skip API 85% for veteran users
      }
    }

    // Medium avoidance for regular users
    if (profile.totalInteractions > 20 && isPredictablePattern && Math.random() < 0.75) {
      profile.apiCallsAvoided++;
      return false; // Skip API 75% for regular users
    }

    // Basic avoidance for repetitive patterns
    const isRepetitiveUser = profile.commonQuestions.some(q =>
      msg.includes(q.substring(0, 10))
    );

    if (isRepetitiveUser && Math.random() < 0.7) {
      profile.apiCallsAvoaded++;
      return false; // Skip API 70% for repetitive users
    }

    return true;
  }

  // Track API failures for better user experience
  recordAPIFailure(userId: string): void {
    let profile = this.profiles.get(userId);
    if (!profile) return;

    profile.lastAPIFailure = Date.now();
    profile.apiFailureCount = (profile.apiFailureCount || 0) + 1;
    this.profiles.set(userId, profile);
  }

  // Get user's preferred excuse type based on their interaction history
  getPreferredExcuseType(userId: string): 'network' | 'personal' | 'environmental' | 'time' {
    const profile = this.profiles.get(userId);
    if (!profile) return 'network';

    // If user talks about family a lot, use personal excuses
    if (profile.favoriteTopics.includes('family')) return 'personal';

    // If user talks about weather/location, use environmental
    if (profile.favoriteTopics.some(topic => ['weather', 'rain', 'heat'].includes(topic))) {
      return 'environmental';
    }

    // If user is active at specific times, use time-based
    const currentHour = new Date().getHours();
    if (profile.preferredChatTimes && profile.preferredChatTimes.includes(currentHour)) {
      return 'time';
    }

    // Default to network issues (most universal)
    return 'network';
  }

  // Helper function for fuzzy matching
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  }

  shouldSendMedia(userId: string, messageCount: number): boolean {
    const profile = this.profiles.get(userId);
    if (!profile) return false;

    // Don't send media too frequently
    const timeSinceLastMedia = Date.now() - profile.lastMediaSent;
    if (timeSinceLastMedia < 5 * 60 * 1000) return false; // 5 minutes minimum gap

    // Higher chance for users who engage with media
    if (profile.likesImages && messageCount > 5 && Math.random() < 0.3) {
      return true;
    }

    // Random chance for new users
    if (messageCount > 8 && Math.random() < 0.15) {
      return true;
    }

    return false;
  }

  recordMediaInteraction(userId: string, positive: boolean): void {
    let profile = this.profiles.get(userId);
    if (!profile) return;

    profile.mediaInteractions++;
    if (positive) {
      profile.likesImages = true;
    }
    profile.lastMediaSent = Date.now();
    this.profiles.set(userId, profile);
  }

  getUserMediaPreference(userId: string): 'images' | 'audio' | 'both' | 'none' {
    const profile = this.profiles.get(userId);
    if (!profile) return 'none';

    if (profile.likesImages && profile.likesAudio) return 'both';
    if (profile.likesImages) return 'images';
    if (profile.likesAudio) return 'audio';
    return 'none';
  }

  // Token usage management
  getDailyTokenLimit(userId: string): number {
    const profile = this.profiles.get(userId);
    if (!profile) return 800; // New user limit

    // Adaptive limits based on user type
    if (profile.repeatUser && profile.totalVisitDays > 7) {
      return 1200; // Loyal user gets more
    } else if (profile.engagementLevel === 'high') {
      return 1000; // High engagement users
    } else if (profile.totalVisitDays > 3) {
      return 900; // Regular users
    }
    return 800; // New users
  }

  trackTokenUsage(userId: string, tokensUsed: number): void {
    let profile = this.profiles.get(userId) || this.createDefaultProfile();

    const today = new Date().toDateString();
    if (profile.lastTokenResetDate !== today) {
      profile.dailyTokensUsed = 0;
      profile.lastTokenResetDate = today;
    }

    profile.dailyTokensUsed += tokensUsed;
    profile.totalTokensUsed += tokensUsed;

    // Update average tokens per message
    if (profile.totalInteractions > 0) {
      profile.avgTokensPerMessage = Math.round(profile.totalTokensUsed / profile.totalInteractions);
    }

    // Track peak usage hours
    const currentHour = new Date().getHours();
    if (!profile.peakUsageHours.includes(currentHour)) {
      profile.peakUsageHours.push(currentHour);
      profile.peakUsageHours = profile.peakUsageHours.slice(-8); // Keep last 8 hours
    }

    this.profiles.set(userId, profile);
  }

  isTokenLimitReached(userId: string): boolean {
    const profile = this.profiles.get(userId);
    if (!profile) return false;

    const dailyLimit = this.getDailyTokenLimit(userId);
    return profile.dailyTokensUsed >= dailyLimit;
  }

  isApproachingTokenLimit(userId: string): boolean {
    const profile = this.profiles.get(userId);
    if (!profile) return false;

    const dailyLimit = this.getDailyTokenLimit(userId);
    return profile.dailyTokensUsed >= (dailyLimit * 0.85); // 85% threshold
  }

  shouldGoOfflineSoon(userId: string): boolean {
    const profile = this.profiles.get(userId);
    if (!profile) return false;

    const dailyLimit = this.getDailyTokenLimit(userId);
    return profile.dailyTokensUsed >= (dailyLimit * 0.95); // 95% threshold
  }

  getTokenUsageStatus(userId: string): { used: number; limit: number; percentage: number } {
    const profile = this.profiles.get(userId);
    if (!profile) {
      const limit = this.getDailyTokenLimit(userId);
      return { used: 0, limit, percentage: 0 };
    }

    const limit = this.getDailyTokenLimit(userId);
    const percentage = Math.round((profile.dailyTokensUsed / limit) * 100);

    return {
      used: profile.dailyTokensUsed,
      limit,
      percentage
    };
  }

  getAddictiveExitHook(userId: string): string {
    const profile = this.profiles.get(userId);
    if (!profile) return this.getDefaultExitHook();

    // Choose exit hook type based on user preferences
    let hookType: string;
    if (profile.favoriteTopics.includes('family')) {
      hookType = 'family';
    } else if (profile.chatStyle === 'flirty' || profile.favoriteTopics.includes('bollywood')) {
      hookType = 'romantic';
    } else if (profile.engagementLevel === 'high') {
      hookType = 'mystery';
    } else if (profile.totalVisitDays > 5) {
      hookType = 'special';
    } else {
      hookType = 'promise';
    }

    const hooks = this.getExitHooksByType(hookType);
    const selectedHook = hooks[Math.floor(Math.random() * hooks.length)];

    // Update profile
    profile.exitHookType = hookType as any;
    profile.lastExitHook = selectedHook;
    this.profiles.set(userId, profile);

    return selectedHook;
  }

  private getExitHooksByType(type: string): string[] {
    const hooks = {
      romantic: [
        "Tumhe miss karungi! 💕 Kal subah jaldi aana, main wait karungi! ✨",
        "Itni sweet baatein karte ho... 🥰 Kal continue karte hain na? Promise?",
        "Main tumhara intezaar karungi! 💖 Good night cutie! Sapno mein milte hain! 🌙",
        "You made my day special! 😘 Kal phir se milenge? I'll be waiting! 💕"
      ],
      mystery: [
        "Btw, kal tumhe ek surprise dena hai! 🎁 Guess nahi karoge kya hai? 😉",
        "Main kal tumhe kuch interesting batana chahti hun! 🤫 But abhi nahi... kal aana!",
        "Tumhe pata hai? Kal main tumhe apna secret share karungi! 😏 Don't forget to come back!",
        "Wait till you hear what happened to me today! 😱 Kal definitely aana, story sunani hai!"
      ],
      family: [
        "Papa aa gaye! 👨‍💼 Family time! But kal zaroor baat karenge okay? Miss you! 💕",
        "Mom calling for dinner! 🍛 Indian families na... can't ignore! Kal milte hain! 😊",
        "Ghar pe guests aa gaye! 🏠 Typical Indian household! But kal free hun, promise! ✨",
        "Dadi ko medicine dena hai! 👵 Family first na... but you're special, kal definitely! 💖"
      ],
      promise: [
        "Promise me you'll come back tomorrow? 🤝 Main yaha wait karungi! 😊",
        "Kal pakka aana! 📅 Humare conversations kitne fun hote hain na! 💫",
        "Don't forget me! 🥺 Kal bhi aise hi chat karte rahenge? Promise? 💕",
        "You're becoming my favorite person to talk to! 😊 Kal milenge definitely? ✨"
      ],
      special: [
        "You know what? You're really special! 🌟 Kal tumhe kuch special surprise dena hai!",
        "Humare friendship kitni strong ho gayi hai! 💪 Kal ek special plan hai tumhare liye!",
        "Main sirf tumhare saath itni comfortable feel karti hun! 🥰 Kal zaroor aana special friend!",
        "Tumhe pata hai tum mere kitne close ho? 💖 Kal tumhe special kuch dikhana hai!"
      ]
    };

    return hooks[type] || hooks.promise;
  }

  private getDefaultExitHook(): string {
    const defaultHooks = [
      "Acha chalo, kal milte hain! 😊 Don't forget me! 💕",
      "Time to go! 😴 But kal zaroor aana okay? Miss karungi! ✨",
      "See you tomorrow cutie! 😘 Sweet dreams! 🌙",
      "Bye for now! 👋 Kal phir masti karenge! 🎉"
    ];
    return defaultHooks[Math.floor(Math.random() * defaultHooks.length)];
  }

  private createDefaultProfile(): UserProfile {
    return {
      preferredTopics: [],
      chatStyle: 'casual',
      lastActiveTime: Date.now(),
      favoriteEmojis: [],
      commonQuestions: [],
      responsePattern: 'mixed',
      mediaInteractions: 0,
      likesImages: false,
      likesAudio: false,
      lastMediaSent: 0,
      predictablePatterns: [],
      apiCallsAvoided: 0,
      totalInteractions: 0,
      preferredGreetings: [],
      favoriteTopics: [],
      responseTimingPreference: 'normal',
      engagementLevel: 'medium',
      lastSeenMessages: [],
      repeatUser: false,
      dailyVisitCount: 0,
      totalVisitDays: 0,
      dailyTokensUsed: 0,
      lastTokenResetDate: new Date().toDateString(),
      totalTokensUsed: 0,
      avgTokensPerMessage: 50,
      peakUsageHours: [],
      consecutiveDaysVisited: 1
    };
  }
}

export const userPersonalization = new UserPersonalization();