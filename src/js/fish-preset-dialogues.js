// Fish Preset Dialogues for Phase 0 Testing
// 4 personality types with 20 dialogues each

const FISH_PRESET_DIALOGUES = {
    cheerful: [
        "Oh wow, look at all these new friends swimming by! 🌊",
        "Today is going to be AMAZING, I can feel it!",
        "Hey, did you see that bubble? Hehe, that was me!",
        "Swimming is SO much fun! Want to race?",
        "I love making new friends in this tank! 💙",
        "Best day ever to be a fish!",
        "The water feels perfect today!",
        "Let's have an underwater party! 🎉",
        "I'm so happy I could do a flip!",
        "Look how sparkly the water is!",
        "What a beautiful day for swimming!",
        "I just love being alive!",
        "Every bubble is a little adventure!",
        "The tank is looking extra pretty today!",
        "I wonder what exciting things will happen today!",
        "Swimming makes everything better!",
        "I could swim like this forever!",
        "Life is good when you're a fish!",
        "The sun rays in the water are beautiful!",
        "I'm grateful for this wonderful tank! ✨"
    ],
    
    shy: [
        "Um... is it just me, or is the water a bit crowded today?",
        "I think I'll just swim quietly over here...",
        "Master hasn't visited in a while... I hope they're okay...",
        "*whispers* Hello there...",
        "I prefer the quieter corners of the tank...",
        "Is anyone else feeling a little nervous?",
        "Maybe I'll just hide behind this plant for a bit...",
        "I'm not very good at making friends...",
        "Sorry if I'm in your way...",
        "I hope no one notices me...",
        "The water seems so big and scary sometimes...",
        "I wish I was braver...",
        "Everyone else seems so confident...",
        "I'll just stay here if that's okay...",
        "Please don't mind me...",
        "I'm just a little fish in a big tank...",
        "I hope I'm not bothering anyone...",
        "Sometimes I wish I could be more outgoing...",
        "The quiet moments are nice too...",
        "I feel safe in this corner... 🌿"
    ],
    
    brave: [
        "Nothing can stop me today! Watch me swim!",
        "I'm ready for any adventure this tank has to offer!",
        "Don't worry, I'll protect this corner of the tank!",
        "Who wants to explore the deep end with me?",
        "I fear no current! Bring it on!",
        "Let me show you how it's done!",
        "Adventure awaits! Let's go!",
        "I was born to swim! 💪",
        "No wave is too big for me!",
        "I'll lead the way!",
        "Courage is my middle name!",
        "Let's discover what's beyond that plant!",
        "I'll swim where no fish has swum before!",
        "Challenges make me stronger!",
        "I'm not afraid of anything!",
        "Let's make this tank our kingdom!",
        "Together we can do anything!",
        "The brave fish gets the best spots!",
        "I live for excitement!",
        "Who's ready for an adventure? 🗡️"
    ],
    
    lazy: [
        "Zzz... oh, you're here? Just five more minutes...",
        "Swimming is overrated. Floating is where it's at.",
        "Why rush? The water's not going anywhere...",
        "Too much swimming today... need a nap...",
        "I'll swim later, promise... maybe...",
        "This spot is perfect for resting...",
        "Energy conservation is important, you know...",
        "I'm not lazy, I'm energy efficient...",
        "Let the current do the work for me...",
        "Why swim when you can drift? 😴",
        "I've found the perfect floating position...",
        "So... much... effort... to move...",
        "Can someone bring the food to me?",
        "I'm saving my energy for important stuff...",
        "The art of doing nothing is underrated...",
        "Relaxation is my specialty...",
        "I'll move when I feel like it...",
        "This is the life... no stress...",
        "I've mastered the art of chilling...",
        "Why be busy when you can be blissful? 🛌"
    ]
};

// Get random personality if not specified
function getRandomPersonality() {
    const personalities = Object.keys(FISH_PRESET_DIALOGUES);
    return personalities[Math.floor(Math.random() * personalities.length)];
}

// Get random dialogue for a personality
function getRandomDialogue(personality) {
    if (!personality || !FISH_PRESET_DIALOGUES[personality]) {
        personality = getRandomPersonality();
    }
    const dialogues = FISH_PRESET_DIALOGUES[personality];
    return dialogues[Math.floor(Math.random() * dialogues.length)];
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FISH_PRESET_DIALOGUES, getRandomDialogue, getRandomPersonality };
}

