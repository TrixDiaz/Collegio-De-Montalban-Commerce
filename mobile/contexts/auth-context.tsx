import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { router } from 'expo-router';
import { apiService } from '@/services/api';

interface User {
    id: string;
    email: string;
    name: string;
    isVerified: boolean;
    createdAt: string;
}

interface AuthContextType {
    user: User | null;
    login: (userData: User, tokens: { accessToken: string; refreshToken: string }) => void;
    logout: () => void;
    isLoading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [ user, setUser ] = useState<User | null>(null);
    const [ isLoading, setIsLoading ] = useState(true);

    useEffect(() => {
        // Check for stored user data and tokens on mount
        const checkAuthStatus = async () => {
            try {
                console.log('🔍 Checking auth status...');
                console.log('🔍 Is authenticated:', apiService.isAuthenticated);

                // Only try to get profile if we have tokens
                if (apiService.isAuthenticated) {
                    try {
                        console.log('🔍 Fetching user profile...');
                        const userData = await apiService.getProfile();
                        if (userData) {
                            console.log('✅ User profile fetched successfully');
                            setUser(userData);
                            // Don't navigate here, let the index screen handle it
                            return;
                        }
                    } catch (profileError) {
                        console.log('❌ Profile fetch failed, user not authenticated:', profileError);
                        // Clear any invalid tokens
                        apiService.logout();
                    }
                } else {
                    console.log('🔍 No authentication token found');
                }
            } catch (error) {
                console.error('❌ Error checking auth status:', error);
                // Clear tokens if profile fetch fails
                apiService.logout();
            }

            // Always set loading to false
            console.log('🔍 Setting loading to false');
            setIsLoading(false);
        };

        // Add a fallback timeout to ensure loading never hangs
        const fallbackTimeout = setTimeout(() => {
            console.log('⚠️ Auth check timeout - forcing loading to false');
            setIsLoading(false);
        }, 15000); // 15 second fallback timeout

        checkAuthStatus().finally(() => {
            clearTimeout(fallbackTimeout);
        });
    }, []);

    const login = (userData: User, tokens: { accessToken: string; refreshToken: string }) => {
        setUser(userData);
        apiService.saveTokens(tokens.accessToken, tokens.refreshToken);
    };

    const logout = () => {
        setUser(null);
        apiService.logout();
    };

    const value: AuthContextType = {
        user,
        login,
        logout,
        isLoading,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
