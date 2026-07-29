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

import WISHES_DATA from '../data';

const iconMap: Record<string, string> = {
  friend: 'people-outline',
  mother: 'woman-outline',
  father: 'man-outline',
  sister: 'rose-outline',
  brother: 'football-outline',
  funnyWishes: 'happy-outline',
  romanticWishes: 'heart-outline',
  inspirationalWishes: 'star-outline',
  boyfriend: 'male-outline',
  girlfriend: 'female-outline',
  bestFriend: 'medal-outline',
  husband: 'briefcase-outline',
  wife: 'diamond-outline',
  son: 'game-controller-outline',
  daughter: 'flower-outline'
};

const POPULAR_CATEGORIES = Object.keys(WISHES_DATA).slice(0, 5);

const LATEST_WISHES = Object.entries(WISHES_DATA)
  .flatMap(([cat, wishes]) => (wishes as any[]).map(w => ({ ...w, category: cat })))
  .slice(0, 3);

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const HomeScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const renderCategoryItem = ({ item, index }: { item: string, index: number }) => {
    const bgColors = ['#ffebee', '#e8f5e9', '#e3f2fd', '#fff3e0', '#f3e5f5'];
    const bgColor = bgColors[index % bgColors.length];

    return (
      <TouchableOpacity
        style={[styles.categoryCard, { backgroundColor: bgColor }]}
        onPress={() => navigation.navigate('WishList', { category: item })}
      >
        <Icon name={iconMap[item] || "gift-outline"} size={28} color={colors.primaryDark} />
        <Text style={styles.categoryText}>{t(`categories.${item}`)}</Text>
      </TouchableOpacity>
    );
  };

  const renderWishItem = ({ item, index }: { item: any, index: number }) => {
    const bgColors = ['#64b5f6', '#ffb74d', '#81c784'];
    const bgColor = bgColors[index % bgColors.length];
    return (
      <View style={[styles.latestWishCard, { backgroundColor: bgColor }]}>
        <Icon name="quote" size={50} color="rgba(255,255,255,0.2)" style={styles.quoteIcon} />
        <Text style={styles.latestWishText} numberOfLines={3}>{item.text}</Text>
        <Text style={styles.latestWishCategory}>{t(`categories.${item.category}`)}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Birthday Wishes</Text>
        <Text style={styles.headerSubtitle}>Find the perfect message</Text>
      </View>

      <Animated.ScrollView style={[styles.content, { opacity: fadeAnim }]} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <TouchableOpacity 
          style={styles.searchContainer}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('WishList', { focusSearch: true })}
        >
          <Icon name="search" size={20} color={colors.textLight} style={styles.searchIcon} />
          <Text style={[styles.searchInput, { textAlignVertical: 'center', color: colors.textLight }]}>
            {t('common.search') + "..."}
          </Text>
        </TouchableOpacity>

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
            style={[styles.bannerCard, { backgroundColor: '#e3f2fd' }]}
            onPress={() => navigation.navigate('Gifs')}
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>Explore GIFs</Text>
              <Text style={styles.bannerSubtitle}>Animated birthday wishes</Text>
            </View>
            <Icon name="videocam-outline" size={70} color="#90caf9" style={styles.bannerIcon} />
          </TouchableOpacity>
        </View>

        {/* Birthday Images Placeholder */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('home.birthdayImages')}</Text>
          <TouchableOpacity
            style={[styles.bannerCard, { backgroundColor: '#fce4ec' }]}
            onPress={() => navigation.navigate('Images')}
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>Beautiful Images</Text>
              <Text style={styles.bannerSubtitle}>Perfect for sharing</Text>
            </View>
            <Icon name="image-outline" size={70} color="#f48fb1" style={styles.bannerIcon} />
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
    paddingTop: 15,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  headerSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.textLight,
    marginTop: 5,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 25,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
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
    padding: 15,
    marginHorizontal: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: 105,
    height: 105,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  categoryText: {
    marginTop: 10,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
    textAlign: 'center',
  },
  bannerCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  bannerContent: {
    flex: 1,
    zIndex: 1,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: typography.weights.bold,
    color: '#333',
    marginBottom: 5,
  },
  bannerSubtitle: {
    fontSize: typography.sizes.sm,
    color: '#666',
  },
  bannerIcon: {
    position: 'absolute',
    right: 5,
    bottom: -15,
    opacity: 0.4,
    transform: [{ rotate: '-15deg' }]
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
    padding: 20,
    marginHorizontal: 8,
    borderRadius: 16,
    width: 280,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  latestWishText: {
    fontSize: 16,
    fontWeight: typography.weights.medium,
    color: '#fff',
    lineHeight: 24,
    marginTop: 15,
    zIndex: 1,
  },
  latestWishCategory: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 15,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    zIndex: 1,
  },
  quoteIcon: {
    position: 'absolute',
    top: 5,
    right: 15,
  }
});

export default HomeScreen;
