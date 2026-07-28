import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Share from 'react-native-share';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const SettingsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();

  const handleChangeLanguage = () => {
    // Navigate back to LanguageSelectionScreen
    navigation.replace('LanguageSelection');
  };

  const handleShareApp = async () => {
    try {
      await Share.open({
        title: 'Birthday Wishes App',
        message: 'Check out this awesome Birthday Wishes App! Find, copy, and share beautiful birthday wishes, GIFs, and images.',
      });
    } catch (error) {
      console.log('Error sharing app:', error);
    }
  };

  const handleRateApp = () => {
    Alert.alert('Rate App', 'This will open the Play Store link.');
  };

  const SettingsItem = ({ icon, title, onPress }: { icon: string, title: string, onPress: () => void }) => (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <View style={styles.settingsItemLeft}>
        <Icon name={icon} size={24} color={colors.primaryDark} style={styles.settingsIcon} />
        <Text style={styles.settingsText}>{title}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color={colors.textLight} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <SettingsItem 
            icon="language-outline" 
            title={t('settings.changeLanguage')} 
            onPress={handleChangeLanguage} 
          />
          <SettingsItem 
            icon="star-outline" 
            title={t('settings.rateApp')} 
            onPress={handleRateApp} 
          />
          <SettingsItem 
            icon="share-social-outline" 
            title={t('settings.shareApp')} 
            onPress={handleShareApp} 
          />
          <SettingsItem 
            icon="shield-checkmark-outline" 
            title={t('settings.privacyPolicy')} 
            onPress={() => Alert.alert('Privacy Policy', 'Coming soon')} 
          />
          <SettingsItem 
            icon="information-circle-outline" 
            title={t('settings.aboutUs')} 
            onPress={() => Alert.alert('About Us', 'Birthday Wishes App v0.0.1')} 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsIcon: {
    marginRight: 15,
  },
  settingsText: {
    fontSize: typography.sizes.md,
    color: colors.text,
  }
});

export default SettingsScreen;
