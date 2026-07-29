import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Animated, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import { useTranslation } from 'react-i18next';
import GphApiClient from 'giphy-js-sdk-core';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { toggleFavouriteGif, isFavouriteGif } from '../store/storage';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { mapGiphyGifResults } from '../utils/giphy';

const GIPHY_API_KEY = '0olOpHALjZ7mCBDdwPXF7wkva0SH6Fmt';
const giphyClient = GphApiClient(GIPHY_API_KEY);

const GifsScreen = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('birthday');
  const [gifs, setGifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [favs, setFavs] = useState<Record<string, boolean>>({});
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedGif, setSelectedGif] = useState<any | null>(null);
  const spinValue = useRef(new Animated.Value(0)).current;

  const startSpin = () => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      })
    ).start();
  };

  useEffect(() => {
    startSpin();
  }, [spinValue]);

  const fetchGifs = async (query = searchQuery, nextOffset = 0, append = false) => {
    if (!query.trim()) {
      return;
    }

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setOffset(0);
      setHasMore(true);
    }
    setError(null);

    try {
      const response = await giphyClient.search('gifs', { q: query, limit: 20, offset: nextOffset, rating: 'g' });
      const fetched = mapGiphyGifResults(response?.data || []);
      const nextItems = append ? [...gifs, ...fetched] : fetched;
      setGifs(nextItems);
      setHasMore(fetched.length === 20);
      setOffset(nextOffset + fetched.length);

      const newFavs: Record<string, boolean> = {};
      for (const gif of fetched) {
        newFavs[gif.id] = await isFavouriteGif(gif.id);
      }
      setFavs((prev) => ({ ...prev, ...newFavs }));

      // Pre-cache GIFs in background for instant sharing
      precacheGifs(fetched);
    } catch (err) {
      setError('Unable to load GIFs right now. Please try again.');
      if (!append) {
        setGifs([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Background pre-cache: download share GIFs silently so share is instant
  const precacheGifs = async (gifList: any[]) => {
    for (const gif of gifList) {
      try {
        const fileName = `${gif.id || 'gif'}.gif`;
        const localPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
        const exists = await RNFS.exists(localPath);
        if (!exists) {
          RNFS.downloadFile({
            fromUrl: gif.shareUrl || gif.url,
            toFile: localPath,
          });
          // Fire-and-forget, no await — downloads happen in background
        }
      } catch (_) {
        // Silently ignore pre-cache errors
      }
    }
  };

  useEffect(() => {
    fetchGifs();
  }, []);

  const handleShare = async (gif: any) => {
    setSharingId(gif.id);
    try {
      const fileName = `${gif.id || 'gif'}.gif`;
      const localPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

      // Check if already pre-cached
      const fileExists = await RNFS.exists(localPath);
      if (!fileExists) {
        const downloadResult = await RNFS.downloadFile({
          fromUrl: gif.shareUrl || gif.url,
          toFile: localPath,
        }).promise;

        if (downloadResult.statusCode !== 200) {
          throw new Error('Download failed');
        }
      }

      await Share.open({
        title: gif.title || 'Birthday GIF',
        type: 'image/gif',
        url: `file://${localPath}`,
        failOnCancel: false,
      });
    } catch (err) {
      console.log('Share cancelled', err);
    } finally {
      setSharingId(null);
    }
  };

  const renderGifItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.gifCard} onPress={() => setSelectedGif(item)} activeOpacity={0.9}>
      <FastImage 
        style={styles.gifPlaceholder} 
        source={{ uri: item.url, priority: FastImage.priority.normal }} 
        resizeMode={FastImage.resizeMode.cover} 
      />
      <View style={styles.gifActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleShare(item)} disabled={sharingId === item.id}>
          {sharingId === item.id ? (
            <ActivityIndicator size="small" color={colors.primaryDark} />
          ) : (
            <Icon name="share-social-outline" size={24} color={colors.primaryDark} />
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={async () => {
            const isFav = await toggleFavouriteGif(item);
            setFavs({...favs, [item.id]: isFav});
          }}
        >
          <Icon name={favs[item.id] ? "heart" : "heart-outline"} size={24} color={colors.favourite} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Birthday GIFs</Text>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search GIFs..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => fetchGifs(searchQuery, 0, false)}
        />
      </View>

      {loading ? (
        <View style={styles.loadingState}>
          <Animated.View
            style={{
              transform: [{ rotate: spinValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
            }}
          >
            <Icon name="refresh-outline" size={30} color={colors.primaryDark} />
          </Animated.View>
          <Text style={styles.loadingText}>Loading GIFs...</Text>
        </View>
      ) : error ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{error}</Text>
        </View>
      ) : gifs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No GIFs found.</Text>
        </View>
      ) : (
        <FlatList
          data={gifs}
          keyExtractor={(item) => item.id}
          renderItem={renderGifItem}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          onEndReached={() => {
            if (!loadingMore && hasMore) {
              fetchGifs(searchQuery, offset, true);
            }
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.primaryDark} />
                <Text style={styles.footerText}>Loading more GIFs...</Text>
              </View>
            ) : null
          }
        />
      )}

      <Modal visible={!!selectedGif} transparent animationType="fade" onRequestClose={() => setSelectedGif(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedGif?.title || 'GIF Preview'}</Text>
              <TouchableOpacity onPress={() => setSelectedGif(null)}>
                <Icon name="close" size={24} color={colors.primaryDark} />
              </TouchableOpacity>
            </View>

            {selectedGif?.url ? (
              <FastImage
                style={styles.modalImage}
                source={{ uri: selectedGif.url, priority: FastImage.priority.high }}
                resizeMode={FastImage.resizeMode.contain}
              />
            ) : null}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButton} onPress={() => handleShare(selectedGif)} disabled={sharingId === selectedGif?.id}>
                {sharingId === selectedGif?.id ? (
                  <ActivityIndicator size="small" color={colors.primaryDark} />
                ) : (
                  <Icon name="share-social-outline" size={20} color={colors.primaryDark} />
                )}
                <Text style={styles.modalButtonText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={async () => {
                  const isFav = await toggleFavouriteGif(selectedGif);
                  setFavs({ ...favs, [selectedGif.id]: isFav });
                }}
              >
                <Icon name={favs[selectedGif?.id] ? 'heart' : 'heart-outline'} size={20} color={colors.favourite} />
                <Text style={styles.modalButtonText}>Fav</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  listContainer: {
    padding: 10,
  },
  gifCard: {
    flex: 1,
    margin: 5,
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  gifPlaceholder: {
    height: 150,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gifActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    padding: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: typography.sizes.md,
    color: colors.textLight,
    textAlign: 'center',
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: typography.sizes.md,
    color: colors.textLight,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    marginTop: 8,
    fontSize: typography.sizes.sm,
    color: colors.textLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
    flex: 1,
    marginRight: 8,
  },
  modalImage: {
    width: '100%',
    height: 320,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.background,
  },
  modalButtonText: {
    marginLeft: 6,
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  }
});

export default GifsScreen;
