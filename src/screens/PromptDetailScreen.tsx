import React, { useState } from 'react';
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
const IMAGE_HEIGHT = height * 0.48;

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

const CATEGORY_META: Record<string, { color: string; icon: string }> = {
  Cyberpunk:  { color: '#7C3AED', icon: 'city-variant-outline' },
  'Sci-Fi':   { color: '#0284C7', icon: 'rocket-launch-outline' },
  Fantasy:    { color: '#059669', icon: 'magic-staff' },
  Minimalist: { color: '#D97706', icon: 'minus-circle-outline' },
  Steampunk:  { color: '#B45309', icon: 'cog-outline' },
  Portrait:   { color: '#DB2777', icon: 'account-circle-outline' },
};

const showCopiedToast = () => {
  if (Platform.OS === 'android') {
    ToastAndroid.show('Prompt copied!', ToastAndroid.SHORT);
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

  const meta = CATEGORY_META[item.category] || { color: '#FF69B4', icon: 'image-outline' };

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 32) }}
      >
        {/* ══════════ HERO IMAGE ══════════ */}
        <View style={styles.heroBox}>
          <Image source={{ uri: item.imageUrl }} style={styles.heroImage} />

          {/* Dark scrim at bottom for blending */}
          <View style={styles.scrim} />

          {/* Back button */}
          <TouchableOpacity
            style={[styles.floatBtn, { top: insets.top + 12, left: 16 }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Icon name="arrow-left" size={22} color="#FFF" />
          </TouchableOpacity>

          {/* Fav button */}
          <TouchableOpacity
            style={[
              styles.floatBtn,
              { top: insets.top + 12, right: 16 },
              favored && styles.floatBtnFaved,
            ]}
            onPress={() => toggleFavorite(item)}
            activeOpacity={0.8}
          >
            <Icon
              name={favored ? 'heart' : 'heart-outline'}
              size={22}
              color={favored ? '#FF4D6D' : '#FFF'}
            />
          </TouchableOpacity>

          {/* Category chip on the image */}
          <View style={[styles.heroCategoryChip, { backgroundColor: meta.color }]}>
            <Icon name={meta.icon} size={13} color="#FFF" />
            <Text style={styles.heroCategoryText}>{item.category}</Text>
          </View>
        </View>

        {/* ══════════ CONTENT CARD ══════════ */}
        <View style={styles.card}>

          {/* ── Top handle bar ── */}
          <View style={styles.handleBar} />

          {/* ── Copy & Share row — directly above prompt ── */}
          <View style={styles.actionHeader}>
            <Text style={styles.promptLabel}>📝  AI Prompt</Text>
            <View style={styles.actionPill}>
              <TouchableOpacity style={styles.pillBtn} onPress={handleCopy} activeOpacity={0.75}>
                <Icon name="content-copy" size={15} color={meta.color} />
                <Text style={[styles.pillBtnText, { color: meta.color }]}>Copy</Text>
              </TouchableOpacity>
              <View style={styles.pillSep} />
              <TouchableOpacity style={styles.pillBtn} onPress={handleShare} activeOpacity={0.75}>
                <Icon name="share-variant-outline" size={15} color="#0284C7" />
                <Text style={[styles.pillBtnText, { color: '#0284C7' }]}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Prompt text ── */}
          <View style={[styles.promptBox, { borderColor: meta.color + '30' }]}>
            <Text style={styles.promptText}>{item.promptText}</Text>
          </View>

          {/* ── "Use with" heading ── */}
          <Text style={styles.useWithLabel}>Use this prompt with</Text>

          {/* ── Primary CTA ── */}
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: meta.color, shadowColor: meta.color }]}
            onPress={handleOpenTool}
            activeOpacity={0.87}
          >
            <Icon name="lightning-bolt" size={20} color="#FFF" />
            <Text style={styles.ctaText}>Open in {defaultTool}</Text>
            <View style={styles.ctaArrow}>
              <Icon name="arrow-right" size={16} color={meta.color} />
            </View>
          </TouchableOpacity>

          {/* ── Info note ── */}
          <View style={styles.noteRow}>
            <Icon name="information-outline" size={13} color="#CCC" />
            <Text style={styles.noteText}>
              Prompt auto-copies to clipboard when you tap the button above.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAFF' },

  // ── Hero ──────────────────────────────────────
  heroBox: {
    width: '100%',
    height: IMAGE_HEIGHT,
    backgroundColor: '#DDD',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  scrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    // Simple semi-transparent scrim
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  floatBtn: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.40)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  floatBtnFaved: {
    backgroundColor: 'rgba(255,77,109,0.25)',
    borderColor: '#FF4D6D',
  },
  heroCategoryChip: {
    position: 'absolute',
    bottom: 20,
    left: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
  },
  heroCategoryText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginLeft: 4,
  },

  // ── Card ──────────────────────────────────────
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -28,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginBottom: 20,
  },

  // ── Action header (above prompt) ──────────────
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  promptLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#EAE8F8',
  },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
    borderRadius: 9,
  },
  pillBtnText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 2,
  },
  pillSep: {
    width: 1,
    height: 18,
    backgroundColor: '#DDD8F8',
    marginHorizontal: 2,
  },

  // ── Prompt box ────────────────────────────────
  promptBox: {
    backgroundColor: '#FAFAFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1.5,
  },
  promptText: {
    fontSize: 15,
    color: '#2D2D3A',
    lineHeight: 24,
    fontWeight: '500',
  },

  // ── CTA ──────────────────────────────────────
  useWithLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#BBBBBB',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 17,
    paddingLeft: 22,
    paddingRight: 14,
    marginBottom: 16,
    shadowOpacity: 0.30,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 8,
    gap: 10,
  },
  ctaText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
  },
  ctaArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Note ─────────────────────────────────────
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  noteText: {
    flex: 1,
    fontSize: 11,
    color: '#CCCCCC',
    lineHeight: 17,
    marginLeft: 4,
  },
});
