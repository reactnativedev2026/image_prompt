import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Share,
  Dimensions,
  ToastAndroid,
  Platform,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '../store/AppContext';
import { PromptItem } from '../data/mockPrompts';
import { Linking } from 'react-native';

const { width, height } = Dimensions.get('window');
const IMAGE_HEIGHT = height * 0.55;

const TOOL_URLS: Record<string, string> = {
  'Gemini': 'https://gemini.google.com/',
  'Canva': 'https://www.canva.com/ai-image-generator/',
  'Bing Image Creator': 'https://www.bing.com/create',
  'Leonardo AI': 'https://leonardo.ai/',
  'Ideogram': 'https://ideogram.ai/',
  'Playground': 'https://playground.com/',
  'Adobe Firefly': 'https://firefly.adobe.com/',
  'ChatGPT': 'https://chat.openai.com/',
};

const CATEGORY_META: Record<string, { color: string; icon: string; bg: string }> = {
  Cyberpunk: { color: '#8B5CF6', icon: 'robot-outline', bg: '#F5F3FF' },
  'Sci-Fi': { color: '#0EA5E9', icon: 'rocket-launch-outline', bg: '#F0F9FF' },
  Fantasy: { color: '#10B981', icon: 'creation-outline', bg: '#ECFDF5' },
  Minimalist: { color: '#F59E0B', icon: 'triangle-outline', bg: '#FFFBEB' },
  Steampunk: { color: '#D97706', icon: 'cog-outline', bg: '#FEF3C7' },
  Portrait: { color: '#EC4899', icon: 'account-outline', bg: '#FDF2F8' },
};

const showCopiedToast = () => {
  if (Platform.OS === 'android') {
    ToastAndroid.show('✨ Copied to clipboard!', ToastAndroid.SHORT);
  } else {
    Alert.alert('Copied!', 'Prompt copied to clipboard.');
  }
};

export const PromptDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { item } = route.params as { item: PromptItem };
  const { defaultTool, isFavorite, toggleFavorite } = useAppContext();
  const insets = useSafeAreaInsets();

  const meta = CATEGORY_META[item.category] || { color: '#FF69B4', icon: 'tag-outline', bg: '#FFF0F5' };

  const handleCopy = () => {
    Clipboard.setString(item.promptText);
    showCopiedToast();
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: `✨ AI Prompt:\n\n${item.promptText}` });
    } catch (e: any) {
      console.error(e.message);
    }
  };

  const handleOpenTool = () => {
    handleCopy();
    const url = TOOL_URLS[defaultTool] || TOOL_URLS['Gemini'];
    Linking.openURL(url);
  };

  const favored = isFavorite(item.id);

  return (
    <View style={styles.root}>
      {/* ══════════ GLOW GRADIENT IN BACKGROUND ══════════ */}
      <View style={[styles.bgGlow, { backgroundColor: meta.color + '12' }]} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 32) }}
      >
        {/* ══════════ HERO CANVAS ══════════ */}
        <View style={styles.heroContainer}>
          {/* Blurred Background Image for the sides */}
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.heroImageBlurBackground}
            blurRadius={Platform.OS === 'ios' ? 12 : 8}
          />

          {/* Clear Contain Image in Foreground (9:16 full image) */}
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.heroImageForeground}
          />

          {/* Floating Actions on Image */}
          <TouchableOpacity
            style={[styles.glassBtn, { top: insets.top + 16, left: 16 }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.glassBtn, { top: insets.top + 16, right: 16 }, favored && styles.glassBtnFaved]}
            onPress={() => toggleFavorite(item)}
            activeOpacity={0.8}
          >
            <Icon
              name={favored ? 'heart' : 'heart-outline'}
              size={22}
              color={favored ? '#FF4D6D' : '#FFF'}
            />
          </TouchableOpacity>

          {/* Neo-morphic Category Badge */}
          <View style={[styles.neoBadge, { backgroundColor: meta.bg }]}>
            <Icon name={meta.icon} size={15} color={meta.color} />
            <Text style={[styles.neoBadgeText, { color: meta.color }]}>{item.category}</Text>
          </View>
        </View>

        {/* ══════════ GLASS CARD CONTENT ══════════ */}
        <View style={styles.contentContainer}>
          {/* Card Label and Title */}
          <View style={styles.titleRow}>
            <Text style={styles.sectionLabel}>PROMPT ENGINE</Text>
            <Text style={styles.titleText}>Prompt Masterpiece</Text>
          </View>

          {/* Elegant Prompt Box with a left border accent */}
          <View style={[styles.promptBox, { borderLeftColor: meta.color }]}>
            <View style={styles.promptHeader}>
              <Icon name="format-quote-close" size={26} color={meta.color + '40'} />
              <View style={styles.actionGroup}>
                <TouchableOpacity
                  style={[styles.circleActionBtn, { backgroundColor: meta.color + '15' }]}
                  onPress={handleCopy}
                  activeOpacity={0.7}
                >
                  <Icon name="content-copy" size={16} color={meta.color} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.circleActionBtn}
                  onPress={handleShare}
                  activeOpacity={0.7}
                >
                  <Icon name="share-variant-outline" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.promptText}>{item.promptText}</Text>
          </View>

          {/* Interactive Tool Launcher */}
          <View style={styles.launcherSection}>
            <View style={styles.launcherTextWrap}>
              <Text style={styles.launcherTitle}>Generate Now</Text>
              <Text style={styles.launcherSub}>Copies & launches your active engine</Text>
            </View>

            <TouchableOpacity
              style={[styles.launchBtn, { backgroundColor: meta.color, shadowColor: meta.color }]}
              onPress={handleOpenTool}
              activeOpacity={0.9}
            >
              <Text style={styles.launchBtnText}>Launch {defaultTool}</Text>
              <Icon name="arrow-right-circle" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAF9FF' },

  // Ambient glow
  bgGlow: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    transform: [{ scale: 1.5 }],
  },

  // Hero Container
  heroContainer: {
    width: width,
    height: IMAGE_HEIGHT,
    position: 'relative',
    backgroundColor: '#1E1B4B',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
    shadowColor: '#1E1B4B',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  heroImageBlurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.65,
  },
  heroImageForeground: {
    alignSelf: 'center',
    width: (IMAGE_HEIGHT * 9) / 16, // perfect 9:16 width based on height
    height: '100%',
    resizeMode: 'cover',
    // zIndex: 2,
  },
  glassBtn: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  glassBtnFaved: {
    backgroundColor: '#FF4D6D',
    borderColor: '#FF758F',
  },
  neoBadge: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  neoBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginLeft: 6,
    textTransform: 'uppercase',
  },

  // Content
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  titleRow: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8E9AA6',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },

  // Prompt Box
  promptBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ECECF3',
    borderLeftWidth: 5,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.03,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    marginBottom: 20,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  circleActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 24,
    fontWeight: '500',
  },

  // Launcher Panel
  launcherSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ECECF3',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  launcherTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  launcherTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  launcherSub: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  launchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 8,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  launchBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
