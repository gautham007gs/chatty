
import crypto from 'crypto';

interface CacheEntry {
  response: any;
  timestamp: number;
  hitCount: number;
}

class ChatCache {
  private cache = new Map<string, CacheEntry>();
  private readonly MAX_CACHE_SIZE = 1000; // Limit cache size
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  private createHash(prompt: string, mood?: string, timeOfDay?: string): string {
    // Include mood and timeOfDay in hash to ensure context-appropriate responses
    const context = `${prompt}|${mood || ''}|${timeOfDay || ''}`;
    return crypto.createHash('sha256').update(context).digest('hex');
  }

  set(prompt: string, response: any, mood?: string, timeOfDay?: string): void {
    const key = this.createHash(prompt, mood, timeOfDay);
    
    // If cache is at max size, remove oldest entries
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      response: JSON.parse(JSON.stringify(response)), // Deep clone
      timestamp: Date.now(),
      hitCount: 0
    });
  }

  get(prompt: string, mood?: string, timeOfDay?: string): any | null {
    const key = this.createHash(prompt, mood, timeOfDay);
    const entry = this.cache.get(key);
    
    if (!entry) {
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
