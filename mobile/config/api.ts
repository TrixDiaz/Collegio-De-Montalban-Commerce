// Global API Configuration
// This will be dynamically set by the user in the app
let GLOBAL_API_BASE_URL = 'https://tile-depot-backend.onrender.com/api/v1';

// Setter for the API URL (called after user configures it)
export const setGlobalApiUrl = (url: string) => {
    GLOBAL_API_BASE_URL = url;
};

// Getter for the API URL
export const getGlobalApiUrl = () => {
    return GLOBAL_API_BASE_URL;
};

// Export for backward compatibility
export { GLOBAL_API_BASE_URL };

// API Configuration
export const API_CONFIG = {
    // Request timeout in milliseconds
    TIMEOUT: 10000,

    // Retry configuration
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
};

// Helper function to get the correct API URL
export const getApiUrl = () => {
    console.log('🔧 getApiUrl called, GLOBAL_API_BASE_URL:', GLOBAL_API_BASE_URL);
    console.log('🔧 __DEV__:', __DEV__);

    // In development, you might want to use your computer's IP address
    // instead of localhost for testing on physical devices
    if (__DEV__) {
        console.log('🔧 Returning GLOBAL_API_BASE_URL:', GLOBAL_API_BASE_URL);
        return GLOBAL_API_BASE_URL;
    }

    console.log('🔧 Returning GLOBAL_API_BASE_URL (production):', GLOBAL_API_BASE_URL);
    return GLOBAL_API_BASE_URL;
};
