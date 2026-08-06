import React, { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { initI18n } from './src/i18n';
import { AppProvider } from './src/store/AppContext';

const App = () => {
  useEffect(() => {
    initI18n();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFF" />
      {/* <SafeAreaView edges={['top']} style={{ flex: 1 }}> */}
      <AppProvider>
        <AppNavigator />
      </AppProvider>
      {/* </SafeAreaView> */}
    </SafeAreaProvider>
  );
};

export default App;
