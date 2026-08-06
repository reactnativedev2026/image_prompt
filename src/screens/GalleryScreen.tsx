import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { mockPrompts, PromptItem } from '../data/mockPrompts';
import { useAppContext } from '../store/AppContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 34) / 2;
// Restored to the original height (4:3 ratio: width * 4 / 3)
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

const CATEGORY_GRADIENTS: Record<string, string[]> = {
  Cyberpunk: ['#7C3AED', '#EC4899'],
  'Sci-Fi': ['#0284C7', '#0EA5E9'],
  Fantasy: ['#059669', '#10B981'],
  Minimalist: ['#D97706', '#F59E0B'],
  Steampunk: ['#B45309', '#D97706'],
  Portrait: ['#DB2777', '#EC4899'],
  All: ['#FF69B4', '#7C3AED'],
};

// Animated Card Component for Premium Feel with multicolor gradient border
const AnimatedCard = ({ item, index, navigation, toggleFavorite, isFavorite }: {
  item: PromptItem;
  index: number;
  navigation: any;
  toggleFavorite: any;
  isFavorite: any;
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
              <Icon
                name={isFavorite(item.id) ? 'heart' : 'heart-outline'}
                size={16}
                color={isFavorite(item.id) ? '#FF4D6D' : '#FFFFFF'}
              />
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

export const GalleryScreen = () => {
  const navigation = useNavigation<any>();
  const { isFavorite, toggleFavorite } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Animated Value for Scroll-Collapse Header
  const scrollY = useRef(new Animated.Value(0)).current;

  const filteredPrompts = mockPrompts.filter(item => {
    const matchesSearch =
      item.promptText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const insets = useSafeAreaInsets();

  // Dynamic values for animated header shrinking/collapsing
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [64, 0],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0.88],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* ── Collapsible Fancy Header ── */}
      <Animated.View
        style={[
          styles.fancyHeader,
          {
            height: headerHeight,
            opacity: headerOpacity,
            transform: [{ scale: headerScale }],
          },
        ]}
      >
        <View>
          <Text style={styles.headerTitle}>✨ AI Studio</Text>
          <Text style={styles.headerSubtitle}>Discover stunning prompts formula</Text>
        </View>
        <View style={styles.avatarGlow}>
          <Icon name="creation" size={18} color="#FF69B4" />
        </View>
      </Animated.View>

      {/* Search & Pills stay fixed */}
      <View style={styles.fixedTopSection}>
        {/* Search */}
        <View style={styles.searchBox}>
          <Icon name="magnify" size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search prompts style..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Pills */}
        <View style={styles.pillRowWrapper}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIES}
            keyExtractor={c => c}
            contentContainerStyle={styles.pillRow}
            renderItem={({ item }) => {
              const active = selectedCategory === item;
              const cc = CATEGORY_COLORS[item] || '#FF69B4';

              let iconName = 'tag-outline';
              if (item === 'All') iconName = 'apps';
              else if (item === 'Cyberpunk') iconName = 'robot';
              else if (item === 'Sci-Fi') iconName = 'rocket-launch';
              else if (item === 'Fantasy') iconName = 'creation';
              else if (item === 'Minimalist') iconName = 'shape-outline';
              else if (item === 'Steampunk') iconName = 'cog';
              else if (item === 'Portrait') iconName = 'account-box';

              if (active) {
                const gradientColors = CATEGORY_GRADIENTS[item] || ['#FF69B4', '#7C3AED'];
                return (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setSelectedCategory(item)}
                  >
                    <LinearGradient
                      colors={gradientColors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.pillActiveGradient}
                    >
                      <Icon name={iconName} size={15} color="#FFF" style={{ marginRight: 6 }} />
                      <Text style={[styles.pillText, { color: '#FFF' }]}>{item}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.pill}
                  onPress={() => setSelectedCategory(item)}
                >
                  <Icon name={iconName} size={15} color={cc} style={{ marginRight: 6 }} />
                  <Text style={styles.pillText}>{item}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>

      {/* Grid */}
      <Animated.FlatList
        data={filteredPrompts}
        keyExtractor={i => i.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <AnimatedCard
            item={item}
            index={index}
            navigation={navigation}
            toggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
          />
        )}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Icon name="image-search-outline" size={56} color="#CBD5E1" />
            <Text style={styles.emptyText}>No prompts found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9FF' },

  // Collapsible Fancy Header
  fancyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  avatarGlow: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },

  fixedTopSection: {
    backgroundColor: '#FAF9FF',
    paddingTop: 8,
  },

  // Search
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 14,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ECECF3',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
  },

  // Pills
  pillRowWrapper: {
    height: 48,
  },
  pillRow: { paddingHorizontal: 20, paddingBottom: 8, gap: 8, alignItems: 'center' },
  pill: {
    flexDirection: 'row',
    height: 34,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECECF3',
    marginRight: 8,
  },
  pillActiveGradient: {
    flexDirection: 'row',
    height: 34,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 17,
    marginRight: 8,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },

  // Grid
  gridContent: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 30 },
  row: { justifyContent: 'space-between', gap: 10 },

  // Card Outer Container
  cardContainer: {
    width: CARD_WIDTH,
    marginBottom: 10,
  },
  // Multicolor Gradient Border Frame
  gradientBorder: {
    padding: 2.5,
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

  // Empty
  emptyBox: { alignItems: 'center', paddingVertical: 60, width: width - 40 },
  emptyText: { marginTop: 12, fontSize: 15, color: '#94A3B8', fontWeight: '600' },
});
export default GalleryScreen;
