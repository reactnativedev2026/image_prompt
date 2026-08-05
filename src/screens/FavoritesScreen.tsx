import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../store/AppContext';
import { PromptItem } from '../data/mockPrompts';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2;
const IMAGE_HEIGHT = (CARD_WIDTH * 4) / 3;

const CATEGORY_COLORS: Record<string, string> = {
  Cyberpunk: '#7C3AED',
  'Sci-Fi': '#0284C7',
  Fantasy: '#059669',
  Minimalist: '#D97706',
  Steampunk: '#B45309',
  Portrait: '#DB2777',
};

export const FavoritesScreen = () => {
  const navigation = useNavigation<any>();
  const { favorites, toggleFavorite } = useAppContext();

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
            <Icon name="heart" size={15} color="#FF69B4" />
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
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>💖 My Favorites</Text>
          <Text style={styles.headerSub}>
            {favorites.length} saved prompt{favorites.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCircle}>
            <Icon name="heart-outline" size={44} color="#FF69B4" />
          </View>
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the heart icon on any prompt to save it here for quick access.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('Gallery')}
          >
            <Icon name="compass-outline" size={18} color="#FFF" />
            <Text style={styles.exploreBtnText}>Browse Gallery</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFF' },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
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

  gridContent: { paddingHorizontal: 20, paddingBottom: 30 },
  row: { justifyContent: 'space-between' },

  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#DB2777',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  imageWrapper: {
    width: '100%',
    height: IMAGE_HEIGHT,
    backgroundColor: '#F5F0F8',
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

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#FF69B4',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 28,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF69B4',
    paddingVertical: 13,
    paddingHorizontal: 26,
    borderRadius: 30,
    gap: 8,
    shadowColor: '#FF69B4',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  exploreBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 6,
  },
});
