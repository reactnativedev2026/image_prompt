import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PromptItem, mockPrompts } from '../data/mockPrompts';
import { useAppContext } from '../store/AppContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme/colors';
import { fetchCategories, fetchTrendingPrompts, ApiCategory } from '../utils/api';

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

const AnimatedTrendingCard = ({
  item,
  index,
  navigation,
  toggleFavorite,
  isFavorite,
  promptsList,
}: {
  item: PromptItem;
  index: number;
  navigation: any;
  toggleFavorite: any;
  isFavorite: any;
  promptsList: PromptItem[];
}) => {
  const scale = useRef(new Animated.Value(0.95)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
      }),
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
        {/* Trending Fire Badge */}
        <View style={styles.fireBadge}>
          <Icon name="fire" size={12} color="#FFF" />
        </View>

        {/* Info overlayed on bottom of image */}
        <View style={styles.cardInfoOverlay}>
          {/* <Text style={styles.cardTitle} numberOfLines={1}>
            {meta.title}
          </Text> */}
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

export const TrendingScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { isFavorite, toggleFavorite } = useAppContext();

  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Pagination State (20 items per page) ──
  const PAGE_LIMIT = 20;
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const loadTrendingData = async (pageNum = 1, isRefresh = false) => {
    if (pageNum === 1) {
      if (!isRefresh) setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const [cats, trendingPts] = await Promise.all([
        fetchCategories(),
        fetchTrendingPrompts(undefined, pageNum, PAGE_LIMIT),
      ]);

      if (trendingPts && trendingPts.length > 0) {
        const mapped = trendingPts.map(p => {
          const catObj = cats.find(c => c.id === p.category_id);
          return {
            id: String(p.id),
            imageUrl: p.image_url,
            promptText: p.prompt_text,
            category: catObj ? catObj.name : 'Trending',
            viewCount: p.view_count || 0,
            isTrending: true,
          };
        });

        if (pageNum === 1) {
          setPrompts(mapped);
        } else {
          setPrompts(prev => {
            const existingIds = new Set(prev.map(item => item.id));
            const fresh = mapped.filter(item => !existingIds.has(item.id));
            return [...prev, ...fresh];
          });
        }

        setHasMore(trendingPts.length === PAGE_LIMIT);
        setPage(pageNum);
      } else {
        if (pageNum === 1) {
          const fallback = mockPrompts.slice(0, 10).map(p => ({
            ...p,
            isTrending: true,
          }));
          setPrompts(fallback);
          setHasMore(false);
        } else {
          setHasMore(false);
        }
      }
    } catch (e) {
      console.error('Error fetching trending prompts:', e);
      if (pageNum === 1) {
        const fallback = mockPrompts.slice(0, 10).map(p => ({
          ...p,
          isTrending: true,
        }));
        setPrompts(fallback);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    loadTrendingData(1, false);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    loadTrendingData(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      loadTrendingData(page + 1, false);
    }
  };

  const filtered = prompts.filter(item => {
    if (!searchQuery.trim()) return true;
    return (
      item.promptText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.fireEmoji}>🔥</Text>
          <Text style={styles.headerTitle}>Trending</Text>
          <LinearGradient
            colors={['#FF6B00', '#FF3D00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.trendingTag}
          >
            <Text style={styles.trendingTagText}>HOT</Text>
          </LinearGradient>
        </View>
        <Text style={styles.headerSub}>Most popular & viral AI prompts today</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Icon name="magnify" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search trending prompts..."
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
      </View>

      {/* 3-Column Grid */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF6B00" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={filtered}
          keyExtractor={i => i.id}
          numColumns={3}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FF6B00"
              colors={['#FF6B00']}
            />
          }
          onScroll={e => {
            const y = e.nativeEvent.contentOffset.y;
            setShowScrollToTop(y > 400);
          }}
          scrollEventThrottle={16}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 18, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#FF6B00" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="fire-off" size={48} color="#64748B" />
              <Text style={styles.emptyTitle}>No Trending Prompts</Text>
              <Text style={styles.emptySub}>
                Prompts marked as trending in Admin will appear here.
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <AnimatedTrendingCard
              item={item}
              index={index}
              navigation={navigation}
              toggleFavorite={toggleFavorite}
              isFavorite={isFavorite}
              promptsList={filtered}
            />
          )}
        />
      )}

      {/* Scroll to top button */}
      {showScrollToTop && (
        <TouchableOpacity
          style={[styles.scrollToTopBtn, { bottom: insets.bottom + 75 }]}
          activeOpacity={0.8}
          onPress={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}
        >
          <LinearGradient
            colors={['#FF6B00', '#FF3D00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scrollToTopGradient}
          >
            <Icon name="arrow-up" size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0C14',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fireEmoji: {
    fontSize: 22,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  trendingTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  trendingTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121222',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#1F1F35',
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    paddingHorizontal: 8,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 24,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: IMAGE_HEIGHT,
    padding: 4,
  },
  cardInner: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1E1E2D',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  fireBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 61, 0, 0.85)',
    borderRadius: 8,
    padding: 3,
  },
  cardInfoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(12, 12, 20, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
  },
  scrollToTopBtn: {
    position: 'absolute',
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    shadowColor: '#FF3D00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  scrollToTopGradient: {
    flex: 1,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
