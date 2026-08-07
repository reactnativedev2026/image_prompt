import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Share as RNShare,
  Dimensions,
  ToastAndroid,
  Platform,
  Alert,
  FlatList,
  Animated,
  Linking,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '../store/AppContext';
import { mockPrompts, PromptItem } from '../data/mockPrompts';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme/colors';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');

const getPromptDisplayMeta = (id: string, category: string) => {
  const metas: Record<string, { title: string; rating: string }> = {
    '1': { title: 'Cyberpunk City', rating: '4.8K' },
    '7': { title: 'Cozy Cabin', rating: '3.2K' },
    '8': { title: 'Astronaut', rating: '5.6K' },
    '2': { title: 'Fantasy Portrait', rating: '4.1K' },
    '9': { title: 'Night Drive', rating: '2.9K' },
    '10': { title: 'Floating Island Castle', rating: '3.7K' },
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

const showCopiedToast = () => {
  if (Platform.OS === 'android') {
    ToastAndroid.show('✨ Copied to clipboard!', ToastAndroid.SHORT);
  } else {
    Alert.alert('Copied!', 'Prompt copied to clipboard.');
  }
};

const ReelItem = ({ item, insets, navigation }: { item: PromptItem; insets: any; navigation: any }) => {
  const { isFavorite, toggleFavorite } = useAppContext();
  const meta = getPromptDisplayMeta(item.id, item.category);
  const favored = isFavorite(item.id);

  const handleCopy = () => {
    Clipboard.setString(item.promptText);
    showCopiedToast();
  };

  const handleCopyNegative = () => {
    Clipboard.setString("blurry, low quality, distorted, bad anatomy, deformed, extra limbs, text, watermark, logo, signature");
    showCopiedToast();
  };

  const handleShare = async () => {
    try {
      await RNShare.share({ message: `✨ AI Prompt:\n\n${item.promptText}` });
    } catch (e: any) {
      console.error(e.message);
    }
  };

  const handleGoToAI = () => {
    Clipboard.setString(item.promptText);
    if (Platform.OS === 'android') {
      ToastAndroid.show('📋 Prompt Copied!', ToastAndroid.SHORT);
    }
    Alert.alert(
      "Use AI Generator",
      "Select an AI tool to generate your image (prompt is copied to clipboard):",
      [
        {
          text: "Leonardo AI",
          onPress: () => Linking.openURL("https://leonardo.ai/")
        },
        {
          text: "Bing Creator (DALL-E 3)",
          onPress: () => Linking.openURL("https://www.bing.com/create")
        },
        {
          text: "ChatGPT (DALL-E 3)",
          onPress: () => Linking.openURL("https://chat.openai.com/")
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  // Adjust scrollable content height to accommodate header & footer panels
  const contentHeight = SCREEN_HEIGHT - insets.top - insets.bottom - 52 - 80;

  return (
    <View style={[styles.reelItemContainer, { height: SCREEN_HEIGHT }]}>
      {/* ── Custom Top Header Bar ── */}
      <View style={[styles.header, { marginTop: insets.top }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={32} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.headerRightActions}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => toggleFavorite(item)}>
            <Icon
              name={favored ? 'heart' : 'heart-outline'}
              size={24}
              color={favored ? '#A15DFB' : '#FFF'}
            />
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.headerBtn}>
            <Icon name="dots-vertical" size={24} color="#FFF" />
          </TouchableOpacity> */}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={{ height: contentHeight }}
      >
        {/* ── Main Hero Image Box ── */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imageUrl }} style={styles.heroImage} />
        </View>

        {/* ── Title ── */}
        <Text style={styles.titleText}>{meta.title}</Text>

        {/* ── Categories/Tags ── */}
        <View style={styles.tagsContainer}>
          <View style={styles.tagPill}><Text style={styles.tagText}>{item.category}</Text></View>
          <View style={styles.tagPill}><Text style={styles.tagText}>Digital Art</Text></View>
          <View style={styles.tagPill}><Text style={styles.tagText}>Ultra Realistic</Text></View>
          <View style={styles.tagPill}><Text style={styles.tagText}>8K</Text></View>
        </View>

        {/* ── Prompt Section ── */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderTitle}>
            <Icon name="creation" size={18} color="#A15DFB" />
            <Text style={styles.sectionLabel}>Prompt</Text>
          </View>
          <TouchableOpacity style={styles.copyBtnTextWrap} onPress={handleCopy}>
            <Icon name="content-copy" size={14} color="#A15DFB" />
            <Text style={styles.copyBtnText}>Copy</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.promptBox}>
          <Text style={styles.promptText}>{item.promptText}</Text>
        </View>

        <TouchableOpacity
          style={styles.geminiBtn}
          activeOpacity={0.85}
          onPress={() => {
            Clipboard.setString(item.promptText);
            if (Platform.OS === 'android') {
              ToastAndroid.show('📋 Prompt Copied!', ToastAndroid.SHORT);
            }
            Linking.openURL("https://gemini.google.com/");
          }}
        >
          <LinearGradient
            colors={['#1A73E8', '#8B5CF6', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.geminiBtnGradient}
          >
            <Icon name="creation" size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.geminiBtnText}>Use Gemini AI</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Bottom Action Panel ── */}
      <View style={[styles.bottomPanel, { paddingBottom: Math.max(insets.bottom + 8, 12) }]}>
        <TouchableOpacity style={styles.bottomSecBtn} onPress={handleShare}>
          <Icon name="share-variant" size={18} color="#A15DFB" style={{ marginRight: 6 }} />
          <Text style={styles.bottomSecBtnText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomMainBtnContainer} onPress={handleCopy}>
          <LinearGradient
            colors={colors.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bottomMainBtn}
          >
            <Icon name="content-copy" size={18} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.bottomMainBtnText}>Copy Prompt</Text>
          </LinearGradient>
        </TouchableOpacity>

      </View>
    </View>
  );
};

