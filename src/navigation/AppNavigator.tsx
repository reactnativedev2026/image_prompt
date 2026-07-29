import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getStoredLanguage } from '../store/storage';

import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';
import WishDetailsScreen from '../screens/WishDetailsScreen';
import GifsScreen from '../screens/GifsScreen';
import ImagesScreen from '../screens/ImagesScreen';
import WishListScreen from '../screens/WishListScreen';
import CardMakerScreen from '../screens/CardMakerScreen';
import BottomTabNavigator from './BottomTabNavigator';

export type RootStackParamList = {
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
      const storedLang = await getStoredLanguage();
      if (storedLang) {
        setInitialRoute('Main');
      } else {
        setInitialRoute('LanguageSelection');
      }
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
