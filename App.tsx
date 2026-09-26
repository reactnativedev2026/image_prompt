import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { initI18n } from './src/i18n';
import { AppProvider, useAppContext } from './src/store/AppContext';
import { CustomDrawer } from './src/components/CustomDrawer';
import AppUpdateModal from './src/components/AppUpdateModal';
import AppRatingModal from './src/components/AppRatingModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from './src/theme/colors';

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

const App = () => {
  useEffect(() => {
    initI18n();
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
