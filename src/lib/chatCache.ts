
import crypto from 'crypto';

interface CacheEntry {
  response: any;
  timestamp: number;
  hitCount: number;
  originalPrompt: string;
  mood?: string;
  timeOfDay?: string;
}

class ChatCache {
  private cache = new Map<string, CacheEntry>();
  private readonly MAX_CACHE_SIZE = 2000; // Increased cache size
  private readonly CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days for better retention
  
  // Common patterns that users frequently ask
  private commonPatterns = [
    { pattern: /^(hi|hello|hey|hii+|helo+)\s*$/i, category: 'greeting' },
    { pattern: /^(how\s+are\s+you|kaise\s+ho|kaisi\s+ho)\s*\??$/i, category: 'wellbeing' },
    { pattern: /^(what\s+are\s+you\s+doing|kya\s+kar\s+rahi\s+ho|kya\s+kar\s+rahe\s+ho)\s*\??$/i, category: 'activity' },
    { pattern: /^(good\s+morning|good\s+night|gn|gm)\s*$/i, category: 'timegreeting' },
    { pattern: /^(bye|goodbye|tc|take\s+care)\s*$/i, category: 'farewell' },
    { pattern: /^(lol|haha|😂|🤣)\s*$/i, category: 'laugh' },
    { pattern: /^(ok|okay|hmm|k)\s*$/i, category: 'acknowledge' },
    { pattern: /^(pic\s+send|photo\s+bhejo|selfie|your\s+pic)\s*$/i, category: 'pic_request' },
  ];

  private createHash(prompt: string, mood?: string, timeOfDay?: string): string {
    // Normalize the prompt for better matching
    const normalizedPrompt = this.normalizePrompt(prompt);
    const context = `${normalizedPrompt}|${mood || ''}|${timeOfDay || ''}`;
    return crypto.createHash('sha256').update(context).digest('hex');
  }

  private normalizePrompt(prompt: string): string {
    return prompt.toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[.,!?;]+$/, '') // Remove trailing punctuation
      .replace(/[^\w\s]/g, ''); // Remove special characters except spaces
  }

  private findSimilarResponse(prompt: string, mood?: string, timeOfDay?: string): any | null {
    const normalizedPrompt = this.normalizePrompt(prompt);
    
    // Check for exact pattern matches first
    for (const { pattern, category } of this.commonPatterns) {
      if (pattern.test(normalizedPrompt)) {
        // Find cached response with same category
        for (const [key, entry] of this.cache.entries()) {
          if (entry.mood === mood && entry.timeOfDay === timeOfDay) {
            const entryNormalized = this.normalizePrompt(entry.originalPrompt);
            if (pattern.test(entryNormalized)) {
              entry.hitCount++;
              return JSON.parse(JSON.stringify(entry.response));
            }
          }
        }
      }
    }

    // Check for similar prompts (simple similarity)
    if (normalizedPrompt.length > 5) {
      for (const [key, entry] of this.cache.entries()) {
        if (entry.mood === mood && entry.timeOfDay === timeOfDay) {
          const entryNormalized = this.normalizePrompt(entry.originalPrompt);
          if (this.calculateSimilarity(normalizedPrompt, entryNormalized) > 0.85) {
            entry.hitCount++;
            return JSON.parse(JSON.stringify(entry.response));
          }
        }
      }
    }

    return null;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1;
    if (str1.length === 0 || str2.length === 0) return 0;
    
    // Simple character-based similarity
    const maxLength = Math.max(str1.length, str2.length);
    let matches = 0;
    
    for (let i = 0; i < Math.min(str1.length, str2.length); i++) {
      if (str1[i] === str2[i]) matches++;
    }
    
    return matches / maxLength;
  }

  set(prompt: string, response: any, mood?: string, timeOfDay?: string): void {
    const key = this.createHash(prompt, mood, timeOfDay);
    
    // If cache is at max size, remove least used entries
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      let leastUsedKey = '';
      let leastHits = Infinity;
      
      for (const [cacheKey, entry] of this.cache.entries()) {
        if (entry.hitCount < leastHits) {
          leastHits = entry.hitCount;
          leastUsedKey = cacheKey;
        }
      }
      
      if (leastUsedKey) {
        this.cache.delete(leastUsedKey);
      }
    }

    this.cache.set(key, {
      response: JSON.parse(JSON.stringify(response)), // Deep clone
      timestamp: Date.now(),
      hitCount: 0,
      originalPrompt: prompt,
      mood,
      timeOfDay
    });
  }

  get(prompt: string, mood?: string, timeOfDay?: string): any | null {
    // First try exact match
    const key = this.createHash(prompt, mood, timeOfDay);
    let entry = this.cache.get(key);
    
    // If no exact match, try similarity matching
    if (!entry) {
      const similarResponse = this.findSimilarResponse(prompt, mood, timeOfDay);
      if (similarResponse) {
        return similarResponse;
      }
      return null;
    }

    // Check if cache entry is expired
    if (Date.now() - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    // Increment hit count and return deep clone
    entry.hitCount++;
    return JSON.parse(JSON.stringify(entry.response));
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; totalHits: number } {
    let totalHits = 0;
    for (const entry of this.cache.values()) {
      totalHits += entry.hitCount;
    }
    return {
      size: this.cache.size,
      totalHits
    };
  }
}

// Export singleton instance
export const chatCache = new ChatCache();
