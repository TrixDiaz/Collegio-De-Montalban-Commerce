import React, { createContext, useContext, useState, useEffect, type ReactNode, useRef } from 'react';
import api from '@/services/api';

interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    isDropdownOpen: boolean;
    setIsDropdownOpen: (open: boolean) => void;
    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [ notifications, setNotifications ] = useState<Notification[]>([]);
    const [ unreadCount, setUnreadCount ] = useState(0);
    const [ loading, setLoading ] = useState(false);
    const [ isDropdownOpen, setIsDropdownOpen ] = useState(false);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/notifications');
            if (response.data.success) {
                setNotifications(response.data.notifications);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/notifications/unread-count');
            if (response.data.success) {
                setUnreadCount(response.data.unreadCount);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === id
                        ? { ...notification, isRead: true }
                        : notification
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/mark-all-read');
            setNotifications(prev =>
                prev.map(notification => ({ ...notification, isRead: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(notification => notification.id !== id));
            // Check if the deleted notification was unread
            const deletedNotification = notifications.find(n => n.id === id);
            if (deletedNotification && !deletedNotification.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const refreshNotifications = async () => {
        await Promise.all([ fetchNotifications(), fetchUnreadCount() ]);
    };

    // Start polling when dropdown is open
    const startPolling = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        // Poll every 10 seconds when dropdown is open
        pollingIntervalRef.current = setInterval(async () => {
            await Promise.all([ fetchNotifications(), fetchUnreadCount() ]);
        }, 10000);
    };

    // Stop polling when dropdown is closed
    const stopPolling = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    };

    // Handle dropdown open/close
    const handleDropdownToggle = (open: boolean) => {
        setIsDropdownOpen(open);
        if (open) {
            // Fetch immediately when opened
            refreshNotifications();
            startPolling();
        } else {
            stopPolling();
        }
    };

    useEffect(() => {
        // Initial fetch
        refreshNotifications();

        // General polling for unread count every 30 seconds (when dropdown is closed)
        const generalInterval = setInterval(fetchUnreadCount, 30000);

        return () => {
            clearInterval(generalInterval);
            stopPolling();
        };
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopPolling();
        };
    }, []);

    const value: NotificationContextType = {
        notifications,
        unreadCount,
        loading,
        isDropdownOpen,
        setIsDropdownOpen: handleDropdownToggle,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
