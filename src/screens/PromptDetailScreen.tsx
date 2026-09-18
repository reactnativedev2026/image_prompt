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
  TextInput,
  TouchableWithoutFeedback,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '../store/AppContext';
import { mockPrompts, PromptItem } from '../data/mockPrompts';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme/colors';
import { logScreenView, logCopyPrompt, logSharePrompt, logToggleFavorite } from '../utils/analytics';
import { PLAY_STORE_URL } from '../constants';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AI_TOOLS = [
  { name: 'Gemini', url: 'https://gemini.google.com/', appUrl: 'googleapp://', color: '#4285F4', icon: 'google', gradientColors: ['#1A73E8', '#8B5CF6', '#EC4899'] },
  { name: 'ChatGPT', url: 'https://chat.openai.com/', appUrl: 'chatgpt://', color: '#10A37F', icon: 'robot-outline', gradientColors: ['#10A37F', '#1A7F64'] },
  { name: 'Canva', url: 'https://www.canva.com/ai-image-generator/', appUrl: 'canva://', color: '#7D2AE8', icon: 'palette', gradientColors: ['#7D2AE8', '#5E1FB3'] },
  { name: 'Bing Creator', url: 'https://www.bing.com/create', appUrl: 'bing://', color: '#008373', icon: 'microsoft-bing', gradientColors: ['#008373', '#005E52'] },
  { name: 'Leonardo AI', url: 'https://leonardo.ai/', appUrl: 'leonardoai://', color: '#FF7043', icon: 'brush', gradientColors: ['#FF7043', '#D84315'] },
  { name: 'Ideogram', url: 'https://ideogram.ai/', appUrl: 'ideogram://', color: '#263238', icon: 'format-text', gradientColors: ['#263238', '#1A237E'] },
  { name: 'Playground', url: 'https://playground.com/', appUrl: 'playground://', color: '#EC407A', icon: 'controller-classic', gradientColors: ['#EC407A', '#C2185B'] },
  { name: 'Adobe Firefly', url: 'https://firefly.adobe.com/', appUrl: 'adobe://', color: '#E53935', icon: 'fire', gradientColors: ['#E53935', '#B71C1C'] },
];

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

