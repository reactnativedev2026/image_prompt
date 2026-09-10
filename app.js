/**
 * ImagePrompt - Client-Side Interactive Engine
 */

// Comprehensive curated prompts database matching the mobile app repository
const PROMPTS_DATA = [
  // Cyberpunk
  {
    id: '1',
    title: 'Cyberpunk Metropolis',
    category: 'Cyberpunk',
    rating: '4.8K',
    ratingNum: 4.8,
    isTrending: true,
    imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1074&auto=format&fit=crop',
    promptText: 'A futuristic city skyline at sunset, cyberpunk style, neon lights, highly detailed, 8k resolution, photorealistic, cinematic volumetric fog.',
    aspect: '16:9',
    model: 'Midjourney v6'
  },
  {
    id: '7',
    title: 'Cyberpunk Ramen Vendor',
    category: 'Cyberpunk',
    rating: '3.2K',
    ratingNum: 3.2,
    isTrending: true,
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1074&auto=format&fit=crop',
    promptText: 'A cyberpunk street vendor selling glowing synth-ramen on a rainy alleyway, holographic advertisements, cinematic lighting, neon reflections on asphalt.',
    aspect: '16:9',
    model: 'DALL·E 3'
  },
  {
    id: '8',
    title: 'Mechanical Cyber Geisha',
    category: 'Cyberpunk',
    rating: '5.6K',
    ratingNum: 5.6,
    isTrending: true,
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1074&auto=format&fit=crop',
    promptText: 'Mechanical cybernetic geisha with glowing fiber optic hair, neon pink and turquoise lighting, reflective metallic faceplate, futuristic digital art.',
    aspect: '1:1',
    model: 'Midjourney v6'
  },
  {
    id: '19',
    title: 'Neon Hacker Station',
    category: 'Cyberpunk',
    rating: '2.9K',
    ratingNum: 2.9,
    isTrending: false,
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1074&auto=format&fit=crop',
    promptText: 'A hacker workstation in a neon-drenched cyberpunk apartment, multiple glowing monitors showing lines of code, cable clutter, cozy retro-futuristic aesthetic.',
    aspect: '16:9',
    model: 'Leonardo AI'
  },

  // Sci-Fi
  {
    id: '2',
    title: 'Red Panda Astronaut',
    category: 'Sci-Fi',
    rating: '4.9K',
    ratingNum: 4.9,
    isTrending: true,
    imageUrl: 'https://images.unsplash.com/photo-1682687220199-d0124f48f95b?q=80&w=1170&auto=format&fit=crop',
    promptText: 'A cute red panda astronaut exploring a glowing alien flora planet, cinematic lighting, unreal engine 5 render, highly detailed fur texture.',
    aspect: '1:1',
    model: 'DALL·E 3'
  },
  {
    id: '9',
    title: 'Colossal Starship Arrival',
    category: 'Sci-Fi',
    rating: '3.8K',
    ratingNum: 3.8,
    isTrending: false,
    imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=1074&auto=format&fit=crop',
    promptText: 'Massive starship hovering over a futuristic colony on a desert planet, two moons in the sky, sci-fi concept art, highly detailed, wide angle lens.',
    aspect: '16:9',
    model: 'Midjourney v6'
  },
  {
    id: '10',
    title: 'Deep Space Orbit Watcher',
    category: 'Sci-Fi',
    rating: '5.1K',
    ratingNum: 5.1,
    isTrending: true,
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1172&auto=format&fit=crop',
    promptText: 'An astronaut sitting on the edge of an orbital space station looking down at a beautiful blue Earth, cosmic nebula background, starry space, 8k resolution.',
    aspect: '16:9',
    model: 'Midjourney v6'
  },
  {
    id: '22',
    title: 'Martian Biosphere City',
    category: 'Sci-Fi',
    rating: '3.4K',
    ratingNum: 3.4,
    isTrending: false,
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1170&auto=format&fit=crop',
    promptText: 'A vast futuristic city built inside a colossal biodome on Mars, lush green parks surrounded by sleek white skyscrapers, red martian landscape outside.',
    aspect: '16:9',
    model: 'Google Gemini'
  },

  // Fantasy
  {
    id: '11',
    title: 'Floating Sky Castle',
    category: 'Fantasy',
    rating: '4.7K',
    ratingNum: 4.7,
    isTrending: true,
    imageUrl: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?q=80&w=1074&auto=format&fit=crop',
    promptText: 'An ancient wizard castle perched on a floating mountain peak, waterfalls falling into the sky, clouds passing, epic scale fantasy, golden sunset backlight.',
    aspect: '16:9',
    model: 'Midjourney v6'
  },
  {
    id: '12',
    title: 'Majestic Crystal Dragon',
    category: 'Fantasy',
    rating: '4.2K',
    ratingNum: 4.2,
    isTrending: true,
    imageUrl: 'https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?q=80&w=1074&auto=format&fit=crop',
    promptText: 'A majestic ice dragon sitting on top of a frozen crystal mountain, glowing blue flames, magical fantasy concept art, sharp glittering icicles, Octane 3D.',
    aspect: '1:1',
    model: 'Leonardo AI'
  },
  {
    id: '24',
    title: 'Glowing Crystal Library',
    category: 'Fantasy',
    rating: '3.7K',
    ratingNum: 3.7,
    isTrending: false,
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1170&auto=format&fit=crop',
    promptText: 'A secret glowing library hidden deep inside a cave, bookshelves carved out of crystals, floating spellbooks, magical scrolls, ambient luminescence.',
    aspect: '16:9',
    model: 'Midjourney v6'
  },

  // Portrait
  {
    id: '6',
    title: 'Neon Cyber Tattoo Portrait',
    category: 'Portrait',
    rating: '4.5K',
    ratingNum: 4.5,
    isTrending: true,
    imageUrl: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=1074&auto=format&fit=crop',
    promptText: 'Cinematic portrait of a woman with glowing neon tattoos, cyberpunk street wear, rainy neon city background, smooth bokeh, 85mm lens f/1.4.',
    aspect: '4:5',
    model: 'Midjourney v6'
  },
  {
    id: '17',
    title: 'Golden Sunset Silhouette',
    category: 'Portrait',
    rating: '3.9K',
    ratingNum: 3.9,
    isTrending: false,
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1064&auto=format&fit=crop',
    promptText: 'Close-up cinematic portrait of a woman, warm sunset golden hour lighting, soft shadows, sharp skin detail, editorial high fashion photography style.',
    aspect: '4:5',
    model: 'DALL·E 3'
  },
  {
    id: '29',
    title: 'Tribal Warrior Portrait',
    category: 'Portrait',
    rating: '4.1K',
    ratingNum: 4.1,
    isTrending: false,
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1074&auto=format&fit=crop',
    promptText: 'Cinematic portrait of a warrior chief in ceremonial wear, dramatic campfire lighting, high detail skin texture, dark background, Rembrandt lighting.',
    aspect: '1:1',
    model: 'Midjourney v6'
  },

  // Steampunk
  {
    id: '15',
    title: 'Steampunk Grand Express',
    category: 'Steampunk',
    rating: '3.9K',
    ratingNum: 3.9,
    isTrending: true,
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1047&auto=format&fit=crop',
    promptText: 'Steampunk locomotive train travelling through a grand station, massive copper pipes, steam fog, intricate brass gauges, Victorian aesthetic.',
    aspect: '16:9',
    model: 'Midjourney v6'
  },
  {
    id: '16',
    title: 'Exposed Gear Watchmaker',
    category: 'Steampunk',
    rating: '3.6K',
    ratingNum: 3.6,
    isTrending: false,
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1170&auto=format&fit=crop',
    promptText: 'A vintage steampunk pocket watch with exposed inner glowing brass gears, copper cogs, dark moody background, macro lens photography, high resolution.',
    aspect: '1:1',
    model: 'Leonardo AI'
  },
  {
    id: '28',
    title: 'Sunset Airship Fleet',
    category: 'Steampunk',
    rating: '4.3K',
    ratingNum: 4.3,
    isTrending: true,
    imageUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1074&auto=format&fit=crop',
    promptText: 'Steampunk airship fleet floating through golden clouds during sunset, brass propellers spinning, majestic sky exploration, epic landscape vista.',
    aspect: '16:9',
    model: 'Midjourney v6'
  },

  // Minimalist
  {
    id: '13',
    title: 'Pastel Geometry Abstract',
    category: 'Minimalist',
    rating: '3.1K',
    ratingNum: 3.1,
    isTrending: false,
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1064&auto=format&fit=crop',
    promptText: 'Minimalistic abstract background with pastel geometric shapes, clean circles and arches, modern Scandinavian simple aesthetic design, soft lighting.',
    aspect: '1:1',
    model: 'Canva / Ideogram'
  },
  {
    id: '14',
    title: 'Botanical Palm Silhouette',
    category: 'Minimalist',
    rating: '3.0K',
    ratingNum: 3.0,
    isTrending: false,
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1045&auto=format&fit=crop',
    promptText: 'Single green botanical palm leaf on a clean warm beige background, minimal flat art style, elegant composition, crisp shadow cast.',
    aspect: '4:5',
    model: 'Ideogram'
  }
];

