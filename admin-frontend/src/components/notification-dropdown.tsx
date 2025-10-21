import React, { useState } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/contexts/notification-context';
import { formatDistanceToNow } from 'date-fns';

export const NotificationDropdown: React.FC = () => {
    const {
        notifications,
        unreadCount,
        isDropdownOpen,
        setIsDropdownOpen,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    } = useNotifications();

    const [ deletingIds, setDeletingIds ] = useState<Set<string>>(new Set());

    const handleMarkAsRead = async (id: string) => {
        await markAsRead(id);
    };

    const handleDelete = async (id: string) => {
        // Add to deleting set for visual feedback
        setDeletingIds(prev => new Set(prev).add(id));

        // Add a delay before actually deleting
        setTimeout(async () => {
            await deleteNotification(id);
            // Remove from deleting set
            setDeletingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }, 300); // 300ms delay for smooth transition
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
    };

    const formatTime = (dateString: string) => {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    };

    return (
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between p-4">
                    <h3 className="font-semibold">Notifications</h3>
                    {notifications.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            className="text-xs"
                        >
                            Mark all read
                        </Button>
                    )}
                </div>

                <DropdownMenuSeparator />

                <ScrollArea className="h-96">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <Bell className="h-8 w-8 mb-2" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {notifications.map((notification, index) => {
                                const isDeleting = deletingIds.has(notification.id);
                                return (
                                    <div
                                        key={notification.id}
                                        className={`p-4 border-b last:border-b-0 hover:bg-accent transition-all duration-300 ease-in-out ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                                            } ${isDeleting
                                                ? 'opacity-50 scale-95 bg-red-50 dark:bg-red-950/20 transform translate-x-2'
                                                : 'opacity-100 scale-100 transform translate-x-0'
                                            }`}
                                        style={{
                                            animationDelay: `${index * 50}ms`,
                                            animation: 'slideInFromTop 0.3s ease-out'
                                        }}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-medium text-sm truncate">
                                                        {notification.title}
                                                    </h4>
                                                    {!notification.isRead && (
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatTime(notification.createdAt)}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-1 ml-2">
                                                {!notification.isRead && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                    >
                                                        <Check className="h-3 w-3" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={`h-6 w-6 text-destructive hover:text-destructive transition-all duration-200 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                                                        }`}
                                                    onClick={() => handleDelete(notification.id)}
                                                    disabled={isDeleting}
                                                >
                                                    <Trash2 className={`h-3 w-3 ${isDeleting ? 'animate-pulse' : ''}`} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
