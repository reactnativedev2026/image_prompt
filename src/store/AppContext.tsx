import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PromptItem } from '../data/mockPrompts';

interface AppContextProps {
  favorites: PromptItem[];
  toggleFavorite: (item: PromptItem) => void;
  isFavorite: (id: string) => boolean;
  clearFavorites: () => void;
  defaultTool: string;
  setDefaultTool: (tool: string) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<PromptItem[]>([]);
  const [defaultTool, setDefaultToolState] = useState<string>('Gemini');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const favData = await AsyncStorage.getItem('FAV_PROMPTS');
      if (favData) {
        setFavorites(JSON.parse(favData));
      }
      const toolData = await AsyncStorage.getItem('DEFAULT_TOOL');
      if (toolData) {
        setDefaultToolState(toolData);
      }
    } catch (e) {
      console.error('Error loading data', e);
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
      setDefaultTool
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
