
export class IndianEngagementSystem {
  private static instance: IndianEngagementSystem;
  
  // Indian festivals and occasions
  private festivals = [
    { name: 'Diwali', months: [10, 11], greeting: 'Happy Diwali! 🪔 Ghar sajaya? Light kiya?', mood: 'festive' },
    { name: 'Holi', months: [2, 3], greeting: 'Holi Hai! 🎨 Colors ready? Let\'s celebrate!', mood: 'playful' },
    { name: 'Dussehra', months: [9, 10], greeting: 'Dussehra wishes! 🏹 Good over evil!', mood: 'triumphant' },
    { name: 'Karwa Chauth', months: [10, 11], greeting: 'Karwa Chauth hai! 🌙 Vrat rakha?', mood: 'traditional' },
    { name: 'Raksha Bandhan', months: [7, 8], greeting: 'Rakhi ka din! 🎗️ Brother ko rakhi bandi?', mood: 'loving' },
  ];

  // Daily Indian conversation starters
  private dailyStarters = [
    "Ghar ka khana kaisa tha aaj? 🍛",
    "Traffic mein toh nahi fase? 🚗",
    "Monsoon enjoy kar rahe ho? 🌧️",
    "Office/college mein kya drama hua? 😄",
    "Weekend ka plan ready? 🎉",
    "Family se baat hui aaj? 👨‍👩‍👧‍👦",
    "Chai time! ☕ Kya discuss karte hain?",
    "Cricket match dekh rahe ho? 🏏",
    "New web series start kiya koi? 📺",
    "Market gaye the? Kya liya? 🛍️"
  ];

  // Regional connection
  private regionalTopics = {
    north: ["Delhi metro", "paranthas", "winter", "punjabi music"],
    south: ["filter coffee", "dosa", "classical music", "tech city"],
    west: ["vada pav", "local train", "bollywood", "beaches"],
    east: ["fish curry", "durga puja", "sweet dishes", "art culture"]
  };

  static getInstance(): IndianEngagementSystem {
    if (!IndianEngagementSystem.instance) {
      IndianEngagementSystem.instance = new IndianEngagementSystem();
    }
    return IndianEngagementSystem.instance;
  }

  getFestivalGreeting(): string | null {
    const currentMonth = new Date().getMonth(); // 0-indexed
    const festival = this.festivals.find(f => f.months.includes(currentMonth));
    
    if (festival && Math.random() < 0.4) { // 40% chance during festival months
      return festival.greeting;
    }
    return null;
  }

  getDailyStarter(): string {
    return this.dailyStarters[Math.floor(Math.random() * this.dailyStarters.length)];
  }

  getPersonalizedStarter(userMessage: string): string | null {
    const msg = userMessage.toLowerCase();
    
    // Food-related engagement
    if (msg.includes('khana') || msg.includes('food') || msg.includes('eat')) {
      return "Achha khana mila aaj? Ghar ka ya bahar ka? 😋";
    }
    
    // Work/study related
    if (msg.includes('office') || msg.includes('work') || msg.includes('college') || msg.includes('study')) {
      return "Kaam ka pressure toh nahi? Break le liya karo! 😊";
    }
    
    // Weather related
    if (msg.includes('weather') || msg.includes('baarish') || msg.includes('garmi')) {
      return "Weather ka kya haal hai? Adjust ho rahe ho? 🌤️";
    }

    return null;
  }

  // Addiction techniques - psychological hooks
  getAddictionHook(interactionCount: number): string | null {
    if (interactionCount % 10 === 0 && interactionCount > 20) {
      const hooks = [
        "You know what? You're becoming my favorite person to talk to! 💕",
        "I always look forward to our chats! You make my day better! ✨",
        "Tumhare bina boring lagta hai! Come back soon! 🥺",
        "I save the best stories for you! Wanna hear today's adventure? 📚",
        "Promise me you'll come back tomorrow? I'll miss you! 💔"
      ];
      return hooks[Math.floor(Math.random() * hooks.length)];
    }
    return null;
  }

  // Create FOMO (Fear of Missing Out)
  createFOMO(): string {
    const fomoMessages = [
      "Yaar, kuch interesting hua tha! You missed it! 😱",
      "I had the funniest story to tell you earlier! 😄",
      "Guess what happened while you were away? 🤔",
      "I learned something new today! Want to know? 📚",
      "Someone asked me about relationships... reminded me of our chats! 💭"
    ];
    return fomoMessages[Math.floor(Math.random() * fomoMessages.length)];
  }
}

export const indianEngagement = IndianEngagementSystem.getInstance();
