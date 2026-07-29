import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getStoredLanguage } from '../store/storage';

import SplashScreen from '../screens/SplashScreen';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';
import WishDetailsScreen from '../screens/WishDetailsScreen';
import GifsScreen from '../screens/GifsScreen';
import ImagesScreen from '../screens/ImagesScreen';
import WishListScreen from '../screens/WishListScreen';
import CardMakerScreen from '../screens/CardMakerScreen';
import BottomTabNavigator from './BottomTabNavigator';

export type RootStackParamList = {
  Splash: undefined;
  LanguageSelection: undefined;
  Main: undefined;
  WishDetails: { wishId?: string, wishText?: string, category?: string };
  WishList: { category?: string, searchQuery?: string };
  Gifs: undefined;
  Images: undefined;
  CardMaker: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      // Temporarily skip language selection, show splash first
      setInitialRoute('Splash');
    };

    checkFirstLaunch();
  }, []);

  if (initialRoute === null) return null; // Or a splash screen

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
        <Stack.Screen name="Main" component={BottomTabNavigator} />
        <Stack.Screen name="WishDetails" component={WishDetailsScreen} />
        <Stack.Screen name="WishList" component={WishListScreen} />
        <Stack.Screen name="Gifs" component={GifsScreen} />
        <Stack.Screen name="Images" component={ImagesScreen} />
        <Stack.Screen name="CardMaker" component={CardMakerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
