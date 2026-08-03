import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAppContext } from '../store/AppContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const availableTools = [
  'Gemini', 'Canva', 'Bing Image Creator', 
  'Leonardo', 'Ideogram', 'Playground', 
  'Adobe Firefly', 'ChatGPT'
];

export const SettingsScreen = () => {
  const { defaultTool, setDefaultTool, clearFavorites } = useAppContext();

  const handleClearFavorites = () => {
    Alert.alert(
      "Clear Favorites",
      "Are you sure you want to remove all your saved prompts?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: "destructive", onPress: () => clearFavorites() }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Default Redirect Tool</Text>
        <Text style={styles.sectionSubtitle}>Choose which tool opens when you tap "Open in..."</Text>
        
        {availableTools.map(tool => (
          <TouchableOpacity 
            key={tool} 
            style={styles.toolRow}
            onPress={() => setDefaultTool(tool)}
          >
            <Text style={styles.toolText}>{tool}</Text>
            {defaultTool === tool && (
              <Icon name="check-circle" size={24} color="#FFBF00" />
            )}
            {defaultTool !== tool && (
              <Icon name="circle-outline" size={24} color="#CCC" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <TouchableOpacity style={styles.dangerButton} onPress={handleClearFavorites}>
          <Icon name="delete-outline" size={20} color="#FF3B30" />
          <Text style={styles.dangerText}>Clear All Favorites</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>Image Prompt v1.0.0</Text>
        <Text style={styles.aboutText}>Created for prompt engineers.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  toolRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  toolText: {
    fontSize: 16,
    color: '#333333',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dangerText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  aboutText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  }
});
