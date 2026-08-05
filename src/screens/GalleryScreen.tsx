import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { mockPrompts, PromptItem } from '../data/mockPrompts';
import { useAppContext } from '../store/AppContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2;
const IMAGE_HEIGHT = (CARD_WIDTH * 4) / 3;

const CATEGORIES = ['All', 'Cyberpunk', 'Sci-Fi', 'Fantasy', 'Minimalist', 'Steampunk', 'Portrait'];

const CATEGORY_COLORS: Record<string, string> = {
  Cyberpunk: '#7C3AED',
  'Sci-Fi': '#0284C7',
  Fantasy: '#059669',
  Minimalist: '#D97706',
  Steampunk: '#B45309',
  Portrait: '#DB2777',
  All: '#FF69B4',
};

export const GalleryScreen = () => {
  const navigation = useNavigation<any>();
  const { isFavorite, toggleFavorite } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredPrompts = mockPrompts.filter(item => {
    const matchesSearch =
      item.promptText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderItem = ({ item }: { item: PromptItem }) => {
    const catColor = CATEGORY_COLORS[item.category] || '#FF69B4';
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('PromptDetail', { item })}
      >
        <View style={styles.imageWrapper}>
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
          <TouchableOpacity
            style={styles.favButton}
            activeOpacity={0.8}
            onPress={() => toggleFavorite(item)}
          >
            <Icon
              name={isFavorite(item.id) ? 'heart' : 'heart-outline'}
              size={15}
              color={isFavorite(item.id) ? '#FF69B4' : '#FFFFFF'}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.cardBody}>
          <View style={[styles.catBadge, { backgroundColor: catColor + '18' }]}>
            <Text style={[styles.catBadgeText, { color: catColor }]}>{item.category}</Text>
          </View>
          <Text style={styles.cardPrompt} numberOfLines={2}>{item.promptText}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFF" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>✨ AI Prompt Gallery</Text>
          <Text style={styles.headerSub}>Discover & copy stunning prompts</Text>
        </View>
        <View style={styles.headerAvatar}>
          <Icon name="palette" size={20} color="#FF69B4" />
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Icon name="magnify" size={20} color="#AAAAAA" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search prompts, styles..."
          placeholderTextColor="#BBBBBB"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={18} color="#AAAAAA" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Pills */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={c => c}
        contentContainerStyle={styles.pillRow}
        renderItem={({ item }) => {
          const active = selectedCategory === item;
          const cc = CATEGORY_COLORS[item] || '#FF69B4';
          return (
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.pill, active && { backgroundColor: cc, borderColor: cc }]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text style={[styles.pillText, active && { color: '#FFF' }]}>{item}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Grid */}
      <FlatList
        data={filteredPrompts}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Icon name="image-search-outline" size={56} color="#DDDDDD" />
            <Text style={styles.emptyText}>No prompts found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFF' },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerGreeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A2E',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF69B4',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  // Search
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 14,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0EEF8',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A2E',
  },

  // Pills
  pillRow: { paddingHorizontal: 20, paddingBottom: 14, gap: 8 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginRight: 8,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },

  // Grid
  gridContent: { paddingHorizontal: 20, paddingBottom: 30 },
  row: { justifyContent: 'space-between' },

  // Card
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  imageWrapper: {
    width: '100%',
    height: IMAGE_HEIGHT,
    backgroundColor: '#F0EEF8',
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  favButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.38)',
    borderRadius: 14,
    padding: 5,
  },
  cardBody: { padding: 10 },
  catBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 5,
  },
  catBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardPrompt: {
    fontSize: 12,
    color: '#333',
    lineHeight: 17,
    fontWeight: '500',
  },

  // Empty
  emptyBox: { alignItems: 'center', paddingVertical: 60, width: width - 40 },
  emptyText: { marginTop: 12, fontSize: 15, color: '#BBBBBB' },
});
