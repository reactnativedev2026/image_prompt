import { Platform } from 'react-native';

export const typography = {
  // Can use custom fonts later if requested
  fontFamily: Platform.select({
    ios: 'System',
    android: 'sans-serif',
  }),
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
};
