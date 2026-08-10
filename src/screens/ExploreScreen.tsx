import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';

const TOOLS = [
  { id: '1', name: 'Gemini', url: 'https://gemini.google.com/', description: 'Google\'s multimodal AI model', icon: 'google', color: '#4285F4', appUrl: 'googleapp://' },
  { id: '8', name: 'ChatGPT', url: 'https://chat.openai.com/', description: 'OpenAI DALL-E 3 image generation', icon: 'robot-outline', color: '#10A37F', appUrl: 'chatgpt://' },
  { id: '2', name: 'Canva', url: 'https://www.canva.com/ai-image-generator/', description: 'Easy graphic design & AI image creation', icon: 'palette', color: '#7D2AE8', appUrl: 'canva://' },
  { id: '3', name: 'Bing Image Creator', url: 'https://www.bing.com/create', description: 'Powered by DALL-E 3 from Microsoft', icon: 'microsoft-bing', color: '#008373', appUrl: 'bing://' },
  { id: '4', name: 'Leonardo AI', url: 'https://leonardo.ai/', description: 'Production-quality artistic assets', icon: 'brush', color: '#FF7043', appUrl: 'leonardoai://' },
  { id: '5', name: 'Ideogram', url: 'https://ideogram.ai/', description: 'Best for typography inside images', icon: 'format-text', color: '#263238', appUrl: 'ideogram://' },
  { id: '6', name: 'Playground', url: 'https://playground.com/', description: 'Free AI image generator with canvas', icon: 'controller-classic', color: '#EC407A', appUrl: 'playground://' },
  { id: '7', name: 'Adobe Firefly', url: 'https://firefly.adobe.com/', description: 'Commercially safe — built into Creative Cloud', icon: 'fire', color: '#E53935', appUrl: 'adobe://' },

];

export const ExploreScreen = () => {
  const insets = useSafeAreaInsets();

  const handleOpenTool = async (item: typeof TOOLS[0]) => {
    if (item.appUrl) {
      try {
        await Linking.openURL(item.appUrl);
      } catch (error: any) {
        const errMsg = String(error?.message || '');
        const isActivityNotFound =
          errMsg.toLowerCase().includes('no activity found') ||
          errMsg.toLowerCase().includes('activitynotfound') ||
          Platform.OS === 'ios';

        if (isActivityNotFound) {
          try {
            await Linking.openURL(item.url);
          } catch (webError) {
            console.log('Unable to open web fallback:', webError);
          }
        } else {
          console.log('App likely opened, ignoring fallback error:', error);
        }
      }
    } else {
      try {
        await Linking.openURL(item.url);
      } catch (e) {
        console.log('Error opening URL:', e);
      }
    }
  };

  const renderItem = ({ item }: { item: typeof TOOLS[0] }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={() => handleOpenTool(item)}
    >
      <View style={[styles.iconWrap, { backgroundColor: item.color + '15' }]}>
        <Icon name={item.icon} size={24} color={item.color} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
      </View>
      <View style={[styles.arrowWrap, { backgroundColor: item.color + '12' }]}>
        <Icon name="arrow-right" size={18} color={item.color} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚀 AI Tools</Text>
        <Text style={styles.headerSub}>Tap to launch your preferred engine</Text>
      </View>

      <FlatList
        data={TOOLS}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 2,
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sep: {
    height: 10,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121222',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1F1F35',
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardInfo: {
    flex: 1,
    paddingRight: 8,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  cardDesc: {
    fontSize: 12,
    color: colors.textLight,
    lineHeight: 17,
  },
  arrowWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
