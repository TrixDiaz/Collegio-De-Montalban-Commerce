import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { router } from 'expo-router';
import LoadingScreen from '@/components/LoadingScreen';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        // Add a small delay to ensure proper navigation timing
        const timer = setTimeout(() => {
            if (!isLoading && !isAuthenticated) {
                router.replace('/login');
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [ isAuthenticated, isLoading ]);

    if (isLoading) {
        return <LoadingScreen message="Loading..." />;
    }

    if (!isAuthenticated) {
        return <LoadingScreen message="Redirecting to login..." />;
    }

    return <>{children}</>;
}
