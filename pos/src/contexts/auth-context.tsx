import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface User {
    id: string;
    email: string;
    name: string;
    isVerified: boolean;
    createdAt?: string;
}

interface AuthContextType {
    user: User | null;
    login: (userData: User, tokens?: { accessToken: string; refreshToken: string }) => void;
    logout: () => void;
    isLoading: boolean;
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
        const storedUser = localStorage.getItem('user');
        const storedTokens = localStorage.getItem('tokens');

        if (storedUser && storedTokens) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('tokens');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (userData: User, tokens?: { accessToken: string; refreshToken: string }) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));

        if (tokens) {
            localStorage.setItem('tokens', JSON.stringify(tokens));
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('tokens');
    };

    const value: AuthContextType = {
        user,
        login,
        logout,
        isLoading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

