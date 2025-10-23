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

                // Check if we have valid tokens
                const hasValidTokens = await apiService.checkAuthStatus();
                console.log('🔍 Has valid tokens:', hasValidTokens);

                // Only try to get profile if we have tokens
                if (hasValidTokens) {
                    try {
                        console.log('🔍 Fetching user profile...');
                        const userData = await apiService.getProfile();
                        if (userData) {
                            console.log('✅ User profile fetched successfully');
                            setUser(userData);
                            // Set loading to false after successful authentication
                            setIsLoading(false);
                            return;
                        }
                    } catch (profileError) {
                        console.log('❌ Profile fetch failed, user not authenticated:', profileError);
                        // Clear any invalid tokens
                        await apiService.clearTokens();
                    }
                } else {
                    console.log('🔍 No authentication token found');
                }
            } catch (error) {
                console.error('❌ Error checking auth status:', error);
                // Clear tokens if profile fetch fails
                await apiService.clearTokens();
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

    const login = async (userData: User, tokens: { accessToken: string; refreshToken: string }) => {
        setUser(userData);
        await apiService.saveTokens(tokens.accessToken, tokens.refreshToken);
    };

    const logout = async () => {
        setUser(null);
        await apiService.clearTokens();
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
