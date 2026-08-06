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
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 34) / 2;
// Restored to the original height (4:3 ratio: width * 4 / 3)
const IMAGE_HEIGHT = (CARD_WIDTH * 4) / 3;

// Premium Animated Favorite Card component with multicolor gradient border
const AnimatedFavoriteCard = ({ item, index, navigation, toggleFavorite }: {
  item: PromptItem;
  index: number;
  navigation: any;
  toggleFavorite: any;
}) => {
  const scale = React.useRef(new Animated.Value(0.92)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  // Generate fake high-quality view counts based on item ID for premium vibe
  const fakeViews = React.useMemo(() => {
    const idNum = parseInt(item.id, 10) || 1;
    return (idNum * 142 + 250) % 900 + 100;
  }, [item.id]);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay: Math.min(index * 60, 600),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: Math.min(index * 60, 600),
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.cardContainer, { opacity, transform: [{ scale }] }]}>
      {/* Dynamic Multicolor Gradient Border */}
      <LinearGradient
        colors={['#FF69B4', '#7C3AED', '#3B82F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      >
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => navigation.navigate('PromptDetail', { item })}
          style={styles.cardInner}
        >
          <View style={styles.imageWrapper}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            
            {/* Glass-styled Favorite Button */}
            <TouchableOpacity
              style={styles.favButton}
              activeOpacity={0.8}
              onPress={() => toggleFavorite(item)}
            >
              <Icon name="heart" size={16} color="#FF4D6D" />
            </TouchableOpacity>

            {/* Premium Bottom Bar on Image */}
            <View style={styles.imageFooterOverlay}>
              <View style={styles.viewCountWrap}>
                <Icon name="eye-outline" size={13} color="#FFFFFF" />
                <Text style={styles.viewCountText}>{fakeViews}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </LinearGradient>
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
          renderItem={({ item, index }) => (
            <AnimatedFavoriteCard
              item={item}
              index={index}
              navigation={navigation}
              toggleFavorite={toggleFavorite}
            />
          )}
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
  container: { flex: 1, backgroundColor: '#FAF9FF' },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },

  gridContent: { paddingHorizontal: 12, paddingBottom: 30 },
  row: { justifyContent: 'space-between', gap: 10 },

  // Card Outer Container
  cardContainer: {
    width: CARD_WIDTH,
    marginBottom: 10,
  },
  // Multicolor Gradient Border Frame
  gradientBorder: {
    padding: 2.5, // thickness of gradient border
    borderRadius: 18,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    height: IMAGE_HEIGHT,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  
  favButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    borderRadius: 10,
    padding: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 10,
  },

  // Image Footer View Count Overlay
  imageFooterOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 36,
    paddingHorizontal: 10,
    justifyContent: 'flex-end',
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  viewCountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
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
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
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
export default FavoritesScreen;
