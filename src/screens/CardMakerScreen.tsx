import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  PanResponder,
  Animated,
  Alert,
  Platform,
  ImageBackground,
  ToastAndroid
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import ViewShot from 'react-native-view-shot';
import RNShare from 'react-native-share';
import { launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const BG_COLORS = ['#ffcdd2', '#f8bbd0', '#e1bee7', '#d1c4e9', '#c5cae9', '#bbdefb', '#b3e5fc', '#b2ebf2', '#b2dfdb', '#c8e6c9', '#dcedc8', '#f0f4c3', '#fff9c4', '#ffecb3', '#ffe0b2', '#ffccbc', '#d7ccc8', '#f5f5f5'];
const TEXT_COLORS = ['#000000', '#ffffff', '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#9e9e9e', '#607d8b'];
const FONT_SIZES = [16, 20, 24, 28, 32, 36, 42, 48];

const CardMakerScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const viewShotRef = useRef<ViewShot>(null);

  const initialText = route.params?.initialText || 'Happy Birthday! 🎉';

  const [text, setText] = useState(initialText);
  const [textColor, setTextColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#f8bbd0');
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(28);
  const [isEditing, setIsEditing] = useState(true);
  const [activeTab, setActiveTab] = useState<'text' | 'textColor' | 'bgColor' | 'font'>('text');

  // Position for dragging
  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value
        });
      },
      onPanResponderMove: Animated.event(
        [
          null,
          { dx: pan.x, dy: pan.y }
        ],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      }
    })
  ).current;

  const handleShare = async () => {
    if (!viewShotRef.current || !viewShotRef.current.capture) {
      Alert.alert('Error', 'ViewShot is not ready.');
      return;
    }
    
    setIsEditing(false); // Hide borders before capture
    
    try {
      // Wait for React to render the removed border
      await new Promise(resolve => setTimeout(resolve, 100));
      const base64Data = await viewShotRef.current.capture();
      
      const shareOptions = {
        title: 'Share your birthday wish',
        url: `data:image/png;base64,${base64Data}`,
        message: 'Made with Birthday Wishes App! 🎉',
      };

      await RNShare.open(shareOptions);
      
    } catch (error: any) {
      if (error.message !== 'User did not share') {
        Alert.alert('Error', 'Could not share the image: ' + error.message);
      }
    }
  };

  const handleDownload = async () => {
    if (!viewShotRef.current || !viewShotRef.current.capture) {
      Alert.alert('Error', 'ViewShot is not ready.');
      return;
    }
    
    setIsEditing(false); // Hide borders before capture
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const base64Data = await viewShotRef.current.capture();
      
      const path = `${RNFS.PicturesDirectoryPath}/birthday_wish_${Date.now()}.png`;
      await RNFS.writeFile(path, base64Data, 'base64');
      
      if (Platform.OS === 'android') {
        try {
          await RNFS.scanFile(path);
        } catch (scanError) {
          console.log('Media scan failed', scanError);
        }
        ToastAndroid.show('Saved to Gallery!', ToastAndroid.SHORT);
      } else {
        Alert.alert('Success', 'Saved successfully!');
      }
      
    } catch (error: any) {
      Alert.alert('Error', 'Could not save the image: ' + error.message);
    }
  };

  const pickImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 1 });
    if (result.assets && result.assets.length > 0) {
      setBgImage(result.assets[0].uri || null);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'text':
        return (
          <TextInput
            style={styles.textInput}
            value={text}
            onChangeText={setText}
            placeholder="Enter your wish..."
            multiline
            onFocus={() => setIsEditing(true)}
            autoFocus
          />
        );
      case 'textColor':
        return (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorRow}>
            {TEXT_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[styles.colorBubble, { backgroundColor: color, borderWidth: textColor === color ? 3 : 1, borderColor: textColor === color ? colors.primaryDark : '#ccc' }]}
                onPress={() => { setTextColor(color); setIsEditing(true); }}
              />
            ))}
          </ScrollView>
        );
      case 'font':
        return (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorRow}>
            {FONT_SIZES.map((size) => (
              <TouchableOpacity
                key={size}
                style={[styles.sizeBubble, { backgroundColor: fontSize === size ? colors.primaryDark : colors.surface }]}
                onPress={() => { setFontSize(size); setIsEditing(true); }}
              >
                <Text style={{ color: fontSize === size ? '#fff' : colors.text, fontWeight: 'bold' }}>{size}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        );
      case 'bgColor':
        return (
          <View>
            <View style={styles.bgSelectionContainer}>
              <Text style={styles.sectionTitle}>Solid Colors</Text>
              <TouchableOpacity style={styles.pickImageBtn} onPress={pickImage}>
                <Icon name="image" size={18} color="#fff" />
                <Text style={styles.pickImageText}>Pick Image</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorRow}>
              {BG_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorBubble, { backgroundColor: color, borderWidth: (bgColor === color && !bgImage) ? 3 : 1, borderColor: (bgColor === color && !bgImage) ? colors.primaryDark : '#ccc' }]}
                  onPress={() => { setBgColor(color); setBgImage(null); }}
                />
              ))}
            </ScrollView>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Card Maker</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={handleDownload} style={[styles.shareButton, { marginRight: 15 }]}>
            <Icon name="download-outline" size={24} color={colors.primaryDark} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Icon name="share-social" size={24} color={colors.primaryDark} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Canvas Area */}
      <View style={styles.canvasContainer}>
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0, result: 'base64' }} style={styles.viewShot}>
          <ImageBackground 
            source={bgImage ? { uri: bgImage } : undefined} 
            style={[styles.canvas, { backgroundColor: bgImage ? 'transparent' : bgColor }]}
            resizeMode="cover"
            collapsable={false}
          >
            <Animated.View
              {...panResponder.panHandlers}
              style={[
                pan.getLayout(),
                styles.draggableTextContainer,
                isEditing && styles.editingBorder
              ]}
            >
              <Text style={[styles.draggableText, { color: textColor, fontSize: fontSize }]}>
                {text}
              </Text>
            </Animated.View>
          </ImageBackground>
        </ViewShot>
        <Text style={styles.hintText}>Drag text to move</Text>
      </View>

      {/* Controls Area */}
      <View style={styles.editorContainer}>
        <View style={styles.tabContentContainer}>
          {renderTabContent()}
        </View>
        
        {/* Editor Tabs Row */}
        <View style={styles.editorTabs}>
          <TouchableOpacity style={styles.editorTab} onPress={() => setActiveTab('text')}>
            <Icon name="text-outline" size={24} color={activeTab === 'text' ? colors.primaryDark : colors.textLight} />
            <Text style={[styles.editorTabText, activeTab === 'text' && styles.editorTabTextActive]}>Text</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editorTab} onPress={() => setActiveTab('textColor')}>
            <Icon name="color-palette-outline" size={24} color={activeTab === 'textColor' ? colors.primaryDark : colors.textLight} />
            <Text style={[styles.editorTabText, activeTab === 'textColor' && styles.editorTabTextActive]}>Color</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editorTab} onPress={() => setActiveTab('font')}>
            <Icon name="options-outline" size={24} color={activeTab === 'font' ? colors.primaryDark : colors.textLight} />
            <Text style={[styles.editorTabText, activeTab === 'font' && styles.editorTabTextActive]}>Size</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editorTab} onPress={() => setActiveTab('bgColor')}>
            <Icon name="image-outline" size={24} color={activeTab === 'bgColor' ? colors.primaryDark : colors.textLight} />
            <Text style={[styles.editorTabText, activeTab === 'bgColor' && styles.editorTabTextActive]}>Background</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#ffffff',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },
  shareButton: {
    padding: 5,
  },
  canvasContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  viewShot: {
    width: 300,
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  canvas: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  draggableTextContainer: {
    padding: 10,
    borderRadius: 8,
  },
  editingBorder: {
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.2)',
    borderStyle: 'dashed',
  },
  draggableText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  hintText: {
    marginTop: 15,
    color: colors.textLight,
    fontSize: 13,
    fontWeight: '500',
  },
  editorContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 15,
  },
  tabContentContainer: {
    flex: 1,
    padding: 20,
  },
  editorTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: '#fafafa',
  },
  editorTab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  editorTabText: {
    fontSize: 12,
    marginTop: 4,
    color: colors.textLight,
  },
  editorTabTextActive: {
    color: colors.primaryDark,
    fontWeight: 'bold',
  },
  textInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  colorBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sizeBubble: {
    width: 50,
    height: 44,
    borderRadius: 22,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  bgSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pickImageBtn: {
    backgroundColor: colors.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  pickImageText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: 'bold',
    fontSize: 12,
  }
});

export default CardMakerScreen;