// App State
let activeCategory = 'All';
let searchQuery = '';
let currentSort = 'trending';
let activeModalPrompt = null;

// Studio selections state
const studioState = {
  subject: 'Cyberpunk warrior in neon rain',
  style: 'Cinematic photorealistic, 8k resolution, award winning photography',
  lighting: 'volumetric neon lighting, cinematic glow, wet road reflections',
  aspect: '--ar 16:9 --v 6.0 --q 2'
};

// DOM Elements
const promptGrid = document.getElementById('prompt-grid');
const promptCount = document.getElementById('prompt-count');
const emptyState = document.getElementById('empty-state');
const gallerySearchInput = document.getElementById('gallery-search');
const clearSearchBtn = document.getElementById('clear-search-btn');
const heroSearchInput = document.getElementById('hero-search-input');
const heroSearchBtn = document.getElementById('hero-search-btn');
const sortSelect = document.getElementById('sort-select');
const categoryTabs = document.getElementById('category-tabs');
const resetFilterBtn = document.getElementById('reset-filter-btn');

// Toast Element
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
let toastTimer = null;

/**
 * Display toast notification
 */
function showToast(msg, duration = 3000) {
  if (toastTimer) clearTimeout(toastTimer);
  toastMessage.textContent = msg;
  toast.classList.add('show');
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

/**
 * Copy text to clipboard with fallback
 */
async function copyToClipboard(text, successMsg = 'Prompt copied to clipboard!') {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    showToast(successMsg);
  } catch (err) {
    showToast('Copied to clipboard!');
  }
}

