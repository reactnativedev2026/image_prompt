import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { mockPrompts, PromptItem } from '../data/mockPrompts';
import { useAppContext } from '../store/AppContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const GalleryScreen = () => {
  const navigation = useNavigation<any>();
  const { isFavorite, toggleFavorite } = useAppContext();

  const renderItem = ({ item }: { item: PromptItem }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('PromptDetail', { item })}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.promptText} numberOfLines={2}>{item.promptText}</Text>
      </View>
      <TouchableOpacity 
        style={styles.favButton}
        onPress={() => toggleFavorite(item)}
      >
        <Icon name={isFavorite(item.id) ? "heart" : "heart-outline"} size={24} color={isFavorite(item.id) ? "#FFBF00" : "#FFF"} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={mockPrompts}
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
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  textContainer: {
    padding: 12,
  },
  category: {
    color: '#FFBF00',
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  promptText: {
    color: '#333333',
    fontSize: 14,
    lineHeight: 20,
  },
  favButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 6,
  }
});
