import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share as RNShare,
  Modal,
} from 'react-native';
import { useAppContext } from '../store/AppContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import LinearGradient from 'react-native-linear-gradient';

export const SettingsScreen = () => {
  const { clearFavorites } = useAppContext();
  const insets = useSafeAreaInsets();
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);

  const handleClearFavorites = () => {
    Alert.alert(
      'Clear Favorites',
      'This will remove all your saved prompts. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: () => clearFavorites() },
      ]
    );
  };

  const handleShareApp = async () => {
    try {
      await RNShare.share({
        message: '✨ AI Prompt Generator - Create stunning AI images with these curated prompts!\nDownload now and start generating!',
      });
    } catch (e: any) {
      console.error(e.message);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile Card Header */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={colors.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarGradient}
          >
            <Icon name="account" size={48} color="#FFF" />
          </LinearGradient>
          <Text style={styles.profileName}>AI Prompt Creator</Text>
          <Text style={styles.profileEmail}>explorer@imageprompt.com</Text>
        </View>

        {/* ── Commented Default Redirect Tool Feature ── */}
        {/* 
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DEFAULT REDIRECT TOOL</Text>
          <Text style={styles.sectionHint}>
            Opens automatically when you tap "Copy & Open"
          </Text>
          {TOOLS.map(tool => {
            const meta = TOOL_ICONS[tool] || { icon: 'open-in-new', color: '#888' };
            const active = defaultTool === tool;
            return (
              <TouchableOpacity
                key={tool}
                style={[styles.toolRow, active && styles.toolRowActive]}
                activeOpacity={0.8}
                onPress={() => setDefaultTool(tool)}
              >
                <View style={[styles.toolIcon, { backgroundColor: meta.color + '15' }]}>
                  <Icon name={meta.icon} size={20} color={meta.color} />
                </View>
                <Text style={[styles.toolName, active && { color: '#FFFFFF', fontWeight: '700' }]}>
                  {tool}
                </Text>
                {active ? (
                  <View style={styles.checkCircle}>
                    <Icon name="check" size={14} color="#FFF" />
                  </View>
                ) : (
                  <Icon name="circle-outline" size={22} color="#475569" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        */}

        {/* Settings Options Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>APPLICATION SETTINGS</Text>

          <TouchableOpacity style={styles.settingsRow} activeOpacity={0.7} onPress={handleShareApp}>
            <View style={[styles.iconContainer, { backgroundColor: '#10B98115' }]}>
              <Icon name="share-variant" size={20} color="#10B981" />
            </View>
            <Text style={styles.settingsLabel}>Share App</Text>
            <Icon name="chevron-right" size={20} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsRow} activeOpacity={0.7} onPress={() => setPrivacyVisible(true)}>
            <View style={[styles.iconContainer, { backgroundColor: '#3B82F615' }]}>
              <Icon name="shield-lock-outline" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.settingsLabel}>Privacy Policy</Text>
            <Icon name="chevron-right" size={20} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsRow} activeOpacity={0.7} onPress={() => setAboutVisible(true)}>
            <View style={[styles.iconContainer, { backgroundColor: '#A15DFB15' }]}>
              <Icon name="information-outline" size={20} color="#A15DFB" />
            </View>
            <Text style={styles.settingsLabel}>About Us</Text>
            <Icon name="chevron-right" size={20} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsRow} activeOpacity={0.7} onPress={() => setTermsVisible(true)}>
            <View style={[styles.iconContainer, { backgroundColor: '#F59E0B15' }]}>
              <Icon name="file-document-outline" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.settingsLabel}>Terms & Conditions</Text>
            <Icon name="chevron-right" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DATA MANAGEMENT</Text>
          <TouchableOpacity style={styles.dangerRow} onPress={handleClearFavorites}>
            <View style={styles.dangerIcon}>
              <Icon name="trash-can-outline" size={20} color="#EF4444" />
            </View>
            <Text style={styles.dangerText}>Clear All Favorites</Text>
            <Icon name="chevron-right" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* About App */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ABOUT</Text>
          <View style={styles.aboutCard}>
            <Icon name="image-multiple-outline" size={32} color={colors.primary} />
            <Text style={styles.aboutAppName}>AI Prompt Generator</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            <Text style={styles.aboutTagline}>Curated prompts for creative minds.</Text>
          </View>
        </View>
      </ScrollView>

      {/* ── Privacy Policy Modal ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={privacyVisible}
        onRequestClose={() => setPrivacyVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔒 Privacy Policy</Text>
              <TouchableOpacity onPress={() => setPrivacyVisible(false)} style={styles.modalCloseBtn}>
                <Icon name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalBody}>
              <Text style={styles.policyHeading}>1. Introduction</Text>
              <Text style={styles.policyParagraph}>
                Welcome to AI Prompt Generator. We value your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and protect your information.
              </Text>

              <Text style={styles.policyHeading}>2. Data Collection</Text>
              <Text style={styles.policyParagraph}>
                Our app runs locally and stores your favorites locally on your device. We do not collect or transmit any of your personal details, saved items, or search queries to external servers.
              </Text>

              <Text style={styles.policyHeading}>3. Clipboard Access</Text>
              <Text style={styles.policyParagraph}>
                When you click "Copy Prompt" or "Use Gemini AI", the app copies text to your device clipboard so that you can easily paste it into image generation platforms. This data remains on your device.
              </Text>

              <Text style={styles.policyHeading}>4. Third-Party Services</Text>
              <Text style={styles.policyParagraph}>
                This application contains links to third-party AI generation tools (like Gemini, Leonardo AI, Canva, etc.). We encourage you to review their respective privacy policies when visiting their platforms.
              </Text>

              <Text style={styles.policyHeading}>5. Contact Us</Text>
              <Text style={styles.policyParagraph}>
                If you have any questions about this privacy policy, please contact our support desk at support@imageprompt.com.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── About Us Modal ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={aboutVisible}
        onRequestClose={() => setAboutVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ℹ️ About Us</Text>
              <TouchableOpacity onPress={() => setAboutVisible(false)} style={styles.modalCloseBtn}>
                <Icon name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalBody}>
              <Text style={styles.policyHeading}>Who We Are</Text>
              <Text style={styles.policyParagraph}>
                We are a passionate team of developers and AI enthusiasts dedicated to making AI image generation accessible to everyone. Our app helps creators, designers, and hobbyists discover high-quality, pre-tested prompts to use with popular AI engines like Midjourney, DALL-E, and Gemini.
              </Text>
              <Text style={styles.policyHeading}>Our Mission</Text>
              <Text style={styles.policyParagraph}>
                To bridge the gap between imagination and digital art by providing beautifully structured prompts that consistently yield spectacular visual assets.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Terms & Conditions Modal ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={termsVisible}
        onRequestClose={() => setTermsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📄 Terms & Conditions</Text>
              <TouchableOpacity onPress={() => setTermsVisible(false)} style={styles.modalCloseBtn}>
                <Icon name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalBody}>
              <Text style={styles.policyHeading}>1. Acceptance of Terms</Text>
              <Text style={styles.policyParagraph}>
                By accessing or using AI Prompt Generator, you agree to comply with and be bound by these Terms and Conditions.
              </Text>

              <Text style={styles.policyHeading}>2. Prompt Usage License</Text>
              <Text style={styles.policyParagraph}>
                All prompts provided in the app are free to use for personal or commercial creative outputs. You may modify and input them into any third-party AI platform. However, resale or redistribution of our raw prompt collections as a competing product is strictly prohibited.
              </Text>

              <Text style={styles.policyHeading}>3. Disclaimer of Warranties</Text>
              <Text style={styles.policyParagraph}>
                Prompt outputs can vary based on model configurations, platform updates, and random seeding. We do not guarantee identical outputs when running these prompts on third-party generators.
              </Text>

              <Text style={styles.policyHeading}>4. Amendments</Text>
              <Text style={styles.policyParagraph}>
                We reserve the right to modify these terms at any time. Continued use of the app implies acceptance of the updated terms.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
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

  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1.2,
    marginBottom: 6,
    marginTop: 6,
  },
  sectionHint: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 14,
    lineHeight: 18,
  },

  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121222',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#1F1F35',
  },
  toolRowActive: {
    borderColor: '#8A2BE2',
    backgroundColor: '#1A0E2A',
  },
  toolIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toolName: {
    flex: 1,
    fontSize: 15,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8A2BE2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A1215',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#3F1F22',
  },
  dangerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#3F1F22',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dangerText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },

  aboutCard: {
    backgroundColor: '#121222',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F1F35',
  },
  aboutAppName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 10,
  },
  aboutVersion: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  aboutTagline: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 6,
    fontStyle: 'italic',
  },

  // Redesigned profile header styles
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F35',
    marginBottom: 20,
  },
  avatarGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileEmail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },

  // Settings row styles
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121222',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1F1F35',
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsLabel: {
    flex: 1,
    fontSize: 15,
    color: '#CBD5E1',
    fontWeight: '600',
  },

  // Modal styles for Privacy Policy
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 9, 15, 0.95)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#121222',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    borderWidth: 1,
    borderColor: '#1F1F35',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F35',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1B1B32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
  },
  policyHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#A15DFB',
    marginTop: 16,
    marginBottom: 8,
  },
  policyParagraph: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 20,
    marginBottom: 8,
  },
});
