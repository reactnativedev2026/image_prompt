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
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40) / 3;
const IMAGE_HEIGHT = CARD_WIDTH * 1.50;

const CATEGORIES = ['All', 'Art', 'Photography', 'Illustration', '3D Render', 'Anime'];

const mapCategory = (itemCat: string) => {
  if (itemCat === 'Cyberpunk') return 'Anime';
  if (itemCat === 'Sci-Fi') return '3D Render';
  if (itemCat === 'Fantasy') return 'Illustration';
  if (itemCat === 'Minimalist') return 'Art';
  if (itemCat === 'Steampunk') return 'Illustration';
  if (itemCat === 'Portrait') return 'Photography';
  return 'Art';
};

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

const AnimatedCard = ({ item, index, navigation, toggleFavorite, isFavorite }: {
  item: PromptItem;
  index: number;
  navigation: any;
  toggleFavorite: any;
  isFavorite: any;
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
  const fav = isFavorite(item.id);

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
                name={fav ? 'bookmark' : 'bookmark-outline'}
                size={14}
                color={fav ? colors.primary : '#FFFFFF'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const GalleryScreen = () => {
  const navigation = useNavigation<any>();
  const { isFavorite, toggleFavorite } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredPrompts = mockPrompts.filter(item => {
    const itemUIcategory = mapCategory(item.category);
    const matchesSearch =
      item.promptText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      itemUIcategory.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || itemUIcategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* ── Top Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn}>
          <Icon name="menu" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.titleWrapper}>
          <Text style={styles.headerTitleMain}>
            AI Prompt <Text style={styles.headerTitlePurple}>Generator</Text>
          </Text>
        </View>

        <TouchableOpacity style={styles.headerBtn}>
          <Icon name="crown" size={24} color="#8A2BE2" />
        </TouchableOpacity>
      </View>

      {/* ── Search Bar & Filter ── */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Icon name="magnify" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search prompts or categories..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={18} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8}>
          <LinearGradient
            colors={['#A15DFB', '#8A2BE2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.filterBtnGradient}
          >
            <Icon name="tune" size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* ── Category Pills ── */}
      <View style={styles.pillRowWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={c => c}
          contentContainerStyle={styles.pillRow}
          renderItem={({ item }) => {
            const active = selectedCategory === item;
            if (active) {
              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setSelectedCategory(item)}
                >
                  <LinearGradient
                    colors={['#A15DFB', '#8A2BE2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.pillActiveGradient}
                  >
                    <Text style={styles.pillTextActive}>{item}</Text>
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
                <Text style={styles.pillText}>{item}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* ── 3-Column Grid ── */}
      <FlatList
        data={filteredPrompts}
        keyExtractor={i => i.id}
        renderItem={({ item, index }) => (
          <AnimatedCard
            item={item}
            index={index}
            navigation={navigation}
            toggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
          />
        )}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Icon name="image-search-outline" size={48} color="#2A2A3F" />
            <Text style={styles.emptyText}>No prompts found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 8,
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleMain: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerTitlePurple: {
    color: '#A15DFB',
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121222',
    borderColor: '#1F1F35',
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    padding: 0,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
  },
  filterBtnGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Pills
  pillRowWrapper: {
    height: 40,
    marginBottom: 8,
  },
  pillRow: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#121222',
    borderWidth: 1,
    borderColor: '#1F1F35',
  },
  pillActiveGradient: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  pillTextActive: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Grid
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

  // Empty
  emptyBox: { alignItems: 'center', paddingVertical: 60, width: width - 32 },
  emptyText: { marginTop: 12, fontSize: 14, color: '#64748B', fontWeight: '600' },
});

export default GalleryScreen;
