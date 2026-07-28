import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { RootStackParamList } from '../navigation/AppNavigator';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const ALL_CATEGORIES = [
  { id: 'friend', icon: 'people-outline' },
  { id: 'bestFriend', icon: 'star-outline' },
  { id: 'brother', icon: 'person-outline' },
  { id: 'sister', icon: 'person-outline' },
  { id: 'mother', icon: 'heart-outline' },
  { id: 'father', icon: 'heart-outline' },
  { id: 'husband', icon: 'male-outline' },
  { id: 'wife', icon: 'female-outline' },
  { id: 'son', icon: 'happy-outline' },
  { id: 'daughter', icon: 'happy-outline' },
  { id: 'boyfriend', icon: 'rose-outline' },
  { id: 'girlfriend', icon: 'rose-outline' },
  { id: 'funnyWishes', icon: 'happy-outline' },
  { id: 'romanticWishes', icon: 'heart-circle-outline' },
  { id: 'inspirationalWishes', icon: 'bulb-outline' }
];

const CategoriesScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();

  const renderCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => navigation.navigate('WishList', { category: item.id })}
    >
      <View style={styles.iconContainer}>
        <Icon name={item.icon} size={30} color={colors.primaryDark} />
      </View>
      <Text style={styles.categoryText}>{t(`categories.${item.id}`)}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Categories</Text>
      </View>
      <FlatList
        data={ALL_CATEGORIES}
        keyExtractor={(item) => item}
        renderItem={renderCategoryItem}
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
  listContainer: {
    padding: 15,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    margin: 8,
    padding: 20,
    borderRadius: 12,
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
  categoryText: {
    marginTop: 10,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
    textAlign: 'center',
  }
});

export default CategoriesScreen;
