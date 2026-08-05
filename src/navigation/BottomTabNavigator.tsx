import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Platform } from 'react-native';

import { GalleryScreen } from '../screens/GalleryScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Gallery',   label: 'Gallery',   icon: 'image-multiple',        iconOff: 'image-multiple-outline' },
  { name: 'Explore',   label: 'Explore',   icon: 'compass',               iconOff: 'compass-outline' },
  { name: 'Favorites', label: 'Saved',     icon: 'heart',                 iconOff: 'heart-outline' },
  { name: 'Settings',  label: 'Settings',  icon: 'cog',                   iconOff: 'cog-outline' },
];

const ACTIVE_COLOR = '#FF69B4';
const INACTIVE_COLOR = '#BBBBBB';

const BottomTabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // ── Tab icon ──────────────────────────────────────────────
        tabBarIcon: ({ focused, size }) => {
          const tab = TABS.find(t => t.name === route.name)!;
          const iconName = focused ? tab.icon : tab.iconOff;
          const color = focused ? ACTIVE_COLOR : INACTIVE_COLOR;
          return (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Icon name={iconName} size={size - 2} color={color} />
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

        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,

        // ── Header — shown so top safe area is respected ──────────
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FAFAFF',
          height: 0,           // zero-height header: just provides top safe area space
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTitle: () => null,  // empty title
        headerShadowVisible: false,

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
            tab.name === 'Gallery'   ? GalleryScreen   :
            tab.name === 'Explore'   ? ExploreScreen   :
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
  iconWrapActive: {
    backgroundColor: '#FF69B418',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: INACTIVE_COLOR,
    marginTop: 2,
    marginBottom: Platform.OS === 'ios' ? 0 : 2,
  },
  tabLabelActive: {
    color: ACTIVE_COLOR,
  },
});

export default BottomTabNavigator;
