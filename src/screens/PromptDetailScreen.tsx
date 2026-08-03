import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Share } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppContext } from '../store/AppContext';
import { PromptItem } from '../data/mockPrompts';
import { Linking } from 'react-native';

const toolUrls: Record<string, string> = {
  'Gemini': 'https://gemini.google.com/',
  'Canva': 'https://www.canva.com/ai-image-generator/',
  'Bing Image Creator': 'https://www.bing.com/create',
  'Leonardo': 'https://leonardo.ai/',
  'Ideogram': 'https://ideogram.ai/',
  'Playground': 'https://playground.com/',
  'Adobe Firefly': 'https://firefly.adobe.com/',
  'ChatGPT': 'https://chat.openai.com/',
};

export const PromptDetailScreen = () => {
  const route = useRoute<any>();
  const { item } = route.params as { item: PromptItem };
  const { defaultTool, isFavorite, toggleFavorite } = useAppContext();

  const handleCopy = () => {
    Clipboard.setString(item.promptText);
    // Ideally show a toast here
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this prompt:\n\n${item.promptText}`,
      });
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const handleOpenTool = () => {
    handleCopy();
    const url = toolUrls[defaultTool] || toolUrls['Gemini'];
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.category}>{item.category}</Text>
          <TouchableOpacity onPress={() => toggleFavorite(item)}>
            <Icon name={isFavorite(item.id) ? "heart" : "heart-outline"} size={28} color={isFavorite(item.id) ? "#FFBF00" : "#999"} />
          </TouchableOpacity>
        </View>
        <Text style={styles.promptText}>{item.promptText}</Text>
        
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
            <Icon name="content-copy" size={20} color="#333" />
            <Text style={styles.actionText}>Copy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Icon name="share-variant" size={20} color="#333" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleOpenTool}>
          <Text style={styles.primaryButtonText}>Copy & Open in {defaultTool}</Text>
          <Icon name="open-in-new" size={20} color="#FFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  category: {
    color: '#FFBF00',
    fontWeight: 'bold',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  promptText: {
    fontSize: 18,
    color: '#333333',
    lineHeight: 26,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  actionText: {
    marginLeft: 8,
    color: '#333',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#FFBF00',
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#FFBF00',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
