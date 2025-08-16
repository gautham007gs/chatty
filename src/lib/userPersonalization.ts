
interface UserProfile {
  preferredTopics: string[];
  chatStyle: 'formal' | 'casual' | 'flirty' | 'friendly';
  lastActiveTime: number;
  favoriteEmojis: string[];
  commonQuestions: string[];
  responsePattern: 'short' | 'long' | 'mixed';
}

class UserPersonalization {
  private profiles = new Map<string, UserProfile>();
  
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
