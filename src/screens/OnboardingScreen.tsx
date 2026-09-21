import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme/colors';
import { useAppContext } from '../store/AppContext';
import { logScreenView } from '../utils/analytics';

const { width } = Dimensions.get('window');

export const OnboardingScreen = () => {
  const navigation = useNavigation<any>();
  const { preloadData } = useAppContext();

  // Animation values
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    logScreenView('OnboardingScreen');
    // 1. Trigger data preload immediately during onboarding animation
    preloadData();

    // 2. Start Animations
    Animated.parallel([
      // Logo bounce/scale & fade
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 15,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Text fade & slide
      Animated.delay(500),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Loading Progress bar animation (animates over 3 seconds)
      Animated.timing(progressWidth, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      })
    ]).start();

    // 3. Navigation redirect after 3.2 seconds
    const timer = setTimeout(() => {
      navigation.replace('Main');
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#090912', '#14142B', '#090912']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Animated logo badge with appIcon */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={require('../assets/appIcon.png')}
            style={styles.logoImage}
            resizeMode="cover"
          />
        </Animated.View>

        {/* Animated text labels */}
        <Animated.View
          style={{
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
            alignItems: 'center',
          }}
        >
          <Text style={styles.title}>Pro Prompt</Text>
          <Text style={styles.subtitle}>AI Image Prompt Generator</Text>
        </Animated.View>

        {/* Dynamic Loading Progress Bar */}
        <View style={styles.progressBarBg}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          >
            <LinearGradient
              colors={colors.primaryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 130,
    height: 130,
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    backgroundColor: '#0F1020',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
    fontWeight: '500',
    textAlign: 'center',
  },
  progressBarBg: {
    width: width - 80,
    height: 6,
    backgroundColor: '#1E1E38',
    borderRadius: 3,
    marginTop: 40,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default OnboardingScreen;
