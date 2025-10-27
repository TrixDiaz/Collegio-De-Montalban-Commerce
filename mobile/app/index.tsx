import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';
import LoadingScreen from '@/components/LoadingScreen';
import { apiConfig } from '@/utils/apiConfig';
import { setGlobalApiUrl } from '@/config/api';

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const [ hasNavigated, setHasNavigated ] = useState(false);
  const [ isCheckingConfig, setIsCheckingConfig ] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if API URL is configured
        const isConfigured = await apiConfig.isConfigured();

        if (!isConfigured) {
          // If not configured, navigate to server config screen
          console.log('⚙️ API URL not configured, showing configuration screen');
          setIsCheckingConfig(false);
          setTimeout(() => {
            router.replace('/server-config');
          }, 100);
          return;
        }

        // Load the API URL from storage and set it globally
        const apiUrl = await apiConfig.getApiUrl();

        // If still no URL, show config screen
        if (!apiUrl) {
          console.log('⚙️ No API URL found, showing configuration screen');
          setIsCheckingConfig(false);
          setTimeout(() => {
            router.replace('/server-config');
          }, 100);
          return;
        }

        setGlobalApiUrl(apiUrl);
        console.log('✅ API URL initialized:', apiUrl);
      } catch (error) {
        console.error('Error initializing API URL:', error);
      } finally {
        setIsCheckingConfig(false);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    // Add a small delay to ensure the layout is mounted
    const timer = setTimeout(() => {
      if (!isLoading && !isCheckingConfig && !hasNavigated) {
        setHasNavigated(true);
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/login');
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [ isAuthenticated, isLoading, hasNavigated, isCheckingConfig ]);

  // Show loading screen while checking configuration and authentication
  return <LoadingScreen message="Initializing app..." />;
}
