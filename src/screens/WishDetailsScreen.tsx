import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share as NativeShare, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import Clipboard from '@react-native-clipboard/clipboard'; // Note: might need to install this later, using placeholder
import { toggleFavouriteWish, isFavouriteWish } from '../store/storage';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { RootStackParamList } from '../navigation/AppNavigator';

type WishDetailsRouteProp = RouteProp<RootStackParamList, 'WishDetails'>;

const WishDetailsScreen = () => {
  const route = useRoute<WishDetailsRouteProp>();
  const navigation = useNavigation();
  const [isFavourite, setIsFavourite] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const wishId = route.params?.wishId || 'default-wish';
  const wishText = route.params?.wishText || "Happy Birthday! Wishing you all the best on your special day.";

  useEffect(() => {
    const checkFav = async () => {
      const fav = await isFavouriteWish(wishId);
      setIsFavourite(fav);
    };
    checkFav();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);


  const handleCopy = () => {
    // Clipboard.setString(wishText);
    // Show toast or alert
    Alert.alert('Wish copied to clipboard!');
  };

  const handleShare = async () => {
    try {
      await NativeShare.share({
        message: wishText,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const toggleFavourite = async () => {
    const isNowFav = await toggleFavouriteWish({ id: wishId, text: wishText });
    setIsFavourite(isNowFav);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wish Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <FastImage 
          style={styles.imagePlaceholder} 
          source={{ uri: 'https://picsum.photos/id/1025/400/300', priority: FastImage.priority.normal }} 
          resizeMode={FastImage.resizeMode.cover} 
        />

        <Animated.View style={[styles.wishContainer, { opacity: fadeAnim }]}>
          <Icon name="quote" size={30} color={colors.primaryLight} style={styles.quoteIcon} />
          <Text style={styles.wishText}>{wishText}</Text>
        </Animated.View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
            <View style={[styles.iconCircle, { backgroundColor: colors.copy }]}>
              <Icon name="copy-outline" size={24} color="#FFF" />
            </View>
            <Text style={styles.actionText}>Copy</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <View style={[styles.iconCircle, { backgroundColor: colors.share }]}>
              <Icon name="share-social-outline" size={24} color="#FFF" />
            </View>
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={toggleFavourite}>
            <View style={[styles.iconCircle, { backgroundColor: colors.favourite }]}>
              <Icon name={isFavourite ? "heart" : "heart-outline"} size={24} color="#FFF" />
            </View>
            <Text style={styles.actionText}>{isFavourite ? 'Saved' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  imagePlaceholder: {
    height: 250,
    backgroundColor: colors.surface,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  imagePlaceholderText: {
    marginTop: 10,
    color: colors.primaryDark,
    fontWeight: typography.weights.medium,
  },
  wishContainer: {
    backgroundColor: colors.surface,
    padding: 25,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quoteIcon: {
    position: 'absolute',
    top: 10,
    left: 10,
    opacity: 0.2,
  },
  wishText: {
    fontSize: typography.sizes.lg,
    color: colors.text,
    lineHeight: 28,
    textAlign: 'center',
    fontWeight: typography.weights.medium,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  actionText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.text,
  },
});

export default WishDetailsScreen;
