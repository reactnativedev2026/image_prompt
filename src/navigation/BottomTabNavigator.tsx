import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { GalleryScreen } from '../screens/GalleryScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Gallery', label: 'Gallery', icon: 'image-multiple', iconOff: 'image-multiple-outline' },
  { name: 'Explore', label: 'Explore', icon: 'compass', iconOff: 'compass-outline' },
  { name: 'Favorites', label: 'Saved', icon: 'heart', iconOff: 'heart-outline' },
  { name: 'Settings', label: 'Settings', icon: 'cog', iconOff: 'cog-outline' },
];

const BottomTabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // ── Tab icon ──────────────────────────────────────────────
        tabBarIcon: ({ focused, size }) => {
          const tab = TABS.find(t => t.name === route.name)!;
          const iconName = focused ? tab.icon : tab.iconOff;

          if (focused) {
            // Apply gradient wrapper to the active icon
            return (
              <LinearGradient
                colors={['#FF69B4', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconWrapActiveGradient}
              >
                <Icon name={iconName} size={size - 2} color="#FFFFFF" />
              </LinearGradient>
            );
          }

          return (
            <View style={styles.iconWrap}>
              <Icon name={iconName} size={size - 2} color="#BBBBBB" />
            </View>
          );
        },

        // ── Tab label (proper text, not empty View) ───────────────
        tabBarLabel: ({ focused }) => {
          const tab = TABS.find(t => t.name === route.name)!;
          return (
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          );
        },

        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#BBBBBB',

        // ── Header — fully hidden, no phantom height on Android ───
        headerShown: false,

        // ── Bottom tab bar ────────────────────────────────────────
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          height: 62 + insets.bottom,
          paddingBottom: insets.bottom + 6,
          paddingTop: 8,
          shadowColor: '#7C3AED',
          shadowOpacity: 0.1,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -4 },
          elevation: 16,
        },
      })}
    >
      {TABS.map(tab => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={
            tab.name === 'Gallery' ? GalleryScreen :
              tab.name === 'Explore' ? ExploreScreen :
                tab.name === 'Favorites' ? FavoritesScreen :
                  SettingsScreen
          }
        />
      ))}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconWrap: {
    width: 36,
    height: 26,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapActiveGradient: {
    width: 44,
    height: 28,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#BBBBBB',
    marginTop: 2,
    marginBottom: Platform.OS === 'ios' ? 0 : 2,
  },
  tabLabelActive: {
    color: '#7C3AED',
    fontWeight: '700',
  },
});

export default BottomTabNavigator;
