import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import { useTranslation } from 'react-i18next';
import { toggleFavouriteGif, isFavouriteGif } from '../store/storage';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const TENOR_API_KEY = 'YOUR_TENOR_API_KEY'; // Placeholder

const GifsScreen = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('birthday');
  const [gifs, setGifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [favs, setFavs] = useState<Record<string, boolean>>({});

  // Mock fetching for now until API key is provided
  const fetchGifs = async () => {
    setLoading(true);
    setTimeout(async () => {
      // Realistic GIF URLs
      const fetched = [
        { id: '1', url: 'https://media.giphy.com/media/g5R9dok94mrIvplmZd/giphy.gif', title: 'Happy Birthday 1' },
        { id: '2', url: 'https://media.giphy.com/media/LzwcNOrbA3aYvJZk2n/giphy.gif', title: 'Happy Birthday 2' },
        { id: '3', url: 'https://media.giphy.com/media/kdQuvu0LtCEjxYgTcS/giphy.gif', title: 'Happy Birthday 3' },
        { id: '4', url: 'https://media.giphy.com/media/xUySTP8mX09yU85u5W/giphy.gif', title: 'Happy Birthday 4' },
      ];
      setGifs(fetched);
      
      const newFavs: Record<string, boolean> = {};
      for (const g of fetched) {
        newFavs[g.id] = await isFavouriteGif(g.id);
      }
      setFavs(newFavs);
      
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchGifs();
  }, []);

  const renderGifItem = ({ item }: { item: any }) => (
    <View style={styles.gifCard}>
      <FastImage 
        style={styles.gifPlaceholder} 
        source={{ uri: item.url, priority: FastImage.priority.normal }} 
        resizeMode={FastImage.resizeMode.cover} 
      />
      <View style={styles.gifActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="share-social-outline" size={24} color={colors.primaryDark} />
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
    </View>
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
          onSubmitEditing={fetchGifs}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primaryDark} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={gifs}
          keyExtractor={(item) => item.id}
          renderItem={renderGifItem}
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
  }
});

export default GifsScreen;
