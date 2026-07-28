import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import { useTranslation } from 'react-i18next';
import { toggleFavouriteImage, isFavouriteImage } from '../store/storage';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const ImagesScreen = () => {
  const { t } = useTranslation();
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [favs, setFavs] = useState<Record<string, boolean>>({});

  const fetchImages = async () => {
    setLoading(true);
    setTimeout(async () => {
      // Using picsum for realistic placeholder HD images
      const fetched = [
        { id: '1', url: 'https://picsum.photos/id/1018/400/400' },
        { id: '2', url: 'https://picsum.photos/id/1015/400/400' },
        { id: '3', url: 'https://picsum.photos/id/1019/400/400' },
        { id: '4', url: 'https://picsum.photos/id/1016/400/400' },
        { id: '5', url: 'https://picsum.photos/id/1020/400/400' },
        { id: '6', url: 'https://picsum.photos/id/1021/400/400' },
      ];
      setImages(fetched);

      const newFavs: Record<string, boolean> = {};
      for (const img of fetched) {
        newFavs[img.id] = await isFavouriteImage(img.id);
      }
      setFavs(newFavs);

      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const renderImageItem = ({ item }: { item: any }) => (
    <View style={styles.imageCard}>
      <FastImage 
        style={styles.imagePlaceholder} 
        source={{ uri: item.url, priority: FastImage.priority.normal }} 
        resizeMode={FastImage.resizeMode.cover} 
      />
      <View style={styles.imageActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="download-outline" size={24} color={colors.primaryDark} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="share-social-outline" size={24} color={colors.primaryDark} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={async () => {
            const isFav = await toggleFavouriteImage(item);
            setFavs({...favs, [item.id]: isFav});
          }}
        >
          <Icon name={favs[item.id] ? "heart" : "heart-outline"} size={24} color={colors.favourite} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('home.birthdayImages')}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primaryDark} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={images}
          keyExtractor={(item) => item.id}
          renderItem={renderImageItem}
          numColumns={2}
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
  listContainer: {
    padding: 10,
  },
  imageCard: {
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
  imagePlaceholder: {
    height: 180,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    padding: 5,
  }
});

export default ImagesScreen;