const ReelItem = ({
  item,
  insets,
  navigation,
  screenHeight,
  screenWidth,
}: {
  item: PromptItem;
  insets: any;
  navigation: any;
  screenHeight: number;
  screenWidth: number;
}) => {
  const { isFavorite, toggleFavorite } = useAppContext();
  const meta = getPromptDisplayMeta(item.id, item.category);
  const favored = isFavorite(item.id);
  const [promptModalVisible, setPromptModalVisible] = React.useState(false);
  const [guideModalVisible, setGuideModalVisible] = React.useState(false);
  const [guideLang, setGuideLang] = React.useState<'hi' | 'en'>('hi');

  const handleCopy = () => {
    Clipboard.setString(item.promptText);
    logCopyPrompt(item.id, meta.title);
    showCopiedToast();
  };

  const handleShare = async () => {
    try {
      logSharePrompt(item.id, meta.title);
      await RNShare.share({
        title: 'Share Prompt',
        message: `✨ Pro Prompt:\n\n${item.promptText}\n\n📲 Download Pro Prompt App for more:\n${PLAY_STORE_URL}`,
      });
    } catch (e: any) {
      console.error(e.message);
    }
  };

  const handleFavoritePress = () => {
    logToggleFavorite(item.id, meta.title, !favored);
    toggleFavorite(item);
  };

  return (
    <View style={[styles.reelItemContainer, { height: screenHeight, width: screenWidth }]}>
      {/* ── Custom Top Header Bar ── */}
      <View style={[styles.header, { marginTop: insets.top }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={32} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => setGuideModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.infoIconWrapper}>
              <Icon name="information-variant" size={20} color="#FFF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerBtn}
            onPress={handleFavoritePress}
            activeOpacity={0.7}
          >
            <Icon
              name={favored ? 'heart' : 'heart-outline'}
              size={24}
              color={favored ? '#A15DFB' : '#FFF'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 40 }
        ]}
        style={{ flex: 1 }}
      >
        {/* ── Main Hero Image Box ── */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imageUrl }} style={StyleSheet.absoluteFillObject} blurRadius={20} />
          <Image source={{ uri: item.imageUrl }} style={styles.heroImage} />
        </View>

        {/* ── Title ── */}
        {/* <Text style={styles.titleText}>{meta.title}</Text> */}

        {/* ── Prompt Section ── */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderTitle}>
            <Icon name="creation" size={18} color="#A15DFB" />
            <Text style={styles.sectionLabel}>Prompt</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 14 }}>
            <TouchableOpacity style={styles.copyBtnTextWrap} onPress={handleShare}>
              <Icon name="share-variant" size={14} color="#A15DFB" />
              <Text style={styles.copyBtnText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.copyBtnTextWrap} onPress={handleCopy}>
              <Icon name="content-copy" size={14} color="#A15DFB" />
              <Text style={styles.copyBtnText}>Copy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Prompt Box (Clickable for full screen) ── */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setPromptModalVisible(true)}
          style={styles.promptBox}
        >
          <ScrollView
            style={{ maxHeight: SCREEN_HEIGHT * 0.15 }}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
            pointerEvents="none"
          >
            <Text style={styles.promptText}>{item.promptText}</Text>
          </ScrollView>
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollBtnRow}
          style={{ marginTop: 16, marginBottom: 24 }}
        >
          {AI_TOOLS.map((tool) => (
            <TouchableOpacity
              key={tool.name}
              style={[styles.scrollRowBtn, { shadowColor: tool.color }]}
              activeOpacity={0.85}
              onPress={async () => {
                Clipboard.setString(item.promptText);

                if (Platform.OS === 'android') {
                  ToastAndroid.show('📋 Prompt Copied!', ToastAndroid.SHORT);
                }

                if (tool.appUrl) {
                  try {
                    await Linking.openURL(tool.appUrl);
                  } catch (error: any) {
                    const errMsg = String(error?.message || '');
                    const isActivityNotFound =
                      errMsg.toLowerCase().includes('no activity found') ||
                      errMsg.toLowerCase().includes('activitynotfound') ||
                      Platform.OS === 'ios';

                    if (isActivityNotFound) {
                      try {
                        await Linking.openURL(tool.url);
                      } catch (webError) {
                        console.log(`Unable to open ${tool.name} web:`, webError);
                      }
                    } else {
                      console.log(`${tool.name} app likely opened, ignoring fallback error:`, error);
                    }
                  }
                } else {
                  try {
                    await Linking.openURL(tool.url);
                  } catch (webError) {
                    console.log(`Unable to open ${tool.name} web:`, webError);
                  }
                }
              }}
            >
              <LinearGradient
                colors={tool.gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.geminiBtnGradient}
              >
                <Icon name={tool.icon} size={18} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.geminiBtnText}>{tool.name}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>

      {/* ── Full Screen Prompt Modal (Safe Area Padded) ── */}
      <Modal
        visible={promptModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPromptModalVisible(false)}
      >
        <View style={styles.promptModalOverlay}>
          <View style={[styles.promptModalContent, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
            <View style={styles.promptModalHeader}>
              <Text style={styles.promptModalTitle}>📝 Full Prompt</Text>
              <TouchableOpacity onPress={() => setPromptModalVisible(false)} style={styles.promptModalCloseBtn}>
                <Icon name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.promptModalBody} showsVerticalScrollIndicator={true}>
              <Text style={styles.promptModalText}>{item.promptText}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCopyBtn}
              onPress={() => {
                handleCopy();
                setPromptModalVisible(false);
              }}
            >
              <LinearGradient
                colors={colors.primaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalCopyBtnGradient}
              >
                <Icon name="content-copy" size={18} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.modalCopyBtnText}>Copy & Close</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Prompt Guide Modal (Hindi & English) ── */}
      <Modal
        visible={guideModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setGuideModalVisible(false)}
      >
        <View style={styles.guideModalOverlay}>
          <View style={[styles.guideModalContent, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
            {/* Modal Header */}
            <View style={styles.guideModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <LinearGradient
                  colors={colors.primaryGradient}
                  style={styles.guideHeaderIconBadge}
                >
                  <Icon name="lightbulb-on" size={20} color="#FFF" />
                </LinearGradient>
                <View>
                  <Text style={styles.guideModalTitle}>
                    {guideLang === 'hi' ? '💡 प्रॉम्प्ट उपयोग गाइड' : '💡 Prompt Guide'}
                  </Text>
                  <Text style={styles.guideModalSub}>
                    {guideLang === 'hi' ? 'AI इमेज जनरेटर में प्रॉम्प्ट कैसे यूज़ करें' : 'How to use prompts in AI generators'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity onPress={() => setGuideModalVisible(false)} style={styles.promptModalCloseBtn}>
                <Icon name="close" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Language Switcher Tabs */}
            <View style={styles.langTabContainer}>
              <TouchableOpacity
                style={[styles.langTabBtn, guideLang === 'hi' && styles.langTabBtnActive]}
                onPress={() => setGuideLang('hi')}
                activeOpacity={0.8}
              >
                {guideLang === 'hi' ? (
                  <LinearGradient colors={colors.primaryGradient} style={styles.langTabActiveGradient}>
                    <Icon name="translate" size={16} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.langTabTextActive}>हिंदी गाइड</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.langTabInactiveWrap}>
                    <Icon name="translate" size={16} color="#94A3B8" style={{ marginRight: 6 }} />
                    <Text style={styles.langTabTextInactive}>हिंदी (Hindi)</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.langTabBtn, guideLang === 'en' && styles.langTabBtnActive]}
                onPress={() => setGuideLang('en')}
                activeOpacity={0.8}
              >
                {guideLang === 'en' ? (
                  <LinearGradient colors={colors.primaryGradient} style={styles.langTabActiveGradient}>
                    <Icon name="translate" size={16} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.langTabTextActive}>English Guide</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.langTabInactiveWrap}>
                    <Icon name="translate" size={16} color="#94A3B8" style={{ marginRight: 6 }} />
                    <Text style={styles.langTabTextInactive}>English</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Guide Body ScrollView */}
            <ScrollView
              contentContainerStyle={styles.guideModalBody}
              showsVerticalScrollIndicator={false}
            >
              {guideLang === 'hi' ? (
                /* HINDI GUIDE */
                <View>
                  {/* Step 1 */}
                  <View style={styles.guideStepCard}>
                    <View style={styles.stepNumberBadge}>
                      <Text style={styles.stepNumberText}>1</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>प्रॉम्प्ट कॉपी करें (Copy)</Text>
                      <Text style={styles.stepDesc}>
                        <Text style={styles.stepHighlight}>"Copy"</Text> बटन दबाएं या नीचे दिए गए किसी भी AI टूल (Gemini, ChatGPT, Bing, Leonardo) पर टैप करें। प्रॉम्प्ट ऑटोमैटिकली आपके क्लिपबोर्ड पर कॉपी हो जाएगा और संबंधित टूल खुल जाएगा।
                      </Text>
                    </View>
                  </View>

                  {/* Step 2 */}
                  <View style={styles.guideStepCard}>
                    <View style={styles.stepNumberBadge}>
                      <Text style={styles.stepNumberText}>2</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>AI जनरेटर में पेस्ट (Paste) करें</Text>
                      <Text style={styles.stepDesc}>
                        अपने पसंदीदा AI टूल में जाकर प्रॉम्प्ट पेस्ट करें:
                      </Text>
                      <View style={styles.guideBulletList}>
                        <Text style={styles.guideBulletItem}>• <Text style={styles.stepHighlight}>Google Gemini / ChatGPT:</Text> चैट बॉक्स में पेस्ट करें और Send दबाएं।</Text>
                        <Text style={styles.guideBulletItem}>• <Text style={styles.stepHighlight}>Bing Image Creator (DALL-E 3 Free):</Text> प्रॉम्प्ट बॉक्स में पेस्ट करके "Create" पर क्लिक करें।</Text>
                        <Text style={styles.guideBulletItem}>• <Text style={styles.stepHighlight}>Midjourney:</Text> <Text style={styles.codeSnippet}>/imagine prompt:</Text> लिखकर प्रॉम्प्ट पेस्ट करें।</Text>
                        <Text style={styles.guideBulletItem}>• <Text style={styles.stepHighlight}>Leonardo AI / Ideogram:</Text> प्रॉम्प्ट बॉक्स में पेस्ट करें और Generate दबाएं।</Text>
                      </View>
                    </View>
                  </View>

                  {/* Step 3 */}
                  <View style={styles.guideStepCard}>
                    <View style={styles.stepNumberBadge}>
                      <Text style={styles.stepNumberText}>3</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>प्रॉम्प्ट कस्टमाइज़ करें (Optional)</Text>
                      <Text style={styles.stepDesc}>
                        आप अपनी पसंद के अनुसार शब्दों को बदल सकते हैं:
                      </Text>
                      <View style={styles.guideBulletList}>
                        <Text style={styles.guideBulletItem}>• <Text style={styles.stepHighlight}>करैक्टर बदलें:</Text> कपड़ों का रंग, हेयरस्टाइल, जेंडर या उम्र बदलें।</Text>
                        <Text style={styles.guideBulletItem}>• <Text style={styles.stepHighlight}>बैकग्राउंड बदलें:</Text> जैसे "Cyberpunk city", "Rainy village", "Sunset beach"।</Text>
                        <Text style={styles.guideBulletItem}>• <Text style={styles.stepHighlight}>लाइटिंग जोड़ें:</Text> "Golden sunset light", "Neon glow", "Cinematic dark mood"।</Text>
                      </View>
                    </View>
                  </View>

                  {/* Step 4 */}
                  <View style={styles.guideStepCard}>
                    <View style={styles.stepNumberBadge}>
                      <Text style={styles.stepNumberText}>4</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>अपना फ़ोटो अपलोड करें (Upload Photo) 📸</Text>
                      <Text style={styles.stepDesc}>
                        अगर आप अपने खुद के चेहरे या किसी खास फोटो जैसी इमेज बनाना चाहते हैं:
                      </Text>
                      <View style={styles.guideBulletList}>
                        <Text style={styles.guideBulletItem}>• <Text style={styles.stepHighlight}>फ़ोटो अटैच करें:</Text> AI टूल (Gemini, ChatGPT, Leonardo AI) में <Text style={styles.codeSnippet}>+</Text> या कैमरा आइकन दबाकर अपनी साफ़ फ़ोटो अपलोड करें।</Text>
                        <Text style={styles.guideBulletItem}>• <Text style={styles.stepHighlight}>प्रॉम्प्ट के साथ जोड़ें:</Text> प्रॉम्प्ट पेस्ट करने के बाद लिखें: <Text style={styles.stepHighlight}>"Keep the face and facial features exactly like the uploaded reference photo"</Text>।</Text>
                        <Text style={styles.guideBulletItem}>• <Text style={styles.stepHighlight}>मैजिक रिजल्ट:</Text> AI आपके असली चेहरे के साथ प्रॉम्प्ट का स्टाइल और बैकग्राउंड मिलाकर आपकी शानदार फ़ोटो तैयार कर देगा!</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ) : (
                /* ENGLISH GUIDE */
                <View>
                  {/* Step 1 */}
                  <View style={styles.guideStepCard}>
                    <View style={styles.stepNumberBadge}>
                      <Text style={styles.stepNumberText}>1</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>Copy the Prompt</Text>
                      <Text style={styles.stepDesc}>
                        Tap the <Text style={styles.stepHighlight}>"Copy"</Text> button or tap any AI Tool shortcut button (Gemini, ChatGPT, Bing, Leonardo) to copy the full prompt to your clipboard and open that tool directly.
                      </Text>
                    </View>
                  </View>

                  {/* Step 2 */}
                  <View style={styles.guideStepCard}>
                    <View style={styles.stepNumberBadge}>
                      <Text style={styles.stepNumberText}>2</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>Paste in AI Image Generator</Text>
                      <Text style={styles.stepDesc}>
                        Open your preferred AI generation tool:
                      </Text>
                      <View style={styles.guideBulletList}>
                        <Text style={styles.guideBulletItem}>• <Text style={styles.stepHighlight}>Google Gemini / ChatGPT:</Text> Just paste the prompt in chat and send.</Text>
                        <Text style={styles.guideBulletItem}>• <Text style={styles.stepHighlight}>Bing Image Creator / DALL-E 3:</Text> Paste in prompt box and tap "Create".</Text>
                        <Text style={styles.guideBulletItem}>• <Text style={styles.stepHighlight}>Midjourney:</Text> Type <Text style={styles.codeSnippet}>/imagine prompt:</Text> then paste.</Text>
                        <Text style={styles.guideBulletItem}>• <Text style={styles.stepHighlight}>Leonardo AI / Ideogram:</Text> Paste in the prompt input and click Generate.</Text>
                      </View>
                    </View>
                  </View>

                  {/* Step 3 */}
                  <View style={styles.guideStepCard}>
                    <View style={styles.stepNumberBadge}>
                      <Text style={styles.stepNumberText}>3</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>Customize & Personalize (Optional)</Text>
                      <Text style={styles.stepDesc}>
                        Feel free to edit the text to make it uniquely yours:
                      </Text>
                      <View style={styles.guideBulletList}>
                        <Text style={styles.guideBulletItem}>• <Text style={styles.stepHighlight}>Subject:</Text> Change character traits, clothing color, hairstyle or gender.</Text>
                        <Text style={styles.guideBulletItem}>• <Text style={styles.stepHighlight}>Environment:</Text> e.g. "cyberpunk alley", "misty forest", "sunny beach".</Text>
                        <Text style={styles.guideBulletItem}>• <Text style={styles.stepHighlight}>Lighting/Mood:</Text> e.g. "golden hour light", "neon glow", "moody cinematic".</Text>
                      </View>
                    </View>
                  </View>

                  {/* Step 4 */}
                  <View style={styles.guideStepCard}>
                    <View style={styles.stepNumberBadge}>
                      <Text style={styles.stepNumberText}>4</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>Attach / Upload Your Own Photo 📸</Text>
                      <Text style={styles.stepDesc}>
                        Want the AI output to have your authentic face or a reference character:
                      </Text>
                      <View style={styles.guideBulletList}>
                        <Text style={styles.guideBulletItem}>• <Text style={styles.stepHighlight}>Upload Photo:</Text> Inside AI tools (Gemini, ChatGPT, Leonardo AI), tap the <Text style={styles.codeSnippet}>+</Text> or image attachment button to upload your photo.</Text>
                        <Text style={styles.guideBulletItem}>• <Text style={styles.stepHighlight}>Add Prompt Command:</Text> Paste the prompt and append: <Text style={styles.stepHighlight}>"Keep my face, facial features and likeness exactly like the uploaded reference photo"</Text>.</Text>
                        <Text style={styles.guideBulletItem}>• <Text style={styles.stepHighlight}>Generate:</Text> The AI will blend your face seamlessly into the prompt's artistic background and style!</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* Action Button */}
              <TouchableOpacity
                style={styles.guideGotItBtn}
                onPress={() => setGuideModalVisible(false)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={colors.primaryGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.guideGotItGradient}
                >
                  <Icon name="check-circle-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.guideGotItText}>
                    {guideLang === 'hi' ? 'समझ गया, प्रॉम्प्ट यूज़ करें!' : 'Got It, Let\'s Create!'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export const PromptDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { item, promptsList = mockPrompts } = route.params as { item: PromptItem; promptsList?: PromptItem[] };
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();

  const [showGuide, setShowGuide] = React.useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  const initialIndex = promptsList.findIndex(p => p.id === item.id);
  const safeInitialIndex = initialIndex !== -1 ? initialIndex : 0;

  React.useEffect(() => {
    logScreenView('PromptDetailScreen');
  }, []);

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
        data={promptsList}
        keyExtractor={item => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        initialScrollIndex={safeInitialIndex}
        getItemLayout={(data, index) => ({
          length: windowHeight,
          offset: windowHeight * index,
          index,
        })}
        renderItem={({ item: reelItem }) => (
          <ReelItem
            item={reelItem}
            insets={insets}
            navigation={navigation}
            screenHeight={windowHeight}
            screenWidth={windowWidth}
          />
        )}
      />

      {showGuide && (
        <Animated.View
          style={[
            styles.guideOverlay,
            {
              bottom: Math.max(insets.bottom, 16) + 130,
              opacity: fadeAnim,
              transform: [{ translateY: bounceAnim }]
            }
          ]}
        >
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
    height: SCREEN_HEIGHT * 0.40,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#121222',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
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
    marginTop: 15,
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 16,
    marginBottom: 24,
  },
  rowBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  scrollBtnRow: {
    paddingLeft: 4,
    paddingRight: 20,
    gap: 12,
  },
  scrollRowBtn: {
    width: 145,
    height: 50,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
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

  // Prompt Modal Styles
  promptModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 9, 15, 0.95)',
    justifyContent: 'flex-end',
  },
  promptModalContent: {
    backgroundColor: '#121222',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    minHeight: 320,
    borderWidth: 1,
    borderColor: '#1F1F35',
  },
  promptModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F35',
  },
  promptModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  promptModalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1B1B32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptModalBody: {
    padding: 20,
  },
  promptModalText: {
    fontSize: 16,
    color: '#CBD5E1',
    lineHeight: 24,
    fontWeight: '500',
  },
  modalCopyBtn: {
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
    marginHorizontal: 20,
    marginTop: 10,
  },
  modalCopyBtnGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCopyBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  // Info Icon & Guide Modal Styles
  infoIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#17172C',
    borderWidth: 1,
    borderColor: '#2A2A46',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 12, 0.94)',
    justifyContent: 'flex-end',
  },
  guideModalContent: {
    backgroundColor: '#0F1022',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
    minHeight: 480,
    borderWidth: 1,
    borderColor: '#252545',
  },
  guideModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A32',
  },
  guideHeaderIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  guideModalSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  langTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#090A16',
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 10,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: '#1D1E38',
  },
  langTabBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    overflow: 'hidden',
  },
  langTabBtnActive: {
    elevation: 2,
  },
  langTabActiveGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  langTabInactiveWrap: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  langTabTextActive: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  langTabTextInactive: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  guideModalBody: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  guideStepCard: {
    flexDirection: 'row',
    backgroundColor: '#15162C',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#232444',
  },
  stepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2A2356',
    borderWidth: 1,
    borderColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#C084FC',
    fontSize: 13,
    fontWeight: '800',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 12.5,
    color: '#94A3B8',
    lineHeight: 18,
    fontWeight: '400',
  },
  stepHighlight: {
    color: '#C084FC',
    fontWeight: '700',
  },
  codeSnippet: {
    color: '#38BDF8',
    backgroundColor: '#0F172A',
    fontWeight: '700',
    fontSize: 11.5,
  },
  guideBulletList: {
    marginTop: 6,
    gap: 4,
  },
  guideBulletItem: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
  },
  guideGotItBtn: {
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 10,
  },
  guideGotItGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideGotItText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
