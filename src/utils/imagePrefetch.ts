import FastImage from 'react-native-fast-image';
import { PromptItem } from '../data/mockPrompts';

/**
 * Prefetches an array of image URLs into the device's native image cache.
 */
export const prefetchImages = (urls: (string | undefined | null)[]): void => {
  if (!urls || !Array.isArray(urls)) return;
  const validUrls = urls.filter(
    (url): url is string => typeof url === 'string' && url.trim().startsWith('http')
  );

  const preloads = validUrls.map(url => ({ uri: url }));
  FastImage.preload(preloads);
};

/**
 * Prefetches the first N images from a list of PromptItem objects.
 */
export const prefetchPromptImages = (prompts: PromptItem[], count: number = 12): void => {
  if (!prompts || !Array.isArray(prompts)) return;
  const slice = prompts.slice(0, count);
  const urls = slice.map(item => item.imageUrl);
  prefetchImages(urls);
};
