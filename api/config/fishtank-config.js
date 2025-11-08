// =====================================================
// Fish Tank Configuration
// =====================================================
// Configuration for private fish tank features

module.exports = {
  // Cost in fish food tokens to change background
  BACKGROUND_CHANGE_COST: 3,
  
  // Available background images (using SVG placeholders, replace with JPG for production)
  BACKGROUNDS: [
    { 
      id: 1, 
      url: '/backgrounds/bg-1.svg', 
      name: 'Ocean Blue', 
      cost: 0,
      description: 'Classic blue ocean background'
    },
    { 
      id: 2, 
      url: '/backgrounds/bg-2.svg', 
      name: 'Deep Sea', 
      cost: 3,
      description: 'Mysterious deep ocean depths'
    },
    { 
      id: 3, 
      url: '/backgrounds/bg-3.svg', 
      name: 'Coral Reef', 
      cost: 3,
      description: 'Vibrant coral reef ecosystem'
    },
    { 
      id: 4, 
      url: '/backgrounds/bg-4.svg', 
      name: 'Sunset Ocean', 
      cost: 5,
      description: 'Beautiful sunset over calm waters'
    },
    { 
      id: 5, 
      url: '/backgrounds/bg-5.svg', 
      name: 'Glacier Waters', 
      cost: 5,
      description: 'Crystal clear arctic waters'
    }
  ],
  
  // Maximum number of favorites per user (optional limit)
  MAX_FAVORITES_PER_USER: 100,
  
  // Default tank settings
  DEFAULT_TANK_NAME: 'My Private Tank',
  DEFAULT_TANK_DESCRIPTION: 'My personal fish collection',
};














