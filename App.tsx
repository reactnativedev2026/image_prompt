import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, DeviceEventEmitter } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { initI18n } from './src/i18n';
import { AppProvider, useAppContext } from './src/store/AppContext';
import { CustomDrawer } from './src/components/CustomDrawer';
import AppUpdateModal from './src/components/AppUpdateModal';
import AppRatingModal from './src/components/AppRatingModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from './src/theme/colors';
import { AppState } from 'react-native';
import { AppOpenAd, TestIds, AdEventType } from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ ? TestIds.APP_OPEN : 'ca-app-pub-6300754811006363/3831258708'; // Replace with your production App Open Ad ID

const appOpenAd = AppOpenAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
});

const APP_OPEN_COUNT_KEY = 'app_open_count';
const HAS_RATED_KEY = 'app_has_rated';

const AppContent = () => {
  const { ratingModalOpen, setRatingModalOpen } = useAppContext();

  useEffect(() => {
    checkAppOpenCount();
  }, []);

  const checkAppOpenCount = async () => {
    try {
      // Check if user already rated — don't show again
      const hasRated = await AsyncStorage.getItem(HAS_RATED_KEY);
      if (hasRated === 'true') return;

      // Increment open count
      const countStr = await AsyncStorage.getItem(APP_OPEN_COUNT_KEY);
      const count = countStr ? parseInt(countStr, 10) + 1 : 1;
      await AsyncStorage.setItem(APP_OPEN_COUNT_KEY, count.toString());

      console.log('App open count:', count);

      // Show rating modal early (2nd open) and again on 5th open if not rated yet
      if (count === 2 || count === 5) {
        setTimeout(() => {
          setRatingModalOpen(true);
        }, 1500); // 1.5s delay so app fully loads first
      }
    } catch (error) {
      console.log('Error checking app open count:', error);
    }
  };

  return (
    <>
      <AppNavigator />
      <CustomDrawer />
      <AppUpdateModal />
      <AppRatingModal isVisible={ratingModalOpen} onClose={() => setRatingModalOpen(false)} />
    </>
  );
};

import { AdState } from './src/utils/adState';

const App = () => {
  useEffect(() => {
    initI18n();

    // Setup App Open Ads
    const unsubscribeLoaded = appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
      const now = Date.now();
      // Show immediately on first load if it passes cooldown
      if (!AdState.isAdShowing && !AdState.isAppPausedForAction && now - AdState.lastAdShowTime > 5000) {
        AdState.isAdShowing = true;
        appOpenAd.show();
        import('react-native').then(({ DeviceEventEmitter }) => {
          DeviceEventEmitter.emit('appOpenAdShown');
        });
      }
    });

    const unsubscribeClosed = appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
      AdState.isAdShowing = false;
      AdState.lastAdShowTime = Date.now();
      appOpenAd.load(); // Load the next ad
    });

    const unsubscribeError = appOpenAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.log('App Open Ad Error', error);
      AdState.isAdShowing = false;
    });

    // Initial load
    appOpenAd.load();

    const appStateSubscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        const now = Date.now();
        if (appOpenAd.loaded && !AdState.isAdShowing && !AdState.isAppPausedForAction && (now - AdState.lastAdShowTime > 5000)) {
           AdState.isAdShowing = true;
           appOpenAd.show();
        } else if (!appOpenAd.loaded) {
           appOpenAd.load();
        }
      }
    });

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
      appStateSubscription.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <AppProvider>
        <AppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
};

export default App;
