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
  dailyVisitCount: number;
  totalVisitDays: number;
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
      profile.apiCallsAvoided++;
      return false; // Skip API 70% for repetitive users
    }

    return true;
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
}

export const userPersonalization = new UserPersonalization();