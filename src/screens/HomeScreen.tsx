import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput,
  TouchableOpacity,
  FlatList,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { RootStackParamList } from '../navigation/AppNavigator';

const POPULAR_CATEGORIES = ['friend', 'mother', 'father', 'sister', 'brother'];

const LATEST_WISHES = [
  { id: '1', text: 'Happy birthday to my amazing friend! Wishing you all the best.', category: 'friend' },
  { id: '2', text: 'To the best mother in the world, happy birthday!', category: 'mother' },
  { id: '3', text: 'Wishing a fantastic birthday to a fantastic father.', category: 'father' },
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const HomeScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const renderCategoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity 
      style={styles.categoryCard} 
      onPress={() => navigation.navigate('WishList', { category: item })}
    >
      <Icon name="gift-outline" size={24} color={colors.primaryDark} />
      <Text style={styles.categoryText}>{t(`categories.${item}`)}</Text>
    </TouchableOpacity>
  );

  const renderWishItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.latestWishCard}
      onPress={() => navigation.navigate('WishDetails', { wishId: item.id, wishText: item.text, category: item.category })}
    >
      <Icon name="quote" size={20} color={colors.primaryLight} style={styles.quoteIcon} />
      <Text style={styles.latestWishText} numberOfLines={3}>{item.text}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Birthday Wishes</Text>
      </View>

      <Animated.ScrollView style={[styles.content, { opacity: fadeAnim }]} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('common.search') + "..."}
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => {
              if (searchQuery.trim().length > 0) {
                navigation.navigate('WishList', { searchQuery });
                setSearchQuery('');
              }
            }}
          />
        </View>

        {/* Popular Categories */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('home.popularCategories')}</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={POPULAR_CATEGORIES}
            keyExtractor={(item) => item}
            renderItem={renderCategoryItem}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Latest Wishes */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.latestWishes')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('WishList', {})}>
              <Text style={styles.seeAllText}>{t('common.seeAll', 'See All')}</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={LATEST_WISHES}
            keyExtractor={(item) => item.id}
            renderItem={renderWishItem}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Trending GIFs Placeholder */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('home.trendingGifs')}</Text>
          <TouchableOpacity 
            style={styles.placeholderCard}
            onPress={() => navigation.navigate('Gifs')}
          >
            <Text style={styles.placeholderText}>Tap to view Trending GIFs</Text>
          </TouchableOpacity>
        </View>

        {/* Birthday Images Placeholder */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('home.birthdayImages')}</Text>
          <TouchableOpacity 
            style={styles.placeholderCard}
            onPress={() => navigation.navigate('Images')}
          >
            <Text style={styles.placeholderText}>Tap to view Beautiful Images</Text>
          </TouchableOpacity>
        </View>
        
        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    margin: 20,
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  sectionContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginLeft: 20,
    marginBottom: 15,
  },
  categoriesList: {
    paddingHorizontal: 15,
  },
  categoryCard: {
    backgroundColor: colors.surface,
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryText: {
    marginTop: 8,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
    textAlign: 'center',
  },
  placeholderCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: colors.textLight,
    fontSize: typography.sizes.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 20,
  },
  seeAllText: {
    color: colors.primaryDark,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginBottom: 15,
  },
  latestWishCard: {
    backgroundColor: colors.surface,
    padding: 20,
    marginHorizontal: 5,
    borderRadius: 12,
    width: 250,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  latestWishText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    lineHeight: 20,
    marginTop: 10,
  },
  quoteIcon: {
    position: 'absolute',
    top: 10,
    left: 10,
    opacity: 0.2,
  }
});

export default HomeScreen;