export const PromptDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { item } = route.params as { item: PromptItem };
  const insets = useSafeAreaInsets();

  const [showGuide, setShowGuide] = React.useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  const initialIndex = mockPrompts.findIndex(p => p.id === item.id);
  const safeInitialIndex = initialIndex !== -1 ? initialIndex : 0;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -15,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 3 }
      ).start(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setShowGuide(false);
        });
      });
    });
  }, []);

  return (
    <View style={styles.root}>
      <FlatList
        data={mockPrompts}
        keyExtractor={item => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        initialScrollIndex={safeInitialIndex}
        getItemLayout={(data, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        renderItem={({ item: reelItem }) => (
          <ReelItem
            item={reelItem}
            insets={insets}
            navigation={navigation}
          />
        )}
      />

      {showGuide && (
        <Animated.View style={[styles.guideOverlay, { opacity: fadeAnim, transform: [{ translateY: bounceAnim }] }]}>
          <Icon name="chevron-double-up" size={30} color="#A15DFB" />
          <Text style={styles.guideText}>Swipe Up for Next</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  reelItemContainer: {
    width: width,
    position: 'relative',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    height: 52,
    paddingRight: 15
  },
  headerBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },

  // Hero Image Container
  imageContainer: {
    width: '100%',
    height: 230,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#121222',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  // Title
  titleText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 14,
    marginBottom: 12,
  },

  // Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#121222',
    borderWidth: 1,
    borderColor: '#1F1F35',
  },
  tagText: {
    color: '#A15DFB',
    fontSize: 12,
    fontWeight: '700',
  },

  // Sections
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 8,
  },
  sectionHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  copyBtnTextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A15DFB',
  },
  promptBox: {
    backgroundColor: '#121222',
    borderColor: '#1F1F35',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  promptText: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
    fontWeight: '500',
  },

  // Bottom action bar
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderColor: '#1F1F35',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  bottomSecBtn: {
    flex: 1.1,
    flexDirection: 'row',
    height: 44,
    backgroundColor: '#121222',
    borderColor: '#1F1F35',
    borderWidth: 1,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSecBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bottomMainBtnContainer: {
    flex: 2,
    height: 44,
    borderRadius: 14,
    overflow: 'hidden',
  },
  bottomMainBtn: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomMainBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  guideOverlay: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(12, 12, 20, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#1F1F35',
    zIndex: 999,
  },
  guideText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  geminiBtn: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  geminiBtnGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  geminiBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
