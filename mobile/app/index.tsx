import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';
import LoadingScreen from '@/components/LoadingScreen';

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const [ hasNavigated, setHasNavigated ] = useState(false);

  useEffect(() => {
    // Add a small delay to ensure the layout is mounted
    const timer = setTimeout(() => {
      if (!isLoading && !hasNavigated) {
        setHasNavigated(true);
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/login');
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [ isAuthenticated, isLoading, hasNavigated ]);

  // Show loading screen while checking authentication
  return <LoadingScreen message="Initializing app..." />;
}