/**
 * Render Prompt Cards in the Gallery
 */
function renderPrompts() {
  let filtered = PROMPTS_DATA.filter(item => {
    const matchCategory = activeCategory === 'All' || item.category.toLowerCase() === activeCategory.toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    const matchSearch = !query || 
      item.title.toLowerCase().includes(query) || 
      item.promptText.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);
    return matchCategory && matchSearch;
  });

  // Sorting
  if (currentSort === 'trending') {
    filtered.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
  } else if (currentSort === 'rating') {
    filtered.sort((a, b) => b.ratingNum - a.ratingNum);
  } else if (currentSort === 'newest') {
    filtered.reverse();
  }

  // Update prompt counter
  promptCount.textContent = `Showing ${filtered.length} prompt${filtered.length === 1 ? '' : 's'}`;

  // Check empty state
  if (filtered.length === 0) {
    promptGrid.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  // Build HTML
  promptGrid.innerHTML = filtered.map(item => `
    <div class="prompt-card" data-id="${item.id}">
      <div class="prompt-card-img-wrap" onclick="openPromptModal('${item.id}')">
        <img src="${item.imageUrl}" alt="${item.title}" loading="lazy" />
        <span class="prompt-card-category">${item.category}</span>
        <div class="prompt-card-rating">
          <i class="fa-solid fa-star"></i> <span>${item.rating}</span>
        </div>
      </div>
      <div class="prompt-card-body">
        <h4 class="prompt-card-title" onclick="openPromptModal('${item.id}')">${item.title}</h4>
        <p class="prompt-card-text">"${item.promptText}"</p>
        <div class="prompt-card-footer">
          <button class="btn-card-copy" onclick="handleCardCopy(event, '${item.id}')">
            <i class="fa-regular fa-copy"></i> Copy Prompt
          </button>
          <button class="btn-card-view" onclick="openPromptModal('${item.id}')" title="View details and launch AI">
            <i class="fa-solid fa-expand"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Handle Card Copy Click
 */
function handleCardCopy(e, id) {
  e.stopPropagation();
  const item = PROMPTS_DATA.find(p => p.id === id);
  if (!item) return;

  const btn = e.currentTarget;
  const originalHTML = btn.innerHTML;

  copyToClipboard(item.promptText, `✨ Copied: "${item.title}"`);

  btn.classList.add('copied');
  btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';

  setTimeout(() => {
    btn.classList.remove('copied');
    btn.innerHTML = originalHTML;
  }, 2000);
}

/**
 * Filter by Category
 */
function filterByCategory(cat) {
  activeCategory = cat;

  // Update tabs active state
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === cat);
  });

  renderPrompts();
}

/**
 * Open Prompt Detail Modal
 */
function openPromptModal(id) {
  const item = PROMPTS_DATA.find(p => p.id === id);
  if (!item) return;

  activeModalPrompt = item;

  const modal = document.getElementById('prompt-modal');
  document.getElementById('modal-img').src = item.imageUrl;
  document.getElementById('modal-title').textContent = item.title;
  document.getElementById('modal-category').textContent = item.category;
  document.getElementById('modal-rating').innerHTML = `<i class="fa-solid fa-star"></i> ${item.rating}`;
  document.getElementById('modal-prompt-text').textContent = `"${item.promptText}"`;
  document.getElementById('modal-aspect').textContent = item.aspect || '16:9';
  document.getElementById('modal-model').textContent = item.model || 'Midjourney / DALL·E 3';

  modal.style.display = 'flex';
  setTimeout(() => {
    modal.classList.add('active');
  }, 10);
  document.body.style.overflow = 'hidden';
}

/**
 * Close Modal
 */
function closeModal() {
  const modal = document.getElementById('prompt-modal');
  modal.classList.remove('active');
  setTimeout(() => {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }, 250);
}

/**
 * Update Prompt Studio Output
 */
function updateStudioPrompt() {
  const fullPrompt = `${studioState.subject}, ${studioState.style}, ${studioState.lighting}, ${studioState.aspect}`;
  const textarea = document.getElementById('studio-output-text');
  if (textarea) {
    textarea.value = fullPrompt;
  }
}

/**
 * Randomize Studio Selections
 */
function randomizeStudio() {
  const groups = [
    { containerId: 'studio-subjects', stateKey: 'subject' },
    { containerId: 'studio-styles', stateKey: 'style' },
    { containerId: 'studio-lighting', stateKey: 'lighting' },
    { containerId: 'studio-aspect', stateKey: 'aspect' }
  ];

  groups.forEach(({ containerId, stateKey }) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    const buttons = container.querySelectorAll('.chip-btn');
    const randomBtn = buttons[Math.floor(Math.random() * buttons.length)];

    buttons.forEach(b => b.classList.remove('active'));
    randomBtn.classList.add('active');
    studioState[stateKey] = randomBtn.dataset.val;
  });

  updateStudioPrompt();
  showToast('🎲 Generated a fresh prompt recipe!');
}

/**
 * Setup Event Listeners
 */
function initEvents() {
  // Category tab clicks
  if (categoryTabs) {
    categoryTabs.addEventListener('click', e => {
      const btn = e.target.closest('.category-btn');
      if (btn) {
        filterByCategory(btn.dataset.category);
      }
    });
  }

  // Quick tag clicks in Hero
  document.querySelectorAll('.quick-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      filterByCategory(tag.dataset.tag);
      document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Gallery Search Input
  if (gallerySearchInput) {
    gallerySearchInput.addEventListener('input', e => {
      searchQuery = e.target.value;
      clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
      renderPrompts();
    });
  }

  // Clear search button
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchQuery = '';
      gallerySearchInput.value = '';
      clearSearchBtn.style.display = 'none';
      renderPrompts();
    });
  }

  // Hero Search
  if (heroSearchBtn && heroSearchInput) {
    const handleHeroSearch = () => {
      const val = heroSearchInput.value.trim();
      if (val) {
        searchQuery = val;
        if (gallerySearchInput) gallerySearchInput.value = val;
        if (clearSearchBtn) clearSearchBtn.style.display = 'block';
        activeCategory = 'All';
        document.querySelectorAll('.category-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.category === 'All');
        });
        renderPrompts();
        document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
      }
    };

    heroSearchBtn.addEventListener('click', handleHeroSearch);
    heroSearchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleHeroSearch();
    });
  }

  // Sort dropdown
  if (sortSelect) {
    sortSelect.addEventListener('change', e => {
      currentSort = e.target.value;
      renderPrompts();
    });
  }

  // Reset Filters Button
  if (resetFilterBtn) {
    resetFilterBtn.addEventListener('click', () => {
      searchQuery = '';
      if (gallerySearchInput) gallerySearchInput.value = '';
      if (clearSearchBtn) clearSearchBtn.style.display = 'none';
      filterByCategory('All');
    });
  }

  // Hero sample copy button
  const heroCopyBtn = document.getElementById('hero-copy-btn');
  if (heroCopyBtn) {
    heroCopyBtn.addEventListener('click', () => {
      const text = document.getElementById('hero-sample-prompt').textContent.replace(/^"|"$/g, '');
      copyToClipboard(text, '✨ Copied hero prompt!');
    });
  }

  // Hero "Test in AI" button
  const heroTryBtn = document.getElementById('hero-sample-try-btn');
  if (heroTryBtn) {
    heroTryBtn.addEventListener('click', () => {
      openPromptModal('1');
    });
  }

  // Studio Pill Group Selections
  ['studio-subjects', 'studio-styles', 'studio-lighting', 'studio-aspect'].forEach(id => {
    const container = document.getElementById(id);
    if (!container) return;

    container.addEventListener('click', e => {
      const btn = e.target.closest('.chip-btn');
      if (!btn) return;

      container.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (id === 'studio-subjects') studioState.subject = btn.dataset.val;
      if (id === 'studio-styles') studioState.style = btn.dataset.val;
      if (id === 'studio-lighting') studioState.lighting = btn.dataset.val;
      if (id === 'studio-aspect') studioState.aspect = btn.dataset.val;

      updateStudioPrompt();
    });
  });

  // Studio Randomize button
  const studioRandBtn = document.getElementById('studio-randomize-btn');
  if (studioRandBtn) {
    studioRandBtn.addEventListener('click', randomizeStudio);
  }

  // Studio Copy Prompt button
  const studioCopyBtn = document.getElementById('studio-copy-btn');
  if (studioCopyBtn) {
    studioCopyBtn.addEventListener('click', () => {
      const text = document.getElementById('studio-output-text').value;
      copyToClipboard(text, '✨ Studio prompt copied!');
    });
  }

  // Studio "Generate with AI" button
  const studioLaunchBtn = document.getElementById('studio-launch-btn');
  if (studioLaunchBtn) {
    studioLaunchBtn.addEventListener('click', () => {
      const text = document.getElementById('studio-output-text').value;
      copyToClipboard(text, 'Copied! Opening Google Gemini...');
      setTimeout(() => {
        window.open('https://gemini.google.com/', '_blank');
      }, 500);
    });
  }

  // Modal Copy Button
  const modalCopyBtn = document.getElementById('modal-copy-btn');
  if (modalCopyBtn) {
    modalCopyBtn.addEventListener('click', () => {
      if (activeModalPrompt) {
        copyToClipboard(activeModalPrompt.promptText, '✨ Prompt copied to clipboard!');
      }
    });
  }

  // Modal Close Events
  const modal = document.getElementById('prompt-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // Mobile Navigation Toggle
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
    });

    // Close menu when clicking nav links on mobile
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('mobile-open');
      });
    });
  }

  // FAQ Accordion
  document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const faqItem = button.parentElement;
      const isActive = faqItem.classList.contains('active');

      // Close all other items
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
      });

      if (!isActive) {
        faqItem.classList.add('active');
      }
    });
  });
}

// Initial Run
document.addEventListener('DOMContentLoaded', () => {
  renderPrompts();
  updateStudioPrompt();
  initEvents();
});
