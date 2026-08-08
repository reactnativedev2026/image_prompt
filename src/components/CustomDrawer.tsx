import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
  Modal,
  SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useAppContext } from '../store/AppContext';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.78;

// Create a helper ref that we can export and link to our NavigationContainer
import { createNavigationContainerRef } from '@react-navigation/native';
export const globalNavigationRef = createNavigationContainerRef<any>();

export const CustomDrawer = () => {
  const { drawerOpen, setDrawerOpen } = useAppContext();
  const [aboutVisible, setAboutVisible] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);
  const [visible, setVisible] = useState(false);

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (drawerOpen) {
      setVisible(true);
      // Slide in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Slide out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start(() => {
        setVisible(false);
      });
    }
  }, [drawerOpen]);

  const handleClose = () => {
    setDrawerOpen(false);
  };

  const navigateTo = (screenName: string, params?: any) => {
    handleClose();
    if (globalNavigationRef.isReady()) {
      // Bottom tab navigation target
      globalNavigationRef.navigate('Main', {
        screen: screenName,
        params: params
      });
    }
  };

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      {/* Drawer Content */}
      <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: slideAnim }] }]}>
        <SafeAreaView style={styles.safeArea}>
          <LinearGradient
            colors={['#17172C', '#0C0C14']}
            style={styles.drawerGradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <LinearGradient colors={colors.primaryGradient} style={styles.logoBadge}>
                <Icon name="creation" size={32} color="#FFF" />
              </LinearGradient>
              <Text style={styles.appTitle}>AI Prompt</Text>
              <Text style={styles.appSubtitle}>Generator</Text>
            </View>

            {/* Menu Divider */}
            <View style={styles.divider} />

            {/* Menu Items */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.menuList}>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('Gallery')}>
                <Icon name="home-outline" size={22} color="#A15DFB" />
                <Text style={styles.menuLabel}>Home / Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('Explore')}>
                <Icon name="compass-outline" size={22} color="#A15DFB" />
                <Text style={styles.menuLabel}>Explore Tools</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('Favorites')}>
                <Icon name="heart-outline" size={22} color="#A15DFB" />
                <Text style={styles.menuLabel}>Favorites</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('Settings')}>
                <Icon name="cog-outline" size={22} color="#A15DFB" />
                <Text style={styles.menuLabel}>Settings</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.menuItem} onPress={() => setAboutVisible(true)}>
                <Icon name="information-outline" size={22} color="#94A3B8" />
                <Text style={styles.menuLabelSecondary}>About Us</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => setTermsVisible(true)}>
                <Icon name="file-document-outline" size={22} color="#94A3B8" />
                <Text style={styles.menuLabelSecondary}>Terms & Conditions</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.versionText}>v1.0.0 (Beta)</Text>
            </View>
          </LinearGradient>
        </SafeAreaView>
      </Animated.View>

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
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 9980,
  },
  drawerContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    zIndex: 9990,
    backgroundColor: '#0C0C14',
    borderRightWidth: 1,
    borderRightColor: '#1F1F35',
  },
  safeArea: {
    flex: 1,
  },
  drawerGradient: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 15,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
  },
  appSubtitle: {
    fontSize: 14,
    color: '#A15DFB',
    fontWeight: '700',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#1F1F35',
    marginVertical: 15,
  },
  menuList: {
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 4,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 14,
  },
  menuLabelSecondary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginLeft: 14,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1F1F35',
  },
  versionText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },

  // Modal styling
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
