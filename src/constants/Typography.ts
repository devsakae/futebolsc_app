import { StyleSheet } from 'react-native';

export const Typography = StyleSheet.create({
  displayLg: {
    fontFamily: 'Anton_400Regular',
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: 0.88, // 0.02em * 44
  },
  headlineLg: {
    fontFamily: 'Anton_400Regular',
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: 0.32, // 0.01em * 32
  },
  headlineSm: {
    fontFamily: 'Anton_400Regular',
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.9, // 0.05em * 18
  },
  titleLg: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
  },
  bodyLg: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMd: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  labelLg: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2, // 0.1em * 12
  },
});
