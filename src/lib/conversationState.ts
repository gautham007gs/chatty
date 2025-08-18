
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
      userId: null
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
    this.states.set(userId, { ...currentState, ...updates });
  }

  resetState(userId: string = 'default'): void {
    this.states.set(userId, this.getDefaultState());
  }

  // Clean up old states to prevent memory leaks
  cleanupOldStates(): void {
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;
    
    for (const [userId, state] of this.states.entries()) {
      if (now - state.situationStartTime > ONE_HOUR) {
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
    const OFFLINE_DURATION = 5 * 60 * 1000; // 5 minutes offline
    return state.hasStartedGoodbye && (Date.now() - state.situationStartTime > OFFLINE_DURATION);
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
}

export const conversationStateManager = new ConversationStateManager();

// Clean up old states every hour
if (typeof window !== 'undefined') {
  setInterval(() => {
    conversationStateManager.cleanupOldStates();
  }, 60 * 60 * 1000); // Every hour
}
