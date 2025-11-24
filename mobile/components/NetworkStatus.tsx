import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { apiService } from '@/services/api';

interface NetworkStatusProps {
    onRetry?: () => void;
}

export default function NetworkStatus({ onRetry }: NetworkStatusProps) {
    const [ isOnline, setIsOnline ] = useState(true);
    const [ isChecking, setIsChecking ] = useState(false);

    const checkConnection = async () => {
        setIsChecking(true);
        try {
            // Try to make a simple request to check if backend is reachable
            await apiService.healthCheck();
            setIsOnline(true);
        } catch (error) {
            console.error('Network check failed:', error);
            setIsOnline(false);
        } finally {
            setIsChecking(false);
        }
    };

    useEffect(() => {
        checkConnection();
    }, []);

    if (isOnline) {
        return null; // Don't show anything if online
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Connection Error</Text>
                <Text style={styles.message}>
                    Unable to connect to the server. Please check:
                </Text>
                <View style={styles.checklist}>
                    <Text style={styles.checkItem}>• Your internet connection</Text>
                    <Text style={styles.checkItem}>• Backend server is running</Text>
                </View>
                <TouchableOpacity
                    style={[ styles.retryButton, isChecking && styles.retryButtonDisabled ]}
                    onPress={checkConnection}
                    disabled={isChecking}
                >
                    <Text style={styles.retryButtonText}>
                        {isChecking ? 'Checking...' : 'Retry Connection'}
                    </Text>
                </TouchableOpacity>
                {onRetry && (
                    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                        <Text style={styles.retryButtonText}>Retry Action</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    content: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 24,
        margin: 20,
        maxWidth: 300,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ef4444',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 16,
        textAlign: 'center',
    },
    checklist: {
        marginBottom: 20,
    },
    checkItem: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
    },
    retryButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginBottom: 8,
    },
    retryButtonDisabled: {
        backgroundColor: '#9ca3af',
    },
    retryButtonText: {
        color: 'white',
        fontWeight: '600',
        textAlign: 'center',
    },
});
