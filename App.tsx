import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { initI18n } from './src/i18n';
import { colors } from './src/theme/colors';

const App = () => {
  useEffect(() => {
    initI18n();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <AppNavigator />
    </SafeAreaProvider>
  );
};

export default App;
