import { Image } from 'react-native';
import { PromptItem } from '../data/mockPrompts';

/**
 * Prefetches an array of image URLs into the device's native image cache.
 */
export const prefetchImages = (urls: (string | undefined | null)[]): void => {
  if (!urls || !Array.isArray(urls)) return;
  const validUrls = urls.filter(
    (url): url is string => typeof url === 'string' && url.trim().startsWith('http')
  );

  validUrls.forEach(url => {
    Image.prefetch(url).catch(() => {
      // Silently ignore prefetch failures (e.g. offline)
    });
  });
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
