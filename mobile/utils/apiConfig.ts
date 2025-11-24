import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL_KEY = 'api_base_url';
const DEFAULT_API_URL = 'https://tile-depot-backend-production.up.railway.app/api/v1';

export const apiConfig = {
    // Get the stored API URL or return empty string
    async getApiUrl(): Promise<string> {
        try {
            const storedUrl = await AsyncStorage.getItem(API_URL_KEY);
            return storedUrl || '';
        } catch (error) {
            console.error('Error getting API URL:', error);
            return '';
        }
    },

    // Save the API URL
    async setApiUrl(url: string): Promise<void> {
        try {
            // Validate URL format
            if (!url || !url.startsWith('http')) {
                throw new Error('Invalid URL format');
            }

            // Ensure URL ends with /api/v1
            let cleanUrl = url.trim();
            if (!cleanUrl.endsWith('/api/v1')) {
                if (cleanUrl.endsWith('/')) {
                    cleanUrl = cleanUrl.slice(0, -1);
                }
                cleanUrl = `${cleanUrl}/api/v1`;
            }

            await AsyncStorage.setItem(API_URL_KEY, cleanUrl);
            console.log('✅ API URL saved:', cleanUrl);
        } catch (error) {
            console.error('Error setting API URL:', error);
            throw error;
        }
    },

    // Check if API URL is configured
    async isConfigured(): Promise<boolean> {
        try {
            const url = await AsyncStorage.getItem(API_URL_KEY);
            return !!url;
        } catch (error) {
            return false;
        }
    },

    // Reset to default
    async reset(): Promise<void> {
        try {
            await AsyncStorage.removeItem(API_URL_KEY);
        } catch (error) {
            console.error('Error resetting API URL:', error);
        }
    },
};
