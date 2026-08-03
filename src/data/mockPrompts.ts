export interface PromptItem {
  id: string;
  imageUrl: string;
  promptText: string;
  category: string;
}

export const mockPrompts: PromptItem[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1074&auto=format&fit=crop',
    promptText: 'A futuristic city skyline at sunset, cyberpunk style, neon lights, highly detailed, 8k resolution, photorealistic.',
    category: 'Cyberpunk'
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1682687220199-d0124f48f95b?q=80&w=1170&auto=format&fit=crop',
    promptText: 'A cute red panda astronaut exploring a glowing alien flora planet, cinematic lighting, unreal engine 5 render.',
    category: 'Sci-Fi'
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1542314831-c6a4d14eff51?q=80&w=1074&auto=format&fit=crop',
    promptText: 'A mystical forest with glowing mushrooms and ancient ruins, ethereal atmosphere, fantasy concept art, trending on artstation.',
    category: 'Fantasy'
  },
  {
    id: '4',
    imageUrl: 'https://images.unsplash.com/photo-1682687982501-1e58f813f228?q=80&w=1170&auto=format&fit=crop',
    promptText: 'Minimalist vector art of a coffee cup on a yellow background, clean lines, flat design, modern aesthetic.',
    category: 'Minimalist'
  },
  {
    id: '5',
    imageUrl: 'https://images.unsplash.com/photo-1682695796254-12bf20875cce?q=80&w=1170&auto=format&fit=crop',
    promptText: 'A steampunk mechanical owl perched on a brass gear, intricate details, moody Victorian lighting.',
    category: 'Steampunk'
  },
  {
    id: '6',
    imageUrl: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=1074&auto=format&fit=crop',
    promptText: 'Portrait of a woman with glowing neon tattoos, cyberpunk street wear, rainy neon city background, bokeh.',
    category: 'Portrait'
  },
];
