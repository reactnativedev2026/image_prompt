import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import SpInAppUpdates, { IAUUpdateKind, IAUInstallStatus } from 'sp-react-native-in-app-updates';
import { colors } from '../theme/colors';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.imageprompt';
const LAST_PROMPT_KEY = 'LAST_UPDATE_PROMPT_DATE';

const ACCENT = colors.primaryDark;
const BORDER_ACCENT = colors.border;
const SURFACE = colors.surface;
const TEXT_PRIMARY = colors.text;
const TEXT_SECONDARY = colors.textLight;
const TEXT_MUTED = '#999999';

let inAppUpdatesInstance: SpInAppUpdates | null = null;

const getInAppUpdates = () => {
    if (!inAppUpdatesInstance) {
        try {
            inAppUpdatesInstance = new SpInAppUpdates(false);
        } catch (e) {
            console.log('Error initializing SpInAppUpdates:', e);
            return null;
        }
    }
    return inAppUpdatesInstance;
};

export default function AppUpdateModal() {
    const [visible, setVisible] = useState(false);
    const [storeVersion, setStoreVersion] = useState<string | null>(null);

    useEffect(() => {
        checkUpdate();

        let listenerObj: any = null;
        if (Platform.OS === 'android') {
            listenerObj = (status: any) => {
                if (status && status.status === IAUInstallStatus.DOWNLOADED) {
                    Alert.alert(
                        "Update Ready",
                        "An update has been downloaded. Restart the app to apply?",
                        [
                            { text: "Later", style: "cancel" },
                            {
                                text: "Restart",
                                onPress: () => {
                                    const instance = getInAppUpdates();
                                    if (instance) instance.installUpdate();
                                }
                            }
                        ],
                        { cancelable: true }
                    );
                }
            };
            try {
                const instance = getInAppUpdates();
                if (instance) {
                    instance.addStatusUpdateListener(listenerObj);
                }
            } catch (e) {
                console.log('Error adding update listener:', e);
            }
        }

        return () => {
            if (Platform.OS === 'android' && listenerObj) {
                try {
                    const instance = getInAppUpdates();
                    if (instance) {
                        instance.removeStatusUpdateListener(listenerObj);
                    }
                } catch (e) {
                    console.log('Error removing update listener:', e);
                }
            }
        };
    }, []);

    const checkUpdate = async () => {
        if (Platform.OS !== 'android') return;

        try {
            const instance = getInAppUpdates();
            if (!instance) return;

            const lastPrompt = await AsyncStorage.getItem(LAST_PROMPT_KEY);
            const today = new Date().toDateString();

            if (lastPrompt === today && !__DEV__) {
                return;
            }

            const response = await instance.checkNeedsUpdate();

            if (response && response.shouldUpdate) {
                setStoreVersion(response.storeVersion || null);
                setVisible(true);
            }
        } catch (error) {
            console.log("Error checking for update:", error);
        }
    };

    const handleClose = async () => {
        const today = new Date().toDateString();
        await AsyncStorage.setItem(LAST_PROMPT_KEY, today);
        if (__DEV__) {
            await AsyncStorage.setItem(LAST_PROMPT_KEY + '_DEV', today);
        }
        setVisible(false);
    };

    const handleUpdate = () => {
        handleClose();
        if (Platform.OS === 'android') {
            try {
                const instance = getInAppUpdates();
                if (instance) {
                    instance.startUpdate({ updateType: IAUUpdateKind.FLEXIBLE });
                } else {
                    Linking.openURL(PLAY_STORE_URL);
                }
            } catch (e) {
                Linking.openURL(PLAY_STORE_URL);
            }
        } else {
            Linking.openURL(PLAY_STORE_URL);
        }
    };

    if (!visible) return null;

    return (
        <Modal transparent animationType="fade" visible={visible} onRequestClose={handleClose}>
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <TouchableOpacity style={styles.closeBtn} onPress={handleClose} activeOpacity={0.7}>
                        <Ionicons name="close" size={24} color={TEXT_SECONDARY} />
                    </TouchableOpacity>

                    <View style={styles.iconContainer}>
                        <Ionicons name="rocket" size={48} color={ACCENT} />
                    </View>

                    <Text style={styles.title}>
                        New Update Available!
                    </Text>

                    <Text style={styles.description}>
                        A new version of the app is available. Please update today for a better experience.
                    </Text>

                    {storeVersion && (
                        <Text style={styles.versionText}>
                            New Version: {storeVersion}
                        </Text>
                    )}

                    <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate} activeOpacity={0.8}>
                        <Text style={styles.updateBtnText}>
                            Update Now
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
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
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 107, 53, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: TEXT_PRIMARY,
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: 15,
        color: TEXT_SECONDARY,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 20,
    },
    versionText: {
        fontSize: 14,
        color: TEXT_MUTED,
        marginBottom: 24,
        fontWeight: '500',
    },
    updateBtn: {
        backgroundColor: ACCENT,
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    updateBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
