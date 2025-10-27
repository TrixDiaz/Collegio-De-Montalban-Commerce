import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { apiConfig } from '@/utils/apiConfig';
import { setGlobalApiUrl } from '@/config/api';
import { apiService } from '@/services/api';

export default function ServerConfigScreen() {
    const [ serverUrl, setServerUrl ] = useState('');
    const [ isLoading, setIsLoading ] = useState(false);
    const [ isTesting, setIsTesting ] = useState(false);

    // Load saved URL on mount
    React.useEffect(() => {
        const loadSavedUrl = async () => {
            try {
                const savedUrl = await apiConfig.getApiUrl();
                if (savedUrl) {
                    setServerUrl(savedUrl.replace('/api/v1', '')); // Remove /api/v1 for display
                }
            } catch (error) {
                console.error('Error loading saved URL:', error);
            }
        };
        loadSavedUrl();
    }, []);

    const handleTestConnection = async () => {
        if (!serverUrl.trim()) {
            Alert.alert('Error', 'Please enter a server URL');
            return;
        }

        // Ensure URL starts with http
        let testUrl = serverUrl.trim();
        if (!testUrl.startsWith('http')) {
            testUrl = `http://${testUrl}`;
        }

        setIsTesting(true);
        try {
            // Set the URL temporarily for testing
            const fullApiUrl = testUrl.endsWith('/api/v1') ? testUrl : `${testUrl}/api/v1`;
            setGlobalApiUrl(fullApiUrl);

            // Test the connection
            const result = await apiService.testConnection();

            if (result.success) {
                Alert.alert('Success', 'Connection successful!');
            } else {
                Alert.alert('Error', result.message || 'Connection failed');
            }
        } catch (error: any) {
            Alert.alert('Connection Error', error.message || 'Failed to connect to server. Please check the URL and ensure the server is running.');
        } finally {
            setIsTesting(false);
        }
    };

    const handleConnect = async () => {
        if (!serverUrl.trim()) {
            Alert.alert('Error', 'Please enter a server URL');
            return;
        }

        setIsLoading(true);
        try {
            // Ensure URL starts with http
            let cleanUrl = serverUrl.trim();
            if (!cleanUrl.startsWith('http')) {
                cleanUrl = `http://${cleanUrl}`;
            }

            // Save the URL
            await apiConfig.setApiUrl(cleanUrl);

            // Update the global URL
            const fullApiUrl = cleanUrl.endsWith('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;
            setGlobalApiUrl(fullApiUrl);

            // Test connection before proceeding
            const result = await apiService.testConnection();

            if (result.success) {
                // Navigate to login
                router.replace('/login');
            } else {
                Alert.alert('Connection Failed', 'Could not connect to the server. Please check the URL and try again.');
            }
        } catch (error: any) {
            console.error('Connect error:', error);
            Alert.alert('Error', error.message || 'Failed to configure server. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <Text style={styles.emoji}>⚙️</Text>
                            <Text style={styles.title}>Server Configuration</Text>
                            <Text style={styles.subtitle}>
                                Enter your backend server IP address or URL to connect
                            </Text>
                        </View>

                        <View style={styles.form}>
                            <Text style={styles.label}>Server Address</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., 192.168.1.21:5000 or example.com:5000"
                                value={serverUrl}
                                onChangeText={setServerUrl}
                                autoCapitalize="none"
                                autoCorrect={false}
                                keyboardType="default"
                                editable={!isLoading && !isTesting}
                            />
                            <Text style={styles.hint}>
                                Example: 192.168.1.21:5000
                            </Text>

                            <View style={styles.buttonGroup}>
                                <TouchableOpacity
                                    style={[ styles.button, styles.testButton, (isLoading || isTesting) && styles.buttonDisabled ]}
                                    onPress={handleTestConnection}
                                    disabled={isLoading || isTesting}
                                >
                                    {isTesting ? (
                                        <ActivityIndicator size="small" color="#ffffff" />
                                    ) : (
                                        <Text style={styles.testButtonText}>Test Connection</Text>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[ styles.button, styles.connectButton, (isLoading || isTesting) && styles.buttonDisabled ]}
                                    onPress={handleConnect}
                                    disabled={isLoading || isTesting}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color="#ffffff" />
                                    ) : (
                                        <Text style={styles.connectButtonText}>Connect</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.infoBox}>
                            <Text style={styles.infoTitle}>ℹ️ Information</Text>
                            <Text style={styles.infoText}>
                                • The app will automatically append "/api/v1" to your URL{'\n'}
                                • Make sure your device is on the same network as the server{'\n'}
                                • The server must be running and accessible
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    content: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    emoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    form: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        backgroundColor: '#f9fafb',
        marginBottom: 8,
    },
    hint: {
        fontSize: 14,
        color: '#9ca3af',
        marginBottom: 24,
    },
    buttonGroup: {
        gap: 12,
    },
    button: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    testButton: {
        backgroundColor: '#6b7280',
    },
    connectButton: {
        backgroundColor: '#3b82f6',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    testButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    connectButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    infoBox: {
        backgroundColor: '#eff6ff',
        borderRadius: 12,
        padding: 16,
        marginTop: 24,
        borderLeftWidth: 4,
        borderLeftColor: '#3b82f6',
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#4b5563',
        lineHeight: 20,
    },
});
