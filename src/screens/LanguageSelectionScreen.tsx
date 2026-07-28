import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../i18n';
import { setStoredLanguage } from '../store/storage';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'LanguageSelection'>;

const LanguageSelectionScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { i18n } = useTranslation();

  const handleLanguageSelect = async (langCode: string) => {
    await setStoredLanguage(langCode);
    await i18n.changeLanguage(langCode);
    navigation.replace('Main');
  };

  const renderItem = ({ item }: { item: typeof SUPPORTED_LANGUAGES[0] }) => (
    <TouchableOpacity
      style={styles.languageButton}
      onPress={() => handleLanguageSelect(item.code)}
    >
      <Text style={styles.languageText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Select Language</Text>
      <Text style={styles.subtitle}>Choose your preferred language</Text>
      
      <FlatList
        data={SUPPORTED_LANGUAGES}
        keyExtractor={(item) => item.code}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
    marginTop: 40,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  listContainer: {
    paddingBottom: 20,
  },
  languageButton: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 20,
    margin: 8,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  languageText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    color: colors.primaryDark,
  },
});

export default LanguageSelectionScreen;
