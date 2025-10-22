// API Configuration
export const API_CONFIG = {
    // Change this to your backend server URL
    // BASE_URL: 'http://localhost:5000/api', // Use localhost for Expo tunnel
    BASE_URL: 'http://192.168.1.64:5000/api', // Use your computer's IP for device testing

    // Alternative URLs for different environments
    // BASE_URL: 'http://localhost:5000/api', // For simulator only
    // BASE_URL: 'https://your-backend-domain.com/api', // For production

    // Request timeout in milliseconds
    TIMEOUT: 10000,

    // Retry configuration
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
};

// Helper function to get the correct API URL
export const getApiUrl = () => {
    console.log('🔧 getApiUrl called, API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL);
    console.log('🔧 __DEV__:', __DEV__);

    // In development, you might want to use your computer's IP address
    // instead of localhost for testing on physical devices
    if (__DEV__) {
        // Uncomment and replace with your computer's IP address for device testing
        // return 'http://192.168.1.100:5000/api';
        console.log('🔧 Returning API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL);
        return API_CONFIG.BASE_URL;
    }

    console.log('🔧 Returning API_CONFIG.BASE_URL (production):', API_CONFIG.BASE_URL);
    return API_CONFIG.BASE_URL;
};
