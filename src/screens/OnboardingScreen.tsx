import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';
import { fetchCategories, fetchPrompts } from '../utils/api';

const { width } = Dimensions.get('window');

export const OnboardingScreen = () => {
  const navigation = useNavigation<any>();
  
  // Animation values
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Trigger backend wake-up immediately
    fetchCategories().catch(() => {});
    fetchPrompts().catch(() => {});

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
      Animated.delay(500).start(() => {
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
        ]).start();
      }),
      // Loading Progress bar animation (animates over 3 seconds)
      Animated.timing(progressWidth, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      })
    ]).start();

    // 3. Navigation redirect after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace('Main');
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#0C0C14', '#17172C', '#0C0C14']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Animated logo badge */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <LinearGradient
            colors={colors.primaryGradient}
            style={styles.logoGradient}
          >
            <Icon name="creation" size={54} color="#FFF" />
          </LinearGradient>
        </Animated.View>

        {/* Animated text labels */}
        <Animated.View
          style={{
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
            alignItems: 'center',
          }}
        >
          <Text style={styles.title}>AI Prompt Generator</Text>
          <Text style={styles.subtitle}>Unlock Your Creative Potential</Text>
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
    width: 110,
    height: 110,
    borderRadius: 36,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#A15DFB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
