import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme/colors';

import { GalleryScreen } from '../screens/GalleryScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Gallery', label: 'Home', icon: 'home', iconOff: 'home-outline' },
  { name: 'Explore', label: 'Explore', icon: 'magnify', iconOff: 'magnify' },
  { name: 'Create', label: '', icon: 'plus', iconOff: 'plus' },
  { name: 'Favorites', label: 'Favorites', icon: 'heart', iconOff: 'heart-outline' },
  { name: 'Settings', label: 'Profile', icon: 'account', iconOff: 'account-outline' },
];

const CreatePlaceholderScreen = () => {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <Icon name="creation" size={64} color={colors.primary} style={{ marginBottom: 16 }} />
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold' }}>Create AI Prompt</Text>
      <Text style={{ color: colors.textLight, fontSize: 14, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }}>
        Create custom prompt and generate gorgeous AI images instantly.
      </Text>
    </View>
  );
};

const CustomTabBarButton = ({ children, onPress }: any) => (
  <TouchableOpacity
    style={styles.customButtonContainer}
    activeOpacity={0.9}
    onPress={onPress}
  >
    <LinearGradient
      colors={['#A15DFB', '#8A2BE2']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.customButtonInner}
    >
      <Icon name="plus" size={26} color="#FFFFFF" />
    </LinearGradient>
  </TouchableOpacity>
);

const BottomTabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // ── Tab icon ──────────────────────────────────────────────
        tabBarIcon: ({ focused, size }) => {
          const tab = TABS.find(t => t.name === route.name)!;
          const iconName = focused ? tab.icon : tab.iconOff;

          if (route.name === 'Create') return null;

          return (
            <View style={styles.iconWrap}>
              <Icon name={iconName} size={24} color={focused ? colors.primary : '#64748B'} />
            </View>
          );
        },

        // ── Tab label ─────────────────────────────────────────────
        tabBarLabel: ({ focused }) => {
          const tab = TABS.find(t => t.name === route.name)!;
          if (route.name === 'Create') return null;
          return (
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          );
        },

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#64748B',
        headerShown: false,

        // ── Bottom tab bar styling ────────────────────────────────
        tabBarStyle: {
          backgroundColor: '#0C0C14',
          borderTopWidth: 1,
          borderTopColor: '#1F1F35',
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom + 6,
          paddingTop: 8,
          position: 'relative',
        },
      })}
    >
      <Tab.Screen name="Gallery" component={GalleryScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen
        name="Create"
        component={CreatePlaceholderScreen}
        options={{
          tabBarButton: (props) => (
            <CustomTabBarButton
              {...props}
              onPress={() => {
                Alert.alert(
                  "Create Prompt",
                  "Create custom prompts functionality is coming soon!",
                  [{ text: "Awesome" }]
                );
              }}
            />
          )
        }}
      />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconWrap: {
    width: 36,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
    marginBottom: Platform.OS === 'ios' ? 0 : 2,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  customButtonContainer: {
    top: -12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
  },
  customButtonInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default BottomTabNavigator;
