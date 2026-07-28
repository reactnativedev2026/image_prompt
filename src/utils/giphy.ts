export interface GiphyGifItem {
  id: string;
  title: string;
  url: string;
}

export const mapGiphyGifResults = (items: any[] = []): GiphyGifItem[] => {
  return items
    .filter(Boolean)
    .map((item: any) => {
      const original = item?.images?.original;
      const fallback = item?.images?.fixed_width || item?.images?.downsized_large;
      const url = original?.url || fallback?.url || '';

      return {
        id: item?.id || `${item?.title || 'gif'}-${Math.random()}`,
        title: item?.title || 'GIF',
        url,
      };
    })
    .filter((item) => item.url);
};
