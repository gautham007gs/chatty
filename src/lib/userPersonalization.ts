interface UserProfile {
  preferredTopics: string[];
  chatStyle: 'formal' | 'casual' | 'flirty' | 'friendly';
  lastActiveTime: number;
  favoriteEmojis: string[];
  commonQuestions: string[];
  responsePattern: 'short' | 'long' | 'mixed';
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
      responsePattern: 'mixed'
    };

    // Learn user's chat style
    if (message.length > 50) {
      profile.responsePattern = 'long';
    } else if (message.length < 15) {
      profile.responsePattern = 'short';
    }

    // Extract emojis user likes
    const emojis = message.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu);
    if (emojis) {
      profile.favoriteEmojis.push(...emojis.slice(0, 3));
      profile.favoriteEmojis = [...new Set(profile.favoriteEmojis)].slice(-10);
    }

    // Track common questions
    if (message.includes('?')) {
      profile.commonQuestions.push(message.toLowerCase().trim());
      profile.commonQuestions = profile.commonQuestions.slice(-5);
    }

    profile.lastActiveTime = Date.now();
    this.profiles.set(userId, profile);
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

    // Use API less for users with predictable patterns
    const isRepetitiveUser = profile.commonQuestions.some(q => 
      message.toLowerCase().includes(q.substring(0, 10))
    );

    if (isRepetitiveUser && Math.random() < 0.7) {
      return false; // Skip API call 70% of the time for repetitive users
    }

    return true;
  }
}

export const userPersonalization = new UserPersonalization();