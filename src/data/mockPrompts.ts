export interface PromptItem {
  id: string;
  imageUrl: string;
  promptText: string;
  category: string;
}

export const mockPrompts: PromptItem[] = [
  // ── Cyberpunk ──
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1074&auto=format&fit=crop',
    promptText: 'A futuristic city skyline at sunset, cyberpunk style, neon lights, highly detailed, 8k resolution, photorealistic.',
    category: 'Cyberpunk'
  },
  {
    id: '7',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1074&auto=format&fit=crop',
    promptText: 'A cyberpunk street vendor selling glowing synth-ramen on a rainy alleyway, holographic advertisements, cinematic lighting.',
    category: 'Cyberpunk'
  },
  {
    id: '8',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1074&auto=format&fit=crop',
    promptText: 'Mechanical cybernetic geisha with glowing fiber optic hair, neon pink and turquoise lighting, reflective metallic faceplate, futuristic art.',
    category: 'Cyberpunk'
  },
  {
    id: '19',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1074&auto=format&fit=crop',
    promptText: 'A hacker workstation in a neon-drenched cyberpunk apartment, multiple glowing monitors showing lines of code, cable clutter, cozy retro-futuristic vibes.',
    category: 'Cyberpunk'
  },
  {
    id: '20',
    imageUrl: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?q=80&w=1074&auto=format&fit=crop',
    promptText: 'High speed chase on a cyberpunk highway, sleek futuristic sports car leaving light trails, massive holographic billboards reflecting off the wet asphalt.',
    category: 'Cyberpunk'
  },

  // ── Sci-Fi ──
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1682687220199-d0124f48f95b?q=80&w=1170&auto=format&fit=crop',
    promptText: 'A cute red panda astronaut exploring a glowing alien flora planet, cinematic lighting, unreal engine 5 render.',
    category: 'Sci-Fi'
  },
  {
    id: '9',
    imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=1074&auto=format&fit=crop',
    promptText: 'Massive starship hovering over a futuristic colony on a desert planet, two moons in the sky, sci-fi concept art, high detailed.',
    category: 'Sci-Fi'
  },
  {
    id: '10',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1172&auto=format&fit=crop',
    promptText: 'An astronaut sitting on the edge of a space station looking down at a beautiful blue Earth, cosmic nebula background, starry space.',
    category: 'Sci-Fi'
  },
  {
    id: '21',
    imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1172&auto=format&fit=crop',
    promptText: 'A high-tech research facility located on a frozen moon of Jupiter, blue laser grids, ice caves, futuristic machinery glowing.',
    category: 'Sci-Fi'
  },
  {
    id: '22',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1170&auto=format&fit=crop',
    promptText: 'A vast futuristic city built inside a colossal biodome on Mars, lush green parks surrounded by sleek white skyscrapers, red martian landscape outside.',
    category: 'Sci-Fi'
  },


  {
    id: '11',
    imageUrl: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?q=80&w=1074&auto=format&fit=crop',
    promptText: 'An ancient wizard castle perched on a floating mountain peak, waterfalls falling into the sky, clouds passing, epic scale fantasy.',
    category: 'Fantasy'
  },
  {
    id: '12',
    imageUrl: 'https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?q=80&w=1074&auto=format&fit=crop',
    promptText: 'A majestic ice dragon sitting on top of a frozen crystal mountain, glowing blue flames, magical fantasy concept art.',
    category: 'Fantasy'
  },
  {
    id: '23',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1074&auto=format&fit=crop',
    promptText: 'An elf archer standing on a giant tree branch overlooking a golden sunlit valley, ancient forest canopy, magical sun rays, high fantasy.',
    category: 'Fantasy'
  },
  {
    id: '24',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1170&auto=format&fit=crop',
    promptText: 'A secret glowing library hidden deep inside a cave, bookshelves carved out of crystals, floating spellbooks, magical scrolls.',
    category: 'Fantasy'
  },


  {
    id: '13',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1064&auto=format&fit=crop',
    promptText: 'Minimalistic abstract background with pastel geometric shapes, clean circles and lines, modern simple aesthetic design.',
    category: 'Minimalist'
  },
  {
    id: '14',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1045&auto=format&fit=crop',
    promptText: 'Single green botanical palm leaf on a clean warm beige background, minimal flat art style, elegant composition.',
    category: 'Minimalist'
  },
  {
    id: '25',
    imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1074&auto=format&fit=crop',
    promptText: 'Abstract art of a single black line forming a face silhouette on a neutral grey background, minimalism, simple style.',
    category: 'Minimalist'
  },
  {
    id: '26',
    imageUrl: 'https://images.unsplash.com/photo-1502239608882-93b729c6af43?q=80&w=1170&auto=format&fit=crop',
    promptText: 'A simple wooden chair casting a long shadow on an empty white wall, aesthetic minimalist interior design, high contrast.',
    category: 'Minimalist'
  },


  {
    id: '15',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1047&auto=format&fit=crop',
    promptText: 'Steampunk locomotive train travelling through a grand station, massive copper pipes, steam fog, intricate brass gauges.',
    category: 'Steampunk'
  },
  {
    id: '16',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1170&auto=format&fit=crop',
    promptText: 'A vintage steampunk pocket watch with exposed inner glowing brass gears, copper cogs, dark moody background, high resolution.',
    category: 'Steampunk'
  },
  {
    id: '27',
    imageUrl: 'https://images.unsplash.com/photo-1510519138101-570d1dca3d66?q=80&w=1170&auto=format&fit=crop',
    promptText: 'A steampunk laboratory filled with glass test tubes, brass valves, boiling neon liquids, mechanical clocks on the wall.',
    category: 'Steampunk'
  },
  {
    id: '28',
    imageUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1074&auto=format&fit=crop',
    promptText: 'Steampunk airship fleet floating through golden clouds during sunset, brass propellers spinning, majestic sky exploration.',
    category: 'Steampunk'
  },

  // ── Portrait ──
  {
    id: '6',
    imageUrl: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=1074&auto=format&fit=crop',
    promptText: 'Portrait of a woman with glowing neon tattoos, cyberpunk street wear, rainy neon city background, bokeh.',
    category: 'Portrait'
  },
  {
    id: '17',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1064&auto=format&fit=crop',
    promptText: 'Close-up cinematic portrait of a woman, warm sunset lighting, soft shadows, sharp detail, photography style.',
    category: 'Portrait'
  },
  {
    id: '18',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1074&auto=format&fit=crop',
    promptText: 'Studio headshot portrait of a man, dark dramatic background, high contrast professional lighting, monochrome art style.',
    category: 'Portrait'
  },
  {
    id: '29',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1074&auto=format&fit=crop',
    promptText: 'Cinematic portrait of a warrior chief in ceremonial wear, dramatic campfire lighting, high detail skin texture, dark background.',
    category: 'Portrait'
  },
  {
    id: '30',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1074&auto=format&fit=crop',
    promptText: 'A joyful portrait of a woman laughing, bright outdoor natural sunlight, green foliage blurred background, high quality.',
    category: 'Portrait'
  },
];
