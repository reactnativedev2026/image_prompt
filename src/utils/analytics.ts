import {
  getAnalytics,
  logScreenView as fbLogScreenView,
  logEvent as fbLogEvent,
  logSearch as fbLogSearch,
} from '@react-native-firebase/analytics';

/**
 * Utility helper for Firebase Analytics tracking in Image Prompt App
 */

const getAnalyticsInstance = () => {
  try {
    return getAnalytics();
  } catch (error) {
    console.warn('Analytics initialization error:', error);
    return null;
  }
};

/**
 * Log Screen View
 */
export const logScreenView = async (screenName: string, screenClass: string = screenName) => {
  try {
    const analytics = getAnalyticsInstance();
    if (analytics) {
      await fbLogScreenView(analytics, {
        screen_name: screenName,
        screen_class: screenClass,
      });
    }
  } catch (error) {
    console.warn('Analytics logScreenView error:', error);
  }
};

/**
 * Log Prompt / Text Copy event
 */
export const logCopyPrompt = async (promptId?: string | number, promptTitle?: string) => {
  try {
    const analytics = getAnalyticsInstance();
    if (analytics) {
      await fbLogEvent(analytics, 'copy_prompt', {
        prompt_id: String(promptId || ''),
        prompt_title: promptTitle ? promptTitle.substring(0, 100) : '',
      });
    }
  } catch (error) {
    console.warn('Analytics logCopyPrompt error:', error);
  }
};

/**
 * Log Image Save / Download event
 */
export const logSaveImage = async (imageId?: string | number, imageTitle?: string) => {
  try {
    const analytics = getAnalyticsInstance();
    if (analytics) {
      await fbLogEvent(analytics, 'save_image', {
        image_id: String(imageId || ''),
        image_title: imageTitle ? imageTitle.substring(0, 100) : '',
      });
    }
  } catch (error) {
    console.warn('Analytics logSaveImage error:', error);
  }
};

/**
 * Log Prompt / Image Share event
 */
export const logSharePrompt = async (promptId?: string | number, promptTitle?: string) => {
  try {
    const analytics = getAnalyticsInstance();
    if (analytics) {
      await fbLogEvent(analytics, 'share_prompt', {
        prompt_id: String(promptId || ''),
        prompt_title: promptTitle ? promptTitle.substring(0, 100) : '',
      });
    }
  } catch (error) {
    console.warn('Analytics logSharePrompt error:', error);
  }
};

/**
 * Log Favorite Toggle event
 */
export const logToggleFavorite = async (promptId: string | number, promptTitle: string, isFavorite: boolean) => {
  try {
    const analytics = getAnalyticsInstance();
    if (analytics) {
      await fbLogEvent(analytics, 'toggle_favorite', {
        prompt_id: String(promptId),
        prompt_title: promptTitle ? promptTitle.substring(0, 100) : '',
        action: isFavorite ? 'add' : 'remove',
      });
    }
  } catch (error) {
    console.warn('Analytics logToggleFavorite error:', error);
  }
};

/**
 * Log Search Event
 */
export const logSearchPrompt = async (searchTerm: string) => {
  try {
    const analytics = getAnalyticsInstance();
    if (analytics && searchTerm && searchTerm.trim().length > 0) {
      await fbLogSearch(analytics, {
        search_term: searchTerm.trim(),
      });
    }
  } catch (error) {
    console.warn('Analytics logSearchPrompt error:', error);
  }
};

/**
 * Log Category Select Event
 */
export const logSelectCategory = async (categoryName: string) => {
  try {
    const analytics = getAnalyticsInstance();
    if (analytics) {
      await fbLogEvent(analytics, 'select_category', {
        category_name: categoryName,
      });
    }
  } catch (error) {
    console.warn('Analytics logSelectCategory error:', error);
  }
};
