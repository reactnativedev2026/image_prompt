import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../store/AppContext';
import { PromptItem } from '../data/mockPrompts';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40) / 3;
const IMAGE_HEIGHT = CARD_WIDTH * 1.50;

const getPromptDisplayMeta = (id: string, category: string) => {
  const metas: Record<string, { title: string; rating: string }> = {
    '1': { title: 'Cyberpunk City', rating: '4.8K' },
    '7': { title: 'Cozy Cabin', rating: '3.2K' },
    '8': { title: 'Astronaut', rating: '5.6K' },
    '2': { title: 'Fantasy Portrait', rating: '4.1K' },
    '9': { title: 'Night Drive', rating: '2.9K' },
    '10': { title: 'Floating Island', rating: '3.7K' },
    '11': { title: 'Cute Robot', rating: '2.3K' },
    '12': { title: 'Mountain Lake', rating: '3.1K' },
    '13': { title: 'Anime Girl', rating: '4.4K' },
    '14': { title: 'Ice Dragon', rating: '3.5K' },
    '15': { title: 'Steam Train', rating: '3.9K' },
    '16': { title: 'Pocket Watch', rating: '3.4K' },
    '6': { title: 'Cyber Geisha', rating: '4.2K' },
    '17': { title: 'Space Station', rating: '5.1K' },
    '18': { title: 'Botanical Leaf', rating: '2.8K' },
  };
  return metas[id] || { title: category + ' Item', rating: '3.0K' };
};

const AnimatedFavoriteCard = ({ item, index, navigation, toggleFavorite }: {
  item: PromptItem;
  index: number;
  navigation: any;
  toggleFavorite: any;
}) => {
  const scale = useRef(new Animated.Value(0.95)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay: Math.min(index * 30, 300),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        tension: 50,
        delay: Math.min(index * 30, 300),
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const meta = getPromptDisplayMeta(item.id, item.category);

  return (
    <Animated.View style={[styles.cardContainer, { opacity, transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('PromptDetail', { item })}
        style={styles.cardInner}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        {/* Top-Right Image Icon */}
        <View style={styles.imageIconBadge}>
          <Icon name="image" size={12} color="#FFF" />
        </View>

        {/* Info overlayed on bottom of image */}
        <View style={styles.cardInfoOverlay}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {meta.title}
          </Text>
          <View style={styles.cardFooter}>
            <View style={styles.ratingWrap}>
              <Icon name="star" size={10} color="#FFB300" />
              <Text style={styles.ratingText}>{meta.rating}</Text>
            </View>
            <TouchableOpacity
              onPress={() => toggleFavorite(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon
                name="bookmark"
                size={14}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const FavoritesScreen = () => {
  const navigation = useNavigation<any>();
  const { favorites, toggleFavorite } = useAppContext();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
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
            <Icon name="heart-outline" size={44} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the bookmark icon on any prompt to save it here for quick access.
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
          renderItem={({ item, index }) => (
            <AnimatedFavoriteCard
              item={item}
              index={index}
              navigation={navigation}
              toggleFavorite={toggleFavorite}
            />
          )}
          numColumns={3}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 2,
  },

  gridContent: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 30 },
  row: { justifyContent: 'flex-start', gap: 8 },

  // Card
  cardContainer: {
    width: CARD_WIDTH,
    marginBottom: 12,
  },
  cardInner: {
    height: IMAGE_HEIGHT,
    backgroundColor: '#121222',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1F1F35',
    position: 'relative',
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  imageIconBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 6,
    padding: 4,
    zIndex: 2,
  },

  // Card details
  cardInfoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    zIndex: 2,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    color: '#FFB300',
    fontSize: 9,
    fontWeight: '700',
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
    backgroundColor: '#121222',
    borderWidth: 1,
    borderColor: '#1F1F35',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 28,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8A2BE2',
    paddingVertical: 13,
    paddingHorizontal: 26,
    borderRadius: 30,
    gap: 8,
    elevation: 5,
  },
  exploreBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 6,
  },
});

export default FavoritesScreen;
