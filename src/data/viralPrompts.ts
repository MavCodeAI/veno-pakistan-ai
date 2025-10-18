export const VIRAL_PROMPTS = [
  // ASMR & Relaxing (1-20)
  "Raindrops sliding down a window with calm thunder",
  "Tea being poured slowly with gentle background hum",
  "Honey dripping over pancakes under warm golden light",
  "Candle flickering beside an open book — cozy night",
  "Steam rising from noodles in cinematic light",
  "Ink spreading on paper in slow motion",
  "Waves touching pebbles with soft wind sound",
  "Coffee swirl in transparent cup — aesthetic motion",
  "Typing keyboard softly with LED reflections",
  "Raindrops on green leaves — ASMR scene",
  "Milk pouring into coffee in slow motion",
  "Waterfall cascading over mossy rocks peacefully",
  "Crackling fireplace with warm orange glow",
  "Sand timer flowing gently in soft light",
  "Bamboo wind chimes swaying in gentle breeze",
  "Ice cubes dropping into glass with water splash",
  "Silk fabric flowing smoothly in air",
  "Flower petals falling in slow motion",
  "Morning dew drops on spider web",
  "Zen garden being raked in peaceful silence",

  // Nature & Landscapes (21-40)
  "Sunset over calm ocean with pastel sky",
  "Northern lights dancing across arctic sky",
  "Cherry blossoms falling in spring garden",
  "Mountain peak emerging from morning mist",
  "Desert dunes shifting under starry night",
  "Waterfall in tropical rainforest with rainbow",
  "Autumn leaves floating on river stream",
  "Thunderstorm over wheat field at dusk",
  "Misty forest path with sunlight filtering through",
  "Ocean waves crashing on rocky cliff",
  "Lavender field swaying in summer breeze",
  "Snow falling on pine forest silently",
  "Butterfly landing on wildflower meadow",
  "Canyon walls glowing at golden hour",
  "Moonlight reflecting on lake surface",
  "Rice terraces at sunrise with mist",
  "Sahara desert oasis at twilight",
  "Bioluminescent waves on beach at night",
  "Alpine meadow with wildflowers blooming",
  "Foggy morning in mystical forest",

  // Cinematic & Moody (41-60)
  "Neon city lights reflecting on wet streets",
  "Lonely train passing through misty mountains",
  "Old lighthouse beam cutting through storm",
  "Vintage car driving on coastal highway",
  "Silhouette walking in neon-lit alley at night",
  "Empty swing moving in abandoned playground",
  "Window view of rainy Tokyo at night",
  "Desert highway with setting sun ahead",
  "Astronaut floating in deep space",
  "Ancient temple in foggy bamboo forest",
  "Cyberpunk city with flying cars",
  "Hourglass in dimly lit vintage room",
  "Ghost ship sailing through stormy sea",
  "Medieval castle on misty cliff",
  "Time-lapse of city transforming day to night",
  "Abandoned amusement park at sunset",
  "Futuristic subway station with neon lights",
  "Old bookshop with warm amber lighting",
  "Airplane wing view above clouds at sunset",
  "Underground cave with glowing crystals",

  // Food & Lifestyle (61-80)
  "Chocolate sauce drizzling over ice cream",
  "Fresh bread being torn with steam rising",
  "Sushi chef preparing meal with precision",
  "Wine being poured into elegant glass",
  "Pizza cheese pull in slow motion",
  "Macaron tower in pastel colors",
  "Smoothie bowl being decorated with fruits",
  "Latte art being created in coffee cup",
  "Burger stack with melting cheese",
  "Fruit salad being tossed in crystal bowl",
  "Pasta being twirled on fork with sauce",
  "Chocolate fountain with strawberries",
  "Champagne bubbles rising in glass",
  "Croissant being torn showing layers",
  "Matcha being whisked in traditional bowl",
  "Dessert plating in fine dining restaurant",
  "Fresh juice being poured into glass",
  "Donuts being glazed with colorful icing",
  "Ramen being lifted with chopsticks steaming",
  "Caramel pouring over apple slices",

  // Abstract & Artistic (81-100)
  "Colorful paint mixing in water",
  "Geometric shapes morphing in loop",
  "Kaleidoscope patterns rotating smoothly",
  "Smoke wisps forming abstract shapes",
  "Liquid gold flowing in darkness",
  "Crystal prism creating rainbow light",
  "Digital glitch art transformation",
  "Marble ink swirling in milk",
  "Neon lines drawing geometric patterns",
  "Watercolor blooming on wet paper",
  "Holographic particles floating in space",
  "Liquid metal morphing shapes",
  "Aurora borealis inspired light waves",
  "Fractal patterns zooming infinitely",
  "Oil and water creating bubble art",
  "Sparkler creating light trails at night",
  "Bioluminescent plankton glowing in waves",
  "Chrome spheres reflecting environment",
  "Iridescent soap bubbles floating",
  "Particle explosion in slow motion"
];

// Function to get random prompts
export const getRandomPrompts = (count: number = 3): string[] => {
  const shuffled = [...VIRAL_PROMPTS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Function to get prompts by category
export const getPromptsByCategory = (category: string): string[] => {
  const categories: { [key: string]: number[] } = {
    asmr: Array.from({ length: 20 }, (_, i) => i),
    nature: Array.from({ length: 20 }, (_, i) => i + 20),
    cinematic: Array.from({ length: 20 }, (_, i) => i + 40),
    food: Array.from({ length: 20 }, (_, i) => i + 60),
    abstract: Array.from({ length: 20 }, (_, i) => i + 80),
  };
  
  const indices = categories[category] || [];
  return indices.map(i => VIRAL_PROMPTS[i]);
};
