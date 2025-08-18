
/**
 * Conversation state management for maintaining context in offline responses
 */

interface ConversationState {
  currentSituation: string | null;
  messageCount: number;
  hasStartedGoodbye: boolean;
  lastResponse: string | null;
  situationStartTime: number;
  userId: string | null;
  lastActiveTime: number;
}

class ConversationStateManager {
  private states: Map<string, ConversationState> = new Map();

  private getDefaultState(): ConversationState {
    return {
      currentSituation: null,
      messageCount: 0,
      hasStartedGoodbye: false,
      lastResponse: null,
      situationStartTime: Date.now(),
      userId: null,
      lastActiveTime: Date.now()
    };
  }

  getState(userId: string = 'default'): ConversationState {
    if (!this.states.has(userId)) {
      this.states.set(userId, this.getDefaultState());
    }
    return this.states.get(userId)!;
  }

  updateState(userId: string = 'default', updates: Partial<ConversationState>): void {
    const currentState = this.getState(userId);
    this.states.set(userId, { 
      ...currentState, 
      ...updates,
      lastActiveTime: Date.now()
    });
  }

  resetState(userId: string = 'default'): void {
    this.states.set(userId, this.getDefaultState());
  }

  // Clean up old states to prevent memory leaks
  cleanupOldStates(): void {
    const now = Date.now();
    const FOUR_HOURS = 4 * 60 * 60 * 1000; // Extended cleanup time
    
    for (const [userId, state] of this.states.entries()) {
      if (now - state.lastActiveTime > FOUR_HOURS) {
        this.states.delete(userId);
      }
    }
  }

  // Check if user is in goodbye state (offline)
  isUserOffline(userId: string = 'default'): boolean {
    const state = this.getState(userId);
    return state.hasStartedGoodbye;
  }

  // Start goodbye sequence
  startGoodbyeSequence(userId: string = 'default'): void {
    this.updateState(userId, {
      hasStartedGoodbye: true,
      currentSituation: null,
      situationStartTime: Date.now()
    });
  }

  // Check if enough time has passed to come back online
  shouldComeBackOnline(userId: string = 'default'): boolean {
    const state = this.getState(userId);
    const OFFLINE_DURATION = 8 * 60 * 1000; // 8 minutes offline for more realistic timing
    const timePassed = Date.now() - state.situationStartTime;
    
    // Only come back online if user was actually offline and enough time has passed
    return state.hasStartedGoodbye && timePassed > OFFLINE_DURATION;
  }

  // Bring user back online
  comeBackOnline(userId: string = 'default'): void {
    this.updateState(userId, {
      hasStartedGoodbye: false,
      messageCount: 0,
      currentSituation: null,
      situationStartTime: Date.now()
    });
  }

  // Get time elapsed in current situation (in minutes)
  getTimeElapsedInSituation(userId: string = 'default'): number {
    const state = this.getState(userId);
    return Math.floor((Date.now() - state.situationStartTime) / (60 * 1000));
  }

  // Check if situation should naturally progress
  shouldProgressSituation(userId: string = 'default'): boolean {
    const timeElapsed = this.getTimeElapsedInSituation(userId);
    const state = this.getState(userId);
    
    // Different situations have different natural durations
    const situationDurations: Record<string, number> = {
      'studySession': 20, // 20 minutes
      'familyTime': 15,   // 15 minutes  
      'gettingReady': 12, // 12 minutes
      'householdWork': 18 // 18 minutes
    };
    
    const expectedDuration = situationDurations[state.currentSituation || ''] || 15;
    return timeElapsed >= expectedDuration;
  }
}

export const conversationStateManager = new ConversationStateManager();

// Clean up old states every 2 hours
if (typeof window !== 'undefined') {
  setInterval(() => {
    conversationStateManager.cleanupOldStates();
  }, 2 * 60 * 60 * 1000); // Every 2 hours
}
