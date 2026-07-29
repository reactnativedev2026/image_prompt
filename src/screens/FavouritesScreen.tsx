import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import { getFavouriteWishes, getFavouriteGifs, getFavouriteImages, toggleFavouriteWish, toggleFavouriteGif, toggleFavouriteImage } from '../store/storage';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const FavouritesScreen = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'wishes' | 'gifs' | 'images'>('wishes');
  const [favWishes, setFavWishes] = useState<any[]>([]);
  const [favGifs, setFavGifs] = useState<any[]>([]);
  const [favImages, setFavImages] = useState<any[]>([]);

  useEffect(() => {
    const loadFavs = async () => {
      setFavWishes(await getFavouriteWishes());
      setFavGifs(await getFavouriteGifs());
      setFavImages(await getFavouriteImages());
    };
    loadFavs();
  }, [activeTab]); // reload when switching tabs

  const removeWish = async (item: any) => {
    await toggleFavouriteWish(item);
    setFavWishes(prev => prev.filter(w => w.id !== item.id));
  };

  const removeGif = async (item: any) => {
    await toggleFavouriteGif(item);
    setFavGifs(prev => prev.filter(g => g.id !== item.id));
  };

  const removeImage = async (item: any) => {
    await toggleFavouriteImage(item);
    setFavImages(prev => prev.filter(i => i.id !== item.id));
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Icon name="heart-dislike-outline" size={60} color={colors.textLight} />
      <Text style={styles.emptyStateText}>
        No favourite {activeTab} yet.
      </Text>
      <Text style={styles.emptyStateSubtext}>
        Save your favourite items here to view them offline later.
      </Text>
    </View>
  );

  const renderWish = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.wishText}>{item.text}</Text>
      <TouchableOpacity onPress={() => removeWish(item)} style={styles.removeButton}>
        <Icon name="heart-dislike" size={24} color={colors.favourite} />
      </TouchableOpacity>
    </View>
  );

  const renderGif = ({ item }: { item: any }) => (
    <View style={styles.mediaCard}>
      <FastImage source={{ uri: item.url }} style={styles.mediaImage} resizeMode={FastImage.resizeMode.cover} />
      <TouchableOpacity onPress={() => removeGif(item)} style={styles.removeMediaButton}>
        <Icon name="heart-dislike-circle" size={28} color={colors.favourite} />
      </TouchableOpacity>
    </View>
  );

  const renderImage = ({ item }: { item: any }) => (
    <View style={styles.mediaCard}>
      <FastImage source={{ uri: item.url }} style={styles.mediaImage} resizeMode={FastImage.resizeMode.cover} />
      <TouchableOpacity onPress={() => removeImage(item)} style={styles.removeMediaButton}>
        <Icon name="heart-dislike-circle" size={28} color={colors.favourite} />
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (activeTab === 'wishes') {
      return favWishes.length > 0 ? (
        <FlatList key="wishes-list" data={favWishes} keyExtractor={i => i.id} renderItem={renderWish} contentContainerStyle={styles.list} />
      ) : renderEmptyState();
    } else if (activeTab === 'gifs') {
      return favGifs.length > 0 ? (
        <FlatList key="gifs-list" data={favGifs} keyExtractor={i => i.id} renderItem={renderGif} numColumns={2} contentContainerStyle={styles.list} />
      ) : renderEmptyState();
    } else {
      return favImages.length > 0 ? (
        <FlatList key="images-list" data={favImages} keyExtractor={i => i.id} renderItem={renderImage} numColumns={2} contentContainerStyle={styles.list} />
      ) : renderEmptyState();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('common.favourite')}</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'wishes' && styles.activeTab]}
          onPress={() => setActiveTab('wishes')}
        >
          <Text style={[styles.tabText, activeTab === 'wishes' && styles.activeTabText]}>Wishes</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'gifs' && styles.activeTab]}
          onPress={() => setActiveTab('gifs')}
        >
          <Text style={[styles.tabText, activeTab === 'gifs' && styles.activeTabText]}>GIFs</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'images' && styles.activeTab]}
          onPress={() => setActiveTab('images')}
        >
          <Text style={[styles.tabText, activeTab === 'images' && styles.activeTabText]}>Images</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.primaryLight,
  },
  tabText: {
    fontSize: typography.sizes.md,
    color: colors.textLight,
    fontWeight: typography.weights.medium,
  },
  activeTabText: {
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  contentContainer: {
    flex: 1,
  },
  list: {
    padding: 10,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 15,
    margin: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  wishText: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  mediaCard: {
    flex: 1,
    margin: 5,
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyStateText: {
    marginTop: 20,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semiBold,
    color: colors.text,
  },
  emptyStateSubtext: {
    marginTop: 10,
    fontSize: typography.sizes.sm,
    color: colors.textLight,
    textAlign: 'center',
  },
  removeButton: {
    position: 'absolute',
    bottom: 10,
    right: 15,
    padding: 5,
  },
  removeMediaButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    padding: 2,
  }
});

export default FavouritesScreen;
