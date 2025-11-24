import { useState, useEffect, useCallback } from "react";
import { useAuth, type User } from "@/contexts/auth-context";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import React from "react";
import {
    UserCircle,
    Package,
    Clock,
    CheckCircle,
    Star,
    XCircle,
    Bell,
    FileText,
    HelpCircle,
    LogOut,
    DollarSign,
    ChevronDown,
    ChevronRight,
    X
} from "lucide-react";
import { Link } from "react-router-dom";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import { ReviewForm } from "@/components/ReviewForm";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface SidebarItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href?: string;
    onClick?: () => void;
    badge?: number;
}

interface SaleItem {
    id: string;
    name: string;
    price: number;
    discountPrice?: number;
    quantity: number;
    thumbnail: string;
    brand: string;
    category: string;
}

interface Sale {
    id: string;
    orderNumber: string;
    items: SaleItem[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    paymentMethod: string;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    shippingAddress?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

const AccountPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [ searchParams ] = useSearchParams();
    const [ activeSection, setActiveSection ] = useState("profile");
    const [ sales, setSales ] = useState<Sale[]>([]);
    const [ loading, setLoading ] = useState(false);
    const [ expandedRows, setExpandedRows ] = useState<Set<string>>(new Set());
    const [ notifications, setNotifications ] = useState<Array<{
        id: string;
        title: string;
        message: string;
        isRead: boolean;
        createdAt: string;
    }>>([]);
    const [ unreadCount, setUnreadCount ] = useState(0);
    const [ reviewableItems, setReviewableItems ] = useState<Array<{
        saleId: string;
        orderNumber: string;
        productId: string;
        productName: string;
        productThumbnail: string;
        deliveredAt: string;
    }>>([]);
    const [ showReviewForm, setShowReviewForm ] = useState(false);
    const [ selectedReviewItem, setSelectedReviewItem ] = useState<{
        saleId: string;
        orderNumber: string;
        productId: string;
        productName: string;
        productThumbnail: string;
        deliveredAt: string;
    } | null>(null);
    const [ showCancelDialog, setShowCancelDialog ] = useState(false);
    const [ orderToCancel, setOrderToCancel ] = useState<{
        id: string;
        orderNumber: string;
    } | null>(null);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    // Handle URL parameters and fetch sales
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) {
            setActiveSection(tab);
        }
    }, [ searchParams ]);

    const fetchSales = useCallback(async (status?: string) => {
        if (!user) return;

        setLoading(true);
        try {
            const response = await apiService.getUserSales({ status }) as { success: boolean; sales: Sale[] };
            if (response.success) {
                setSales(response.sales);
            }
        } catch (error) {
            console.error('Error fetching sales:', error);
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    }, [ user ]);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;

        try {
            const response = await apiService.getNotifications() as {
                success: boolean; notifications: Array<{
                    id: string;
                    title: string;
                    message: string;
                    isRead: boolean;
                    createdAt: string;
                }>
            };
            if (response.success) {
                setNotifications(response.notifications);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }, [ user ]);

    const fetchUnreadCount = useCallback(async () => {
        if (!user) return;

        try {
            const response = await apiService.getUnreadCount() as { success: boolean; unreadCount: number };
            if (response.success) {
                setUnreadCount(response.unreadCount);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    }, [ user ]);

    const fetchUserProfile = useCallback(async () => {
        if (!user) return;

        try {
            const response = await apiService.getUserProfile() as { success: boolean; user: User };
            if (response.success) {
                // Update user data in localStorage and context
                const updatedUser = { ...user, ...response.user };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                // Note: We can't directly update the context here, but the user will see updated data on next login
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    }, [ user ]);

    const fetchReviewableItems = useCallback(async () => {
        if (!user) return;

        try {
            const response = await apiService.getReviewableOrders() as {
                success: boolean; reviewableItems: Array<{
                    saleId: string;
                    orderNumber: string;
                    productId: string;
                    productName: string;
                    productThumbnail: string;
                    deliveredAt: string;
                }>
            };
            if (response.success) {
                setReviewableItems(response.reviewableItems);
            }
        } catch (error) {
            console.error('Error fetching reviewable items:', error);
        }
    }, [ user ]);

    useEffect(() => {
        if (activeSection === 'orders' && user) {
            fetchSales();
        }
        if (activeSection === 'notifications' && user) {
            fetchNotifications();
        }
        if (user) {
            fetchUnreadCount();
            fetchUserProfile();
        }
        if (activeSection === 'reviews' && user) {
            fetchReviewableItems();
        }
    }, [ activeSection, user, fetchSales, fetchNotifications, fetchUnreadCount, fetchUserProfile, fetchReviewableItems ]);

    const toggleRowExpansion = (saleId: string) => {
        const newExpandedRows = new Set(expandedRows);
        if (newExpandedRows.has(saleId)) {
            newExpandedRows.delete(saleId);
        } else {
            newExpandedRows.add(saleId);
        }
        setExpandedRows(newExpandedRows);
    };

    const markNotificationAsRead = async (notificationId: string) => {
        try {
            await apiService.markNotificationAsRead(notificationId);
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId ? { ...notif, isRead: true } : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleCancelOrderClick = (saleId: string, orderNumber: string) => {
        setOrderToCancel({ id: saleId, orderNumber });
        setShowCancelDialog(true);
    };

    const handleCancelOrder = async () => {
        if (!orderToCancel) return;

        try {
            await apiService.cancelSale(orderToCancel.id);
            toast.success('Order cancelled successfully');
            // Refresh the sales data
            fetchSales();
            // Close dialog
            setShowCancelDialog(false);
            setOrderToCancel(null);
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast.error('Failed to cancel order');
        }
    };

    const handleCancelDialogClose = () => {
        setShowCancelDialog(false);
        setOrderToCancel(null);
    };

    const handleWriteReview = (item: {
        saleId: string;
        orderNumber: string;
        productId: string;
        productName: string;
        productThumbnail: string;
        deliveredAt: string;
    }) => {
        setSelectedReviewItem(item);
        setShowReviewForm(true);
    };

    const handleReviewSubmitted = () => {
        setShowReviewForm(false);
        setSelectedReviewItem(null);
        fetchReviewableItems();
        toast.success('Review submitted successfully!');
    };

    const handleCancelReview = () => {
        setShowReviewForm(false);
        setSelectedReviewItem(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return Clock;
            case 'confirmed': return CheckCircle;
            case 'shipped': return Package;
            case 'delivered': return CheckCircle;
            case 'cancelled': return XCircle;
            default: return Clock;
        }
    };

    const sidebarItems: SidebarItem[] = [
        {
            id: "profile",
            label: "My Account",
            icon: UserCircle,
        },
        {
            id: "orders",
            label: "All Orders",
            icon: Package,
        },
        {
            id: "pending",
            label: "Pending",
            icon: Clock,
        },
        {
            id: "received",
            label: "Received",
            icon: CheckCircle,
        },
        {
            id: "reviews",
            label: "Reviews",
            icon: Star,
        },
        {
            id: "cancelled",
            label: "Cancelled",
            icon: XCircle,
        },
        {
            id: "notifications",
            label: "Notifications",
            icon: Bell,
            badge: unreadCount > 0 ? unreadCount : undefined,
        },
        {
            id: "terms",
            label: "Terms & Policies",
            icon: FileText,
        },
        {
            id: "help",
            label: "Help Center",
            icon: HelpCircle,
        },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case "profile":
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold">My Account</h2>
                            <p className="text-muted-foreground">Manage your account information</p>
                        </div>

                        <Card className="p-6">
                            <div className="flex items-center space-x-4 mb-6">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={user?.picture} />
                                    <AvatarFallback className="text-2xl">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-xl font-semibold">{user?.name}</h3>
                                    <p className="text-muted-foreground">{user?.email}</p>
                                    <p className="text-sm text-green-600">Verified Account</p>
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                    <p className="text-lg">{user?.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                                    <p className="text-lg">{user?.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Account Status</label>
                                    <p className="text-lg text-green-600">Active</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                                    <p className="text-lg">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                );

            case "orders":
            case "pending":
            case "received":
            case "cancelled": {
                const getSectionTitle = () => {
                    switch (activeSection) {
                        case 'pending': return 'Pending Orders';
                        case 'received': return 'Delivered Orders';
                        case 'cancelled': return 'Cancelled Orders';
                        default: return 'All Orders';
                    }
                };

                const getSectionDescription = () => {
                    switch (activeSection) {
                        case 'pending': return 'Orders that are being processed';
                        case 'received': return 'Orders that have been delivered';
                        case 'cancelled': return 'Orders that have been cancelled';
                        default: return 'View and manage your orders';
                    }
                };

                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold">{getSectionTitle()}</h2>
                            <p className="text-muted-foreground">{getSectionDescription()}</p>
                        </div>

                        {loading ? (
                            <Card className="p-6">
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                    <p className="text-muted-foreground">Loading orders...</p>
                                </div>
                            </Card>
                        ) : sales.length === 0 ? (
                            <Card className="p-6">
                                <div className="text-center py-8">
                                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                                    <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
                                    <Link to="/catalog">
                                        <Button>Start Shopping</Button>
                                    </Link>
                                </div>
                            </Card>
                        ) : (
                            <Card>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order #</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Items</TableHead>
                                            <TableHead>Total</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sales.map((sale) => {
                                            const StatusIcon = getStatusIcon(sale.status);
                                            const isExpanded = expandedRows.has(sale.id);

                                            return (
                                                <React.Fragment key={sale.id}>
                                                    <TableRow>
                                                        <TableCell className="font-medium">
                                                            {sale.orderNumber}
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(sale.createdAt).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex -space-x-2">
                                                                    {sale.items.slice(0, 3).map((item, index) => (
                                                                        <div key={index} className="w-8 h-8 rounded-full border-2 border-background overflow-hidden">
                                                                            <img
                                                                                src={getImageUrl(item.thumbnail)}
                                                                                alt={item.name}
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                    {sale.items.length > 3 && (
                                                                        <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                                                                            +{sale.items.length - 3}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <span className="text-sm text-muted-foreground">
                                                                    {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            ₱{Number(sale.total).toFixed(2)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={getStatusColor(sale.status)}>
                                                                <StatusIcon className="h-3 w-3 mr-1" />
                                                                {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => toggleRowExpansion(sale.id)}
                                                                >
                                                                    {isExpanded ? (
                                                                        <ChevronDown className="h-4 w-4" />
                                                                    ) : (
                                                                        <ChevronRight className="h-4 w-4" />
                                                                    )}
                                                                    {isExpanded ? 'Hide' : 'View'} Details
                                                                </Button>
                                                                {sale.status === 'pending' && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="text-red-600 hover:text-red-700"
                                                                        onClick={() => handleCancelOrderClick(sale.id, sale.orderNumber)}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                    {isExpanded && (
                                                        <TableRow>
                                                            <TableCell colSpan={6} className="p-0">
                                                                <div className="p-6 bg-muted/30">
                                                                    <div className="space-y-4">
                                                                        {/* Order Items */}
                                                                        <div>
                                                                            <h4 className="font-semibold mb-3">Order Items</h4>
                                                                            <div className="space-y-2">
                                                                                {sale.items.map((item, index) => (
                                                                                    <div key={index} className="flex items-center gap-3 p-3 bg-background rounded-lg">
                                                                                        <div className="w-12 h-12 flex-shrink-0">
                                                                                            <img
                                                                                                src={getImageUrl(item.thumbnail)}
                                                                                                alt={item.name}
                                                                                                className="w-full h-full object-cover rounded cursor-pointer"
                                                                                                onClick={() => navigate(`/product/${item.id}`)}
                                                                                            />
                                                                                        </div>
                                                                                        <div className="flex-1 min-w-0">
                                                                                            <h5
                                                                                                className="font-medium truncate cursor-pointer hover:text-primary"
                                                                                                onClick={() => navigate(`/product/${item.id}`)}
                                                                                            >
                                                                                                {item.name}
                                                                                            </h5>
                                                                                            <p className="text-sm text-muted-foreground">
                                                                                                {item.brand} • {item.category}
                                                                                            </p>
                                                                                            <p className="text-sm">
                                                                                                Qty: {item.quantity} × ₱{item.discountPrice || item.price}
                                                                                            </p>
                                                                                        </div>
                                                                                        <div className="text-right">
                                                                                            <p className="font-medium">
                                                                                                ₱{(Number(item.discountPrice || item.price) * item.quantity).toFixed(2)}
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>

                                                                        <Separator />

                                                                        {/* Order Summary */}
                                                                        <div>
                                                                            <h4 className="font-semibold mb-3">Order Summary</h4>
                                                                            <div className="space-y-2">
                                                                                <div className="flex justify-between text-sm">
                                                                                    <span>Subtotal:</span>
                                                                                    <span>₱{Number(sale.subtotal).toFixed(2)}</span>
                                                                                </div>
                                                                                <div className="flex justify-between text-sm">
                                                                                    <span>Tax (12%):</span>
                                                                                    <span>₱{Number(sale.tax).toFixed(2)}</span>
                                                                                </div>
                                                                                {Number(sale.discount) > 0 && (
                                                                                    <div className="flex justify-between text-sm text-green-600">
                                                                                        <span>Discount:</span>
                                                                                        <span>-₱{Number(sale.discount).toFixed(2)}</span>
                                                                                    </div>
                                                                                )}
                                                                                <Separator />
                                                                                <div className="flex justify-between font-semibold">
                                                                                    <span>Total:</span>
                                                                                    <span>₱{Number(sale.total).toFixed(2)}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Payment Method */}
                                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                            <DollarSign className="h-4 w-4" />
                                                                            Payment: {sale.paymentMethod === 'cod' ? 'Cash on Delivery' : 'GCash'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </Card>
                        )}
                    </div>
                );
            }

            case "notifications":
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold">Notifications</h2>
                                <p className="text-muted-foreground">Stay updated with your order status</p>
                            </div>
                            {unreadCount > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={async () => {
                                        try {
                                            await apiService.markAllNotificationsAsRead();
                                            setNotifications(prev =>
                                                prev.map(notif => ({ ...notif, isRead: true }))
                                            );
                                            setUnreadCount(0);
                                            toast.success('All notifications marked as read');
                                        } catch (error) {
                                            console.error('Error marking all as read:', error);
                                        }
                                    }}
                                >
                                    Mark All as Read
                                </Button>
                            )}
                        </div>

                        {notifications.length === 0 ? (
                            <Card className="p-6">
                                <div className="text-center py-8">
                                    <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                                    <p className="text-muted-foreground">You don't have any notifications yet.</p>
                                </div>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {notifications.map((notification) => (
                                    <Card
                                        key={notification.id}
                                        className="p-4"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-semibold">{notification.title}</h4>
                                                    {!notification.isRead && (
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(notification.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!notification.isRead && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => markNotificationAsRead(notification.id)}
                                                    >
                                                        Mark as Read
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={async () => {
                                                        try {
                                                            await apiService.deleteNotification(notification.id);
                                                            setNotifications(prev =>
                                                                prev.filter(notif => notif.id !== notification.id)
                                                            );
                                                            if (!notification.isRead) {
                                                                setUnreadCount(prev => Math.max(0, prev - 1));
                                                            }
                                                        } catch (error) {
                                                            console.error('Error deleting notification:', error);
                                                        }
                                                    }}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case "reviews":
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold">Reviews</h2>
                            <p className="text-muted-foreground">Write reviews for your delivered orders</p>
                        </div>

                        {showReviewForm && selectedReviewItem ? (
                            <ReviewForm
                                productId={selectedReviewItem.productId}
                                saleId={selectedReviewItem.saleId}
                                productName={selectedReviewItem.productName}
                                productThumbnail={selectedReviewItem.productThumbnail}
                                onReviewSubmitted={handleReviewSubmitted}
                                onCancel={handleCancelReview}
                            />
                        ) : reviewableItems.length === 0 ? (
                            <Card className="p-6">
                                <div className="text-center py-8">
                                    <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No reviews available</h3>
                                    <p className="text-muted-foreground">You don't have any delivered orders to review yet.</p>
                                </div>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {reviewableItems.map((item) => (
                                    <Card key={`${item.saleId}-${item.productId}`} className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 flex-shrink-0">
                                                    <img
                                                        src={getImageUrl(item.productThumbnail)}
                                                        alt={item.productName}
                                                        className="w-full h-full object-cover rounded"
                                                    />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">{item.productName}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Order #{item.orderNumber}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Delivered on {new Date(item.deliveredAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => handleWriteReview(item)}
                                                className="flex items-center gap-2"
                                            >
                                                <Star className="h-4 w-4" />
                                                Write Review
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case "help":
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold">Help Center</h2>
                            <p className="text-muted-foreground">Find answers to common questions</p>
                        </div>

                        <div className="grid gap-6">
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Ordering & Delivery</h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium mb-2">How do I place an order?</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Browse our catalog, add items to your cart, and proceed to checkout.
                                            You can pay via Cash on Delivery (COD) or GCash.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">What are your delivery options?</h4>
                                        <p className="text-sm text-muted-foreground">
                                            We offer Cash on Delivery (COD) and GCash payment options.
                                            Delivery times vary by location, typically 3-7 business days.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">How can I track my order?</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Check your order status in the "All Orders" section of your account.
                                            You'll receive notifications for status updates.
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Account & Returns</h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium mb-2">How do I update my account information?</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Go to "My Account" section to view your profile information.
                                            Contact support if you need to make changes.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">What is your return policy?</h4>
                                        <p className="text-sm text-muted-foreground">
                                            We accept returns within 7 days of delivery for defective items.
                                            Contact customer service to initiate a return.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">How do I cancel an order?</h4>
                                        <p className="text-sm text-muted-foreground">
                                            You can cancel pending orders from your order history.
                                            Once confirmed, orders cannot be cancelled.
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Contact Support</h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium mb-2">Customer Service</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Email: support@tiledepot.com<br />
                                            Phone: +63 2 1234 5678<br />
                                            Hours: Monday - Friday, 9:00 AM - 6:00 PM
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">Technical Support</h4>
                                        <p className="text-sm text-muted-foreground">
                                            For website issues or technical problems, contact our technical team
                                            at tech@tiledepot.com
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                );

            case "terms":
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold">Terms & Policies</h2>
                            <p className="text-muted-foreground">Our terms of service and privacy policy</p>
                        </div>

                        <div className="grid gap-6">
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Terms of Service</h3>
                                <div className="space-y-4 text-sm text-muted-foreground">
                                    <div>
                                        <h4 className="font-medium text-foreground mb-2">1. Acceptance of Terms</h4>
                                        <p>
                                            By accessing and using Tile Depot's services, you accept and agree to be bound
                                            by the terms and provision of this agreement.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-foreground mb-2">2. Use License</h4>
                                        <p>
                                            Permission is granted to temporarily download one copy of the materials on
                                            Tile Depot's website for personal, non-commercial transitory viewing only.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-foreground mb-2">3. Disclaimer</h4>
                                        <p>
                                            The materials on Tile Depot's website are provided on an 'as is' basis.
                                            Tile Depot makes no warranties, expressed or implied.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-foreground mb-2">4. Limitations</h4>
                                        <p>
                                            In no event shall Tile Depot or its suppliers be liable for any damages
                                            arising out of the use or inability to use the materials on Tile Depot's website.
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Privacy Policy</h3>
                                <div className="space-y-4 text-sm text-muted-foreground">
                                    <div>
                                        <h4 className="font-medium text-foreground mb-2">Information We Collect</h4>
                                        <p>
                                            We collect information you provide directly to us, such as when you create
                                            an account, make a purchase, or contact us for support.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-foreground mb-2">How We Use Information</h4>
                                        <p>
                                            We use the information we collect to provide, maintain, and improve our
                                            services, process transactions, and communicate with you.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-foreground mb-2">Information Sharing</h4>
                                        <p>
                                            We do not sell, trade, or otherwise transfer your personal information to
                                            third parties without your consent, except as described in this policy.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-foreground mb-2">Data Security</h4>
                                        <p>
                                            We implement appropriate security measures to protect your personal information
                                            against unauthorized access, alteration, disclosure, or destruction.
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Return & Refund Policy</h3>
                                <div className="space-y-4 text-sm text-muted-foreground">
                                    <div>
                                        <h4 className="font-medium text-foreground mb-2">Return Period</h4>
                                        <p>
                                            You have 7 days from the delivery date to return defective or damaged items.
                                            Returns must be in original packaging.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-foreground mb-2">Return Process</h4>
                                        <p>
                                            Contact customer service to initiate a return. We'll provide return instructions
                                            and arrange pickup if applicable.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-foreground mb-2">Refund Processing</h4>
                                        <p>
                                            Refunds will be processed within 5-7 business days after we receive and
                                            inspect the returned items.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold capitalize">{activeSection.replace('-', ' ')}</h2>
                            <p className="text-muted-foreground">Manage your {activeSection.replace('-', ' ')}</p>
                        </div>

                        <Card className="p-6">
                            <div className="text-center py-8">
                                <div className="h-12 w-12 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                                    <span className="text-2xl">📋</span>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                                <p className="text-muted-foreground">This section is under development.</p>
                            </div>
                        </Card>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-64 flex-shrink-0">
                        <Card className="p-4">
                            <div className="space-y-2">
                                {sidebarItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Button
                                            key={item.id}
                                            variant={activeSection === item.id ? "default" : "ghost"}
                                            className="w-full justify-start"
                                            onClick={() => {
                                                if (item.onClick) {
                                                    item.onClick();
                                                } else {
                                                    setActiveSection(item.id);
                                                    // Handle status filtering for order-related sections
                                                    if ([ 'pending', 'received', 'cancelled' ].includes(item.id)) {
                                                        const statusMap = {
                                                            'pending': 'pending',
                                                            'received': 'delivered',
                                                            'cancelled': 'cancelled'
                                                        };
                                                        fetchSales(statusMap[ item.id as keyof typeof statusMap ]);
                                                    } else if (item.id === 'orders') {
                                                        fetchSales();
                                                    }
                                                }
                                            }}
                                        >
                                            <Icon className="mr-2 h-4 w-4" />
                                            {item.label}
                                            {item.badge && item.badge > 0 && (
                                                <Badge variant="secondary" className="ml-auto">
                                                    {item.badge}
                                                </Badge>
                                            )}
                                        </Button>
                                    );
                                })}

                                <Separator className="my-4" />

                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-red-600 hover:text-red-700"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {renderContent()}
                    </div>
                </div>
            </div>

            {/* Cancel Order Confirmation Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Order</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel order #{orderToCancel?.orderNumber}?
                            This action cannot be undone and the items will be returned to stock.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCancelDialogClose}>
                            Keep Order
                        </Button>
                        <Button
                            onClick={handleCancelOrder}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Yes, Cancel Order
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export { AccountPage };
