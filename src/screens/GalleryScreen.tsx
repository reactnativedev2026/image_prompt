import React, { useState, useRef, useEffect } from 'react';
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
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { mockPrompts, PromptItem } from '../data/mockPrompts';
import { useAppContext } from '../store/AppContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme/colors';
import { fetchCategories, fetchPrompts, ApiCategory } from '../utils/api';

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

const AnimatedCard = ({ item, index, navigation, toggleFavorite, isFavorite, promptsList }: {
  item: PromptItem;
  index: number;
  navigation: any;
  toggleFavorite: any;
  isFavorite: any;
  promptsList: PromptItem[];
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
        onPress={() => navigation.navigate('PromptDetail', { item, promptsList })}
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
  const { isFavorite, toggleFavorite, setDrawerOpen } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dbCategories, setDbCategories] = useState<ApiCategory[]>([]);

  // Scroll to Top ref and state
  const flatListRef = useRef<FlatList>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Filter Modal & Sorting state
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'views' | 'alphabetical'>('default');

  const shufflePrompts = () => {
    setSortBy('default');
    setPrompts((prevPrompts) => {
      const shuffled = [...prevPrompts];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
  };

  const loadData = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) setLoading(true);
    try {
      const [cats, pts] = await Promise.all([
        fetchCategories(),
        fetchPrompts()
      ]);
      setDbCategories(cats);

      // Merge dynamic categories
      const categoryNames = ['All', ...cats.map(c => c.name)];
      setCategories(categoryNames);

      if (pts && pts.length > 0) {
        const mappedPrompts = pts.map(p => {
          const catObj = cats.find(c => c.id === p.category_id);
          return {
            id: String(p.id),
            imageUrl: p.image_url,
            promptText: p.prompt_text,
            category: catObj ? catObj.name : 'Other',
            viewCount: p.view_count || 0
          };
        });
        setPrompts(mappedPrompts);
      } else {
        // Fallback to mockPrompts if backend is empty
        const mappedMock = mockPrompts.map(p => ({
          ...p,
          viewCount: p.viewCount || Math.floor(Math.random() * 1000) + 100
        }));
        setPrompts(mappedMock);
      }
    } catch (e) {
      console.error('Error fetching dynamic prompts/categories:', e);
      // Fallback to mock data on error
      const mappedMock = mockPrompts.map(p => ({
        ...p,
        viewCount: p.viewCount || Math.floor(Math.random() * 1000) + 100
      }));
      setPrompts(mappedMock);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(false);
  };

  const filteredPrompts = prompts.filter(item => {
    const matchesSearch =
      item.promptText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const sortedPrompts = React.useMemo(() => {
    if (sortBy === 'views') {
      return [...filteredPrompts].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    }
    if (sortBy === 'alphabetical') {
      return [...filteredPrompts].sort((a, b) => a.promptText.localeCompare(b.promptText));
    }
    return filteredPrompts;
  }, [filteredPrompts, sortBy]);

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* ── Top Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => setDrawerOpen(true)}>
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
        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8} onPress={() => setFilterVisible(true)}>
          <LinearGradient
            colors={colors.primaryGradient}
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
          data={categories}
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
                    colors={colors.primaryGradient}
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
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#8A2BE2" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={sortedPrompts}
          keyExtractor={i => i.id}
          renderItem={({ item, index }) => (
            <AnimatedCard
              item={item}
              index={index}
              navigation={navigation}
              toggleFavorite={toggleFavorite}
              isFavorite={isFavorite}
              promptsList={sortedPrompts}
            />
          )}
          numColumns={3}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[styles.gridContent, { flexGrow: 1 }]}
          showsVerticalScrollIndicator={false}
          alwaysBounceVertical={true}
          onScroll={(event) => {
            const offsetY = event.nativeEvent.contentOffset.y;
            if (offsetY > 300) {
              setShowScrollToTop(true);
            } else {
              setShowScrollToTop(false);
            }
          }}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8A2BE2"
              colors={['#8A2BE2']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Icon name="image-search-outline" size={48} color="#2A2A3F" />
              <Text style={styles.emptyText}>No prompts found</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.shuffleBtn}
        onPress={shufflePrompts}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={colors.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.shuffleGradient}
        >
          <Icon name="shuffle-variant" size={24} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>

      {showScrollToTop && (
        <TouchableOpacity
          style={styles.scrollToTopBtn}
          onPress={() => {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={colors.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scrollToTopGradient}
          >
            <Icon name="arrow-up" size={26} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* ── Filter / Sort Modal ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterVisible}
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🎛️ Filter & Sort</Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)} style={styles.modalCloseBtn}>
                <Icon name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.filterSectionLabel}>SORT PROMPTS BY</Text>

              <TouchableOpacity
                style={[styles.filterOption, sortBy === 'default' && styles.filterOptionActive]}
                onPress={() => setSortBy('default')}
              >
                <Icon name="clock-outline" size={20} color={sortBy === 'default' ? '#A15DFB' : '#94A3B8'} />
                <Text style={[styles.filterOptionLabel, sortBy === 'default' && styles.filterOptionLabelActive]}>Default (Latest)</Text>
                {sortBy === 'default' && <Icon name="check" size={20} color="#A15DFB" />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterOption, sortBy === 'views' && styles.filterOptionActive]}
                onPress={() => setSortBy('views')}
              >
                <Icon name="eye-outline" size={20} color={sortBy === 'views' ? '#A15DFB' : '#94A3B8'} />
                <Text style={[styles.filterOptionLabel, sortBy === 'views' && styles.filterOptionLabelActive]}>Popularity (Most Viewed)</Text>
                {sortBy === 'views' && <Icon name="check" size={20} color="#A15DFB" />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterOption, sortBy === 'alphabetical' && styles.filterOptionActive]}
                onPress={() => setSortBy('alphabetical')}
              >
                <Icon name="alpha-a-box-outline" size={20} color={sortBy === 'alphabetical' ? '#A15DFB' : '#94A3B8'} />
                <Text style={[styles.filterOptionLabel, sortBy === 'alphabetical' && styles.filterOptionLabelActive]}>Alphabetical (A-Z)</Text>
                {sortBy === 'alphabetical' && <Icon name="check" size={20} color="#A15DFB" />}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => setFilterVisible(false)}
              >
                <LinearGradient
                  colors={colors.primaryGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.applyBtnGradient}
                >
                  <Text style={styles.applyBtnText}>Apply Filter</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 9, 15, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#121222',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#1F1F35',
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F35',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1B1B32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
  },
  filterSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B1B32',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1F1F35',
  },
  filterOptionActive: {
    borderColor: '#A15DFB',
    backgroundColor: '#261C38',
  },
  filterOptionLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginLeft: 12,
  },
  filterOptionLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  applyBtn: {
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 20,
  },
  applyBtnGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  scrollToTopBtn: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10,
  },
  scrollToTopGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shuffleBtn: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10,
  },
  shuffleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GalleryScreen;
