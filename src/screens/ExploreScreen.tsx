import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, Image } from 'react-native';

const aiTools = [
  { id: '1', name: 'Gemini', url: 'https://gemini.google.com/', description: 'Google\'s advanced AI model' },
  { id: '2', name: 'Canva', url: 'https://www.canva.com/ai-image-generator/', description: 'Easy graphic design and AI generation' },
  { id: '3', name: 'Bing Image Creator', url: 'https://www.bing.com/create', description: 'Powered by DALL-E 3' },
  { id: '4', name: 'Leonardo', url: 'https://leonardo.ai/', description: 'Create production-quality assets' },
  { id: '5', name: 'Ideogram', url: 'https://ideogram.ai/', description: 'Excellent at generating text in images' },
  { id: '6', name: 'Playground', url: 'https://playground.com/', description: 'Free-to-use AI image creator' },
  { id: '7', name: 'Adobe Firefly', url: 'https://firefly.adobe.com/', description: 'Commercially safe AI generation' },
  { id: '8', name: 'ChatGPT', url: 'https://chat.openai.com/', description: 'OpenAI\'s flagship model with DALL-E 3' },
];

export const ExploreScreen = () => {
  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => Linking.openURL(item.url)}
    >
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={aiTools}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFBF00',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardContent: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666666',
  }
});
