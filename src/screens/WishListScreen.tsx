import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
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

// Mock database of wishes
const MOCK_WISHES = [
  { id: '1', category: 'friend', text: 'Happy birthday to my amazing friend! Wishing you all the best.' },
  { id: '2', category: 'friend', text: 'Another year older, but still looking great! Happy birthday!' },
  { id: '3', category: 'mother', text: 'Happy birthday Mom! Thank you for everything you do.' },
  { id: '4', category: 'mother', text: 'To the best mother in the world, happy birthday!' },
  { id: '5', category: 'father', text: 'Happy birthday Dad! You are my hero.' },
  { id: '6', category: 'father', text: 'Wishing a fantastic birthday to a fantastic father.' },
  { id: '7', category: 'sister', text: 'Happy birthday to my wonderful sister!' },
  { id: '8', category: 'brother', text: 'Happy birthday brother! Let’s celebrate!' },
  { id: '9', category: 'funnyWishes', text: 'Happy birthday! You’re one step closer to diapers again!' },
  { id: '10', category: 'romanticWishes', text: 'Happy birthday my love. You mean the world to me.' },
];

const WishListScreen = () => {
  const { t } = useTranslation();
  const route = useRoute<WishListRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  
  const category = route.params?.category;
  const searchQuery = route.params?.searchQuery;

  const [wishes, setWishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favs, setFavs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadWishes = async () => {
      setLoading(true);
      
      // Filter mock data
      let filtered = MOCK_WISHES;
      if (category) {
        filtered = filtered.filter(w => w.category === category);
      } else if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(w => 
          w.text.toLowerCase().includes(query) || 
          t(`categories.${w.category}`).toLowerCase().includes(query)
        );
      }

      // Check favs
      const newFavs: Record<string, boolean> = {};
      for (const w of filtered) {
        newFavs[w.id] = await isFavouriteWish(w.id);
      }
      setFavs(newFavs);
      
      setWishes(filtered);
      setLoading(false);
    };

    loadWishes();
  }, [category, searchQuery, t]);

  const handleWishPress = (wish: any) => {
    navigation.navigate('WishDetails', { wishId: wish.id, wishText: wish.text, category: wish.category });
  };

  const toggleFav = async (wish: any) => {
    const isFav = await toggleFavouriteWish(wish);
    setFavs(prev => ({ ...prev, [wish.id]: isFav }));
  };

  const renderWishItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.wishCard} onPress={() => handleWishPress(item)}>
      <Text style={styles.wishText}>{item.text}</Text>
      
      <View style={styles.wishActions}>
        <Text style={styles.categoryBadge}>{t(`categories.${item.category}`)}</Text>
        <TouchableOpacity style={styles.actionButton} onPress={() => toggleFav(item)}>
          <Icon name={favs[item.id] ? "heart" : "heart-outline"} size={24} color={colors.favourite} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const getTitle = () => {
    if (category) return t(`categories.${category}`);
    if (searchQuery) return `Search: "${searchQuery}"`;
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

      {loading ? (
        <ActivityIndicator size="large" color={colors.primaryDark} style={{ marginTop: 50 }} />
      ) : wishes.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="search-outline" size={60} color={colors.textLight} />
          <Text style={styles.emptyText}>No wishes found.</Text>
        </View>
      ) : (
        <FlatList
          data={wishes}
          keyExtractor={(item) => item.id}
          renderItem={renderWishItem}
          contentContainerStyle={styles.listContainer}
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
  }
});

export default WishListScreen;
