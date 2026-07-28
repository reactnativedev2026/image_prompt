import AsyncStorage from '@react-native-async-storage/async-storage';

export const LANGUAGE_KEY = 'SELECTED_LANGUAGE';

export const setStoredLanguage = async (lang: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  } catch (e) {
    console.error('Error saving language', e);
  }
};

export const getStoredLanguage = async () => {
  try {
    return await AsyncStorage.getItem(LANGUAGE_KEY);
  } catch (e) {
    console.error('Error reading language', e);
    return null;
  }
};

const FAV_WISHES_KEY = 'FAV_WISHES';
const FAV_GIFS_KEY = 'FAV_GIFS';
const FAV_IMAGES_KEY = 'FAV_IMAGES';

const getFavs = async (key: string) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveFavs = async (key: string, data: any[]) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving favs', e);
  }
};

export const getFavouriteWishes = () => getFavs(FAV_WISHES_KEY);
export const getFavouriteGifs = () => getFavs(FAV_GIFS_KEY);
export const getFavouriteImages = () => getFavs(FAV_IMAGES_KEY);

export const toggleFavouriteWish = async (wish: any) => {
  const current = await getFavouriteWishes();
  const exists = current.find((item: any) => item.id === wish.id);
  const updated = exists ? current.filter((item: any) => item.id !== wish.id) : [...current, wish];
  await saveFavs(FAV_WISHES_KEY, updated);
  return !exists;
};

export const toggleFavouriteGif = async (gif: any) => {
  const current = await getFavouriteGifs();
  const exists = current.find((item: any) => item.id === gif.id);
  const updated = exists ? current.filter((item: any) => item.id !== gif.id) : [...current, gif];
  await saveFavs(FAV_GIFS_KEY, updated);
  return !exists;
};

export const toggleFavouriteImage = async (image: any) => {
  const current = await getFavouriteImages();
  const exists = current.find((item: any) => item.id === image.id);
  const updated = exists ? current.filter((item: any) => item.id !== image.id) : [...current, image];
  await saveFavs(FAV_IMAGES_KEY, updated);
  return !exists;
};

export const isFavouriteWish = async (id: string) => {
  const current = await getFavouriteWishes();
  return !!current.find((item: any) => item.id === id);
};

export const isFavouriteGif = async (id: string) => {
  const current = await getFavouriteGifs();
  return !!current.find((item: any) => item.id === id);
};

export const isFavouriteImage = async (id: string) => {
  const current = await getFavouriteImages();
  return !!current.find((item: any) => item.id === id);
};
