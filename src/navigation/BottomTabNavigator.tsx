import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import CardMakerScreen from '../screens/CardMakerScreen';
import FavouritesScreen from '../screens/FavouritesScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Categories') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Create') {
            return (
              <View style={{
                top: -15,
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: colors.primaryDark,
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
              }}>
                <Icon name="add" size={32} color="#fff" />
              </View>
            );
          } else if (route.name === 'Favourites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.textLight,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 10,
          paddingTop: 10,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: t('common.search') }} 
      />
      <Tab.Screen 
        name="Categories" 
        component={CategoriesScreen} 
        options={{ title: 'Categories' }} 
      />
      <Tab.Screen 
        name="Create" 
        component={CardMakerScreen} 
        options={{ title: 'Create' }} 
      />
      <Tab.Screen 
        name="Favourites" 
        component={FavouritesScreen} 
        options={{ title: t('common.favourite') }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: t('settings.title') }} 
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
