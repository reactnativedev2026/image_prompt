import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PromptItem } from '../data/mockPrompts';
import { ApiCategory, fetchCategories, fetchPrompts, fetchTrendingPrompts } from '../utils/api';
import { prefetchPromptImages } from '../utils/imagePrefetch';
import { InterstitialAd, TestIds, AdEventType } from 'react-native-google-mobile-ads';

const interstitialAdUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-6300754811006363/7535534141';
const interstitial = InterstitialAd.createForAdRequest(interstitialAdUnitId, {
  requestNonPersonalizedAdsOnly: true,
});
import { AdState } from '../utils/adState';

const CACHE_CATEGORIES_KEY = 'CACHE_CATEGORIES_V1';
const CACHE_HOME_PROMPTS_KEY = 'CACHE_HOME_PROMPTS_V1';
const CACHE_TRENDING_PROMPTS_KEY = 'CACHE_TRENDING_PROMPTS_V1';

interface AppContextProps {
  favorites: PromptItem[];
  toggleFavorite: (item: PromptItem) => void;
  isFavorite: (id: string) => boolean;
  clearFavorites: () => void;
  defaultTool: string;
  setDefaultTool: (tool: string) => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  ratingModalOpen: boolean;
  setRatingModalOpen: (open: boolean) => void;
  preloadedPrompts: PromptItem[];
  setPreloadedPrompts: React.Dispatch<React.SetStateAction<PromptItem[]>>;
  preloadedCategories: ApiCategory[];
  setPreloadedCategories: React.Dispatch<React.SetStateAction<ApiCategory[]>>;
  preloadedTrending: PromptItem[];
  setPreloadedTrending: React.Dispatch<React.SetStateAction<PromptItem[]>>;
  isPreloaded: boolean;
  preloadData: () => Promise<void>;
  showInterstitialAd: () => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<PromptItem[]>([]);
  const [defaultTool, setDefaultToolState] = useState<string>('Gemini');
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [ratingModalOpen, setRatingModalOpen] = useState<boolean>(false);
  const [preloadedPrompts, setPreloadedPrompts] = useState<PromptItem[]>([]);
  const [preloadedCategories, setPreloadedCategories] = useState<ApiCategory[]>([]);
  const [preloadedTrending, setPreloadedTrending] = useState<PromptItem[]>([]);
  const [isPreloaded, setIsPreloaded] = useState<boolean>(false);
  const actionCount = React.useRef(0);

