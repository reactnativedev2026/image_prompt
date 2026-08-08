import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BottomTabNavigator from './BottomTabNavigator';
import { PromptDetailScreen } from '../screens/PromptDetailScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { globalNavigationRef } from '../components/CustomDrawer';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  PromptDetail: { item: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer ref={globalNavigationRef}>
      <Stack.Navigator
        initialRouteName="Onboarding"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Main" component={BottomTabNavigator} />
        <Stack.Screen name="PromptDetail" component={PromptDetailScreen} options={{ headerShown: false, title: 'Details', headerBackTitle: 'Back', headerTintColor: '#333333' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
