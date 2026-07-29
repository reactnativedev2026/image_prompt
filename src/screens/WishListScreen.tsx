import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Share, Alert, ToastAndroid, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { toggleFavouriteWish, isFavouriteWish } from '../store/storage';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'WishList'>;
type WishListRouteProp = RouteProp<RootStackParamList, 'WishList'>;

import WISHES_DATA from '../data';

const MOCK_WISHES = Object.entries(WISHES_DATA).flatMap(([cat, wishes]) => 
  (wishes as any[]).map((wish: any) => ({ ...wish, category: cat }))
);

const shuffleArray = (array: any[]) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

const WishListScreen = () => {
  const { t } = useTranslation();
  const route = useRoute<WishListRouteProp & { params: { focusSearch?: boolean } }>();
  const navigation = useNavigation<NavigationProp>();

  const category = route.params?.category;
  
  const [localSearchQuery, setLocalSearchQuery] = useState(route.params?.searchQuery || '');
  const [shuffledWishes] = useState(() => shuffleArray([...MOCK_WISHES]));

  const [allWishes, setAllWishes] = useState<any[]>([]);
  const [displayedWishes, setDisplayedWishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favs, setFavs] = useState<Record<string, boolean>>({});
  
  const PAGE_SIZE = 20;

  useEffect(() => {
    const loadWishes = async () => {
      setLoading(true);

      // Filter mock data
      let filtered = shuffledWishes;
      if (category) {
        filtered = filtered.filter(w => w.category === category);
      } else if (localSearchQuery.trim().length > 0) {
        const query = localSearchQuery.toLowerCase();
        filtered = filtered.filter(w =>
          w.text.toLowerCase().includes(query) ||
          t(`categories.${w.category}`).toLowerCase().includes(query)
        );
      }

      setAllWishes(filtered);

      const initialBatch = filtered.slice(0, PAGE_SIZE);

      // Check favs only for initial batch to save performance
      const newFavs: Record<string, boolean> = {};
      for (const w of initialBatch) {
        newFavs[w.id] = await isFavouriteWish(w.id);
      }
      setFavs(newFavs);

      setDisplayedWishes(initialBatch);
      setLoading(false);
    };

    loadWishes();
  }, [category, localSearchQuery, t, shuffledWishes]);

  const loadMoreWishes = async () => {
    if (displayedWishes.length >= allWishes.length) return;

    const nextBatch = allWishes.slice(displayedWishes.length, displayedWishes.length + PAGE_SIZE);
    
    const newFavs = { ...favs };
    for (const w of nextBatch) {
      newFavs[w.id] = await isFavouriteWish(w.id);
    }
    setFavs(newFavs);

    setDisplayedWishes(prev => [...prev, ...nextBatch]);
  };

  const toggleFav = async (wish: any) => {
    const isFav = await toggleFavouriteWish(wish);
    setFavs(prev => ({ ...prev, [wish.id]: isFav }));
  };

  const handleCopy = (text: string) => {
    // Clipboard.setString(text);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Wish copied to clipboard!', ToastAndroid.SHORT);
    } else {
      Alert.alert('Success', 'Wish copied to clipboard!');
    }
  };

  const handleShare = async (text: string) => {
    try {
      await Share.share({ message: text });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const renderWishItem = ({ item }: { item: any }) => (
    <View style={styles.wishCard}>
      <Text style={styles.wishText}>{item.text}</Text>

      <View style={styles.wishActions}>
        <Text style={styles.categoryBadge}>{t(`categories.${item.category}`)}</Text>
        <View style={{ flexDirection: 'row', gap: 15 }}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleCopy(item.text)}>
            <Icon name="copy-outline" size={24} color={colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleShare(item.text)}>
            <Icon name="share-social-outline" size={24} color={colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => toggleFav(item)}>
            <Icon name={favs[item.id] ? "heart" : "heart-outline"} size={24} color={colors.favourite} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const getTitle = () => {
    if (category) return t(`categories.${category}`);
    return 'All Wishes';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getTitle()}</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {!category && (
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('common.search') + "..."}
            placeholderTextColor={colors.textLight}
            value={localSearchQuery}
            onChangeText={setLocalSearchQuery}
            autoFocus={route.params?.focusSearch}
          />
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={colors.primaryDark} style={{ marginTop: 50 }} />
      ) : displayedWishes.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="search-outline" size={60} color={colors.textLight} />
          <Text style={styles.emptyText}>No wishes found.</Text>
        </View>
      ) : (
        <FlatList
          data={displayedWishes}
          keyExtractor={(item) => item.id}
          renderItem={renderWishItem}
          contentContainerStyle={styles.listContainer}
          onEndReached={loadMoreWishes}
          onEndReachedThreshold={0.5}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  listContainer: {
    padding: 15,
  },
  wishCard: {
    backgroundColor: colors.surface,
    padding: 20,
    marginBottom: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  wishText: {
    fontSize: typography.sizes.md,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 15,
  },
  wishActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  categoryBadge: {
    fontSize: typography.sizes.xs,
    color: colors.primaryDark,
    backgroundColor: colors.primaryLight + '40', // 40 for transparency
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButton: {
    padding: 5,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -50,
  },
  emptyText: {
    marginTop: 15,
    fontSize: typography.sizes.md,
    color: colors.textLight,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    margin: 15,
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: typography.sizes.md,
    color: colors.text,
  }
});

export default WishListScreen;
