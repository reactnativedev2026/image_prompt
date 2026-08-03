import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BottomTabNavigator from './BottomTabNavigator';
import { PromptDetailScreen } from '../screens/PromptDetailScreen';

export type RootStackParamList = {
  Main: undefined;
  PromptDetail: { item: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Main"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Main" component={BottomTabNavigator} />
        <Stack.Screen name="PromptDetail" component={PromptDetailScreen} options={{ headerShown: true, title: 'Details', headerBackTitle: 'Back', headerTintColor: '#333333' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
