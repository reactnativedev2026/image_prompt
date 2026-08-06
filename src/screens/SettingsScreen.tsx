import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useAppContext } from '../store/AppContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TOOLS = [
  'Gemini', 'Canva', 'Bing Image Creator',
  'Leonardo AI', 'Ideogram', 'Playground',
  'Adobe Firefly', 'ChatGPT',
];

const TOOL_ICONS: Record<string, { icon: string; color: string }> = {
  'Gemini': { icon: 'google', color: '#4285F4' },
  'Canva': { icon: 'palette', color: '#7D2AE8' },
  'Bing Image Creator': { icon: 'microsoft-bing', color: '#008373' },
  'Leonardo AI': { icon: 'brush', color: '#FF7043' },
  'Ideogram': { icon: 'format-text', color: '#263238' },
  'Playground': { icon: 'controller-classic', color: '#EC407A' },
  'Adobe Firefly': { icon: 'fire', color: '#E53935' },
  'ChatGPT': { icon: 'robot-outline', color: '#10A37F' },
};

export const SettingsScreen = () => {
  const { defaultTool, setDefaultTool, clearFavorites } = useAppContext();
  const insets = useSafeAreaInsets()
  const handleClearFavorites = () => {
    Alert.alert(
      'Clear Favorites',
      'This will remove all your saved prompts. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: () => clearFavorites() },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ Settings</Text>
        <Text style={styles.headerSub}>Customise your experience</Text>
      </View>

      {/* Default Tool Section */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>DEFAULT REDIRECT TOOL</Text>
        <Text style={styles.sectionHint}>
          Opens automatically when you tap "Copy & Open"
        </Text>
        {TOOLS.map(tool => {
          const meta = TOOL_ICONS[tool] || { icon: 'open-in-new', color: '#888' };
          const active = defaultTool === tool;
          return (
            <TouchableOpacity
              key={tool}
              style={[styles.toolRow, active && styles.toolRowActive]}
              activeOpacity={0.8}
              onPress={() => setDefaultTool(tool)}
            >
              <View style={[styles.toolIcon, { backgroundColor: meta.color + '15' }]}>
                <Icon name={meta.icon} size={20} color={meta.color} />
              </View>
              <Text style={[styles.toolName, active && { color: '#1A1A2E', fontWeight: '700' }]}>
                {tool}
              </Text>
              {active ? (
                <View style={styles.checkCircle}>
                  <Icon name="check" size={14} color="#FFF" />
                </View>
              ) : (
                <Icon name="circle-outline" size={22} color="#DDD" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>DATA MANAGEMENT</Text>
        <TouchableOpacity style={styles.dangerRow} onPress={handleClearFavorites}>
          <View style={styles.dangerIcon}>
            <Icon name="trash-can-outline" size={20} color="#EF4444" />
          </View>
          <Text style={styles.dangerText}>Clear All Favorites</Text>
          <Icon name="chevron-right" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={[styles.section, { marginBottom: 40 }]}>
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={styles.aboutCard}>
          <Icon name="image-multiple-outline" size={32} color="#FF69B4" />
          <Text style={styles.aboutAppName}>Image Prompt</Text>
          <Text style={styles.aboutVersion}>Version 1.0.0</Text>
          <Text style={styles.aboutTagline}>Curated prompts for creative minds.</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFF' },

  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A2E',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },

  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#BBBBBB',
    letterSpacing: 1.2,
    marginBottom: 6,
    marginTop: 6,
  },
  sectionHint: {
    fontSize: 13,
    color: '#999',
    marginBottom: 14,
    lineHeight: 18,
  },

  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  toolRowActive: {
    borderColor: '#FF69B4',
    backgroundColor: '#FFF5F9',
  },
  toolIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toolName: {
    flex: 1,
    fontSize: 15,
    color: '#555',
    fontWeight: '500',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF69B4',
    justifyContent: 'center',
    alignItems: 'center',
  },

  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  dangerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFE0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dangerText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },

  aboutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#FF69B4',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F5F0FF',
  },
  aboutAppName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A2E',
    marginTop: 10,
  },
  aboutVersion: {
    fontSize: 13,
    color: '#AAAAAA',
    marginTop: 4,
  },
  aboutTagline: {
    fontSize: 13,
    color: '#888',
    marginTop: 6,
    fontStyle: 'italic',
  },
});
