export interface GiphyGifItem {
  id: string;
  title: string;
  url: string;       // display URL (small/preview)
  shareUrl: string;   // share URL (medium quality, faster download)
}

export const mapGiphyGifResults = (items: any[] = []): GiphyGifItem[] => {
  return items
    .filter(Boolean)
    .map((item: any) => {
      const original = item?.images?.original;
      const fixedWidth = item?.images?.fixed_width;
      const downsized = item?.images?.downsized || item?.images?.downsized_medium || item?.images?.downsized_large;

      // For display: use smaller fixed_width (fast loading in list)
      const url = fixedWidth?.url || original?.url || '';
      // For sharing: use downsized (good quality but much smaller than original)
      const shareUrl = downsized?.url || fixedWidth?.url || original?.url || '';

      return {
        id: item?.id || `${item?.title || 'gif'}-${Math.random()}`,
        title: item?.title || 'GIF',
        url,
        shareUrl,
      };
    })
    .filter((item) => item.url);
};
