import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import {
    Linking,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import InAppReview from 'react-native-in-app-review';

import { colors } from '../theme/colors';
import { PLAY_STORE_URL } from '../constants';

const HAS_RATED_KEY = 'app_has_rated';
const LAST_PROMPT_KEY = 'app_last_rating_prompt';

const { width } = Dimensions.get('window');

const ACCENT = colors.primaryDark;
const BORDER_ACCENT = colors.border;
const SURFACE = colors.surface;
const TEXT_PRIMARY = colors.text;
const TEXT_SECONDARY = colors.textLight;
const TEXT_MUTED = '#999999';

interface AppRatingModalProps {
    isVisible: boolean;
    onClose: () => void;
    onExitApp?: () => void;
}

export default function AppRatingModal({ isVisible, onClose, onExitApp }: AppRatingModalProps) {
    const [step, setStep] = useState<'ask' | 'feedback'>('ask');
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        if (isVisible) {
            setStep('ask');
            setFeedback('');
        }
    }, [isVisible]);

    const tRating = {
        askTitle: 'Enjoying Pro Prompt?',
        askSub: 'Is this app helpful for creating AI image prompts?',
        loveIt: 'Yes, Love it! 💖',
        improve: 'Could be better 🛠️',
        
        feedbackTitle: 'We\'d love to improve!',
        feedbackSub: 'What can we do to make your experience better?',
        feedbackPlaceholder: 'Type your suggestion here...',
        submitBtn: 'Send Feedback 📩',
        thanksFeedback: 'Thanks for your feedback!',
        laterBtn: 'Maybe Later',
    };

    const handleLoveIt = async () => {
        try {
            await AsyncStorage.setItem(HAS_RATED_KEY, 'true');
            
            let reviewOpened = false;

            if (InAppReview.isAvailable()) {
                try {
                    const hasFlowFinished = await InAppReview.RequestInAppReview();
                    console.log('InAppReview result:', hasFlowFinished);
                    reviewOpened = true;
                } catch (error) {
                    console.log('InAppReview error:', error);
                }
            }

            if (!reviewOpened) {
                // Fallback: open Play Store page directly
                console.log('Opening Play Store URL...');
                await Linking.openURL(PLAY_STORE_URL).catch((err) => {
                    console.log('Could not open Play Store:', err);
                });
            }
        } catch (error) {
            console.log('Error triggering review:', error);
            try {
                await Linking.openURL(PLAY_STORE_URL);
            } catch (_) {}
        }
        
        onClose();
        if (onExitApp) onExitApp();
    };

    const handleImprove = () => {
        setStep('feedback');
    };

    const handleLater = async () => {
        try {
            await AsyncStorage.setItem(LAST_PROMPT_KEY, new Date().toISOString());
        } catch (error) {
            console.log('Error saving prompt state:', error);
        }
        onClose();
        if (onExitApp) onExitApp();
    };

    const handleSubmitFeedback = async () => {
        if (feedback.trim()) {
            try {
                const email = 'govindsingh4850@gmail.com';
                const subject = encodeURIComponent('Pro Prompt App Feedback');
                const body = encodeURIComponent(feedback.trim());
                
                Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`)
                    .catch(() => {
                        console.log('Could not open mail app');
                    });
            } catch (error) {
                console.log('Feedback mail error:', error);
            }
        }
        
        await AsyncStorage.setItem(LAST_PROMPT_KEY, new Date().toISOString());
        onClose();
        if (onExitApp) onExitApp();
    };

    const handleClose = () => {
        onClose();
        if (onExitApp) onExitApp();
    };

    if (!isVisible) return null;

    return (
        <Modal transparent animationType="fade" visible={isVisible} onRequestClose={handleClose}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                style={styles.overlay}
            >
                <View style={styles.modalContent}>
                    <TouchableOpacity style={styles.closeBtn} onPress={handleClose} activeOpacity={0.7}>
                        <Ionicons name="close" size={24} color={TEXT_SECONDARY} />
                    </TouchableOpacity>

                    {step === 'ask' && (
                        <View style={styles.innerContent}>
                            <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 105, 180, 0.15)' }]}>
                                <Ionicons name="heart" size={42} color={ACCENT} />
                            </View>
                            <Text style={styles.title}>{tRating.askTitle}</Text>
                            <Text style={styles.description}>{tRating.askSub}</Text>
                            
                            <TouchableOpacity style={styles.primaryBtn} onPress={handleLoveIt} activeOpacity={0.8}>
                                <Text style={styles.primaryBtnText}>{tRating.loveIt}</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity style={styles.secondaryBtn} onPress={handleImprove} activeOpacity={0.8}>
                                <Text style={styles.secondaryBtnText}>{tRating.improve}</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {step === 'feedback' && (
                        <View style={styles.innerContent}>
                            <View style={[styles.iconContainer, { backgroundColor: 'rgba(0, 150, 255, 0.15)' }]}>
                                <Ionicons name="construct" size={42} color="#0096FF" />
                            </View>
                            <Text style={styles.title}>{tRating.feedbackTitle}</Text>
                            <Text style={styles.description}>{tRating.feedbackSub}</Text>
                            
                            <TextInput
                                style={styles.input}
                                placeholder={tRating.feedbackPlaceholder}
                                placeholderTextColor={TEXT_MUTED}
                                multiline
                                numberOfLines={3}
                                value={feedback}
                                onChangeText={setFeedback}
                                returnKeyType="done"
                            />
                            
                            <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmitFeedback} activeOpacity={0.8}>
                                <Text style={styles.primaryBtnText}>{tRating.submitBtn}</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity style={styles.secondaryBtn} onPress={handleLater} activeOpacity={0.8}>
                                <Text style={styles.secondaryBtnText}>{tRating.laterBtn}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: Math.min(width - 48, 380),
        backgroundColor: SURFACE,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: BORDER_ACCENT,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    closeBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 4,
        zIndex: 1,
    },
    innerContent: {
        width: '100%',
        alignItems: 'center',
    },
    iconContainer: {
        width: 76,
        height: 76,
        borderRadius: 38,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: TEXT_PRIMARY,
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: TEXT_SECONDARY,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    primaryBtn: {
        backgroundColor: ACCENT,
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    primaryBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryBtn: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        backgroundColor: 'rgba(0,0,0,0.02)'
    },
    secondaryBtnText: {
        color: TEXT_SECONDARY,
        fontSize: 14,
        fontWeight: '500',
    },
    input: {
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderRadius: 12,
        padding: 12,
        color: TEXT_PRIMARY,
        fontSize: 14,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        marginBottom: 20,
        textAlignVertical: 'top',
        minHeight: 80,
    }
});