  useEffect(() => {
    loadData();

    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      console.log('Interstitial Ad loaded');
    });

    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      AdState.isAdShowing = false;
      AdState.lastAdShowTime = Date.now();
      interstitial.load(); // Reload when closed
    });

    const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
      console.log('Interstitial Ad Error:', error);
      AdState.isAdShowing = false;
    });

    interstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, []);

  const showInterstitialAd = () => {
    actionCount.current += 1;
    const now = Date.now();
    // AdMob Policy compliance: only show at natural transitions, not on initial actions, with 45s cooldown
    if (actionCount.current > 2 && actionCount.current % 4 === 0) {
      if (interstitial.loaded && !AdState.isAdShowing && (now - AdState.lastAdShowTime > 5000)) {
        AdState.isAdShowing = true;
        interstitial.show();
      } else if (!interstitial.loaded) {
        interstitial.load();
      }
    }
  };

  const preloadData = async () => {
    try {
      const [cats, pts, trendingPts] = await Promise.all([
        fetchCategories(),
        fetchPrompts(undefined, undefined, undefined, 1, 20),
        fetchTrendingPrompts(undefined, 1, 20),
      ]);

      const validCats = cats && cats.length > 0 ? cats : [];
      if (validCats.length > 0) {
        setPreloadedCategories(validCats);
        AsyncStorage.setItem(CACHE_CATEGORIES_KEY, JSON.stringify(validCats)).catch(() => { });
      }

      if (pts && pts.length > 0) {
        const mapped: PromptItem[] = pts.map(p => {
          const catObj = validCats.find(c => c.id === p.category_id);
          return {
            id: String(p.id),
            imageUrl: p.image_url,
            promptText: p.prompt_text,
            category: catObj ? catObj.name : 'Other',
            viewCount: p.view_count || 0,
            copyCount: p.copy_count || 0,
            favoriteCount: p.favorite_count || 0,
            score: p.score || 0,
            isTrending: Boolean(p.is_trending),
          };
        });
        setPreloadedPrompts(mapped);
        AsyncStorage.setItem(CACHE_HOME_PROMPTS_KEY, JSON.stringify(mapped)).catch(() => { });
        prefetchPromptImages(mapped, 12);
      }

      if (trendingPts && trendingPts.length > 0) {
        const mappedTrending: PromptItem[] = trendingPts.map(p => {
          const catObj = validCats.find(c => c.id === p.category_id);
          return {
            id: String(p.id),
            imageUrl: p.image_url,
            promptText: p.prompt_text,
            category: catObj ? catObj.name : 'Trending',
            viewCount: p.view_count || 0,
            copyCount: p.copy_count || 0,
            favoriteCount: p.favorite_count || 0,
            score: p.score || 0,
            isTrending: true,
          };
        });
        setPreloadedTrending(mappedTrending);
        AsyncStorage.setItem(CACHE_TRENDING_PROMPTS_KEY, JSON.stringify(mappedTrending)).catch(() => { });
        prefetchPromptImages(mappedTrending, 12);
      }

      setIsPreloaded(true);
    } catch (e) {
      console.error('Error preloading data:', e);
      setIsPreloaded(true);
    }
  };

  const loadData = async () => {
    try {
      // 1. User preferences
      const favData = await AsyncStorage.getItem('FAV_PROMPTS');
      if (favData) {
        setFavorites(JSON.parse(favData));
      }
      const toolData = await AsyncStorage.getItem('DEFAULT_TOOL');
      if (toolData) {
        setDefaultToolState(toolData);
      }

      // 2. Hydrate from persistent disk cache (offline-first & instant startup)
      const [cachedCats, cachedHome, cachedTrending] = await Promise.all([
        AsyncStorage.getItem(CACHE_CATEGORIES_KEY),
        AsyncStorage.getItem(CACHE_HOME_PROMPTS_KEY),
        AsyncStorage.getItem(CACHE_TRENDING_PROMPTS_KEY),
      ]);

      if (cachedCats) {
        setPreloadedCategories(JSON.parse(cachedCats));
      }
      if (cachedHome) {
        const parsedHome: PromptItem[] = JSON.parse(cachedHome);
        setPreloadedPrompts(parsedHome);
        prefetchPromptImages(parsedHome, 12);
      }
      if (cachedTrending) {
        const parsedTrending: PromptItem[] = JSON.parse(cachedTrending);
        setPreloadedTrending(parsedTrending);
        prefetchPromptImages(parsedTrending, 12);
      }
    } catch (e) {
      console.error('Error loading data from storage', e);
    }
  };

  const toggleFavorite = async (item: PromptItem) => {
    try {
      let newFavs;
      if (favorites.find(f => f.id === item.id)) {
        newFavs = favorites.filter(f => f.id !== item.id);
      } else {
        newFavs = [...favorites, item];
      }
      setFavorites(newFavs);
      await AsyncStorage.setItem('FAV_PROMPTS', JSON.stringify(newFavs));
    } catch (e) {
      console.error('Error toggling favorite', e);
    }
  };

  const isFavorite = (id: string) => {
    return favorites.some(f => f.id === id);
  };

  const clearFavorites = async () => {
    try {
      setFavorites([]);
      await AsyncStorage.removeItem('FAV_PROMPTS');
    } catch (e) {
      console.error('Error clearing favorites', e);
    }
  };

  const setDefaultTool = async (tool: string) => {
    try {
      setDefaultToolState(tool);
      await AsyncStorage.setItem('DEFAULT_TOOL', tool);
    } catch (e) {
      console.error('Error setting default tool', e);
    }
  };

  return (
    <AppContext.Provider value={{
      favorites,
      toggleFavorite,
      isFavorite,
      clearFavorites,
      defaultTool,
      setDefaultTool,
      drawerOpen,
      setDrawerOpen,
      ratingModalOpen,
      setRatingModalOpen,
      preloadedPrompts,
      setPreloadedPrompts,
      preloadedCategories,
      setPreloadedCategories,
      preloadedTrending,
      setPreloadedTrending,
      isPreloaded,
      preloadData,
      showInterstitialAd,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
