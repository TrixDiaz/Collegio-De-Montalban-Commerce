import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowLeft, ShoppingBag, Mail, User } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { apiService } from '@/services/api';
import { toast } from 'sonner';

interface PaymentSuccessData {
    orderNumber: string;
    total: number;
    paymentMethod: string;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
    customerName: string;
    customerEmail: string;
}

const PaymentSuccess = () => {
    const [ searchParams ] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ paymentData, setPaymentData ] = useState<PaymentSuccessData | null>(null);
    const [ loading, setLoading ] = useState(true);

    useEffect(() => {
        const fetchPaymentData = async () => {
            try {
                // Get payment source ID from URL params
                const sourceId = searchParams.get('source_id');
                const paymentIntentId = searchParams.get('payment_intent_id');

                // Get checkout session ID and order ID from URL
                const sessionId = searchParams.get('session_id');
                const checkoutSessionId = searchParams.get('checkout_session_id');
                const orderId = searchParams.get('order_id');

                let customerName = user?.name || 'Customer';
                let customerEmail = user?.email || 'customer@example.com';

                // Check if session_id is a valid ID (not a placeholder)
                const isValidSessionId = (id: string | null) => {
                    return id && id !== '{CHECKOUT_SESSION_ID}' && !id.includes('{') && !id.includes('}');
                };

                const validSessionId = isValidSessionId(sessionId) ? sessionId : isValidSessionId(checkoutSessionId) ? checkoutSessionId : null;

                // If we have a valid checkout session, fetch it to get customer billing details
                if (validSessionId) {
                    const checkoutSession = await apiService.getCheckoutSessionStatus(validSessionId);

                    if ((checkoutSession as any).success) {
                        const session = (checkoutSession as any).data.attributes;

                        // Check if payment was successful
                        if (session.payment_status === 'paid') {
                            // Get customer billing details from checkout session
                            if (session.billing) {
                                customerName = session.billing.name || customerName;
                                customerEmail = session.billing.email || customerEmail;
                            }

                            // TODO: Update order status in database to 'completed'
                            // This requires a new API endpoint: updateOrderStatus(orderId, 'completed')
                            // For now, fetch the order from database using orderId

                            // Get order details from database
                            if (orderId) {
                                const ordersResponse = await apiService.getUserSales({ limit: 50 });
                                if ((ordersResponse as any).success && (ordersResponse as any).data.sales) {
                                    const order = (ordersResponse as any).data.sales.find((sale: any) => sale.id === parseInt(orderId));

                                    if (order) {
                                        setPaymentData({
                                            orderNumber: order.orderNumber,
                                            total: parseFloat(order.total),
                                            paymentMethod: order.paymentMethod,
                                            items: order.items,
                                            customerName: customerName,
                                            customerEmail: customerEmail
                                        });
                                        setLoading(false);
                                        // Clear pending session from localStorage
                                        localStorage.removeItem('pending_checkout_session');
                                        localStorage.removeItem('pending_order_id');
                                        return;
                                    }
                                }
                            }

                            // Fallback: use checkout session data
                            if (session.line_items) {
                                const items = session.line_items.map((item: any) => ({
                                    name: item.name,
                                    quantity: item.quantity,
                                    price: item.amount / 100
                                }));

                                setPaymentData({
                                    orderNumber: `CHK-${validSessionId?.slice(-8).toUpperCase()}`,
                                    total: session.amount / 100,
                                    paymentMethod: session.payment_method_types?.[ 0 ] || 'digital',
                                    items: items,
                                    customerName: customerName,
                                    customerEmail: customerEmail
                                });
                                setLoading(false);
                                return;
                            }
                        } else {
                            // Payment not completed, redirect to fail page
                            toast.error('Payment was not completed');
                            window.location.href = `/payment/fail?session_id=${validSessionId}&order_id=${orderId || ''}`;
                            return;
                        }
                    }
                }

                // If we have an order ID but no valid session, try to fetch the order directly
                if (!validSessionId && orderId) {
                    try {
                        const ordersResponse = await apiService.getUserSales({ limit: 50 });
                        if ((ordersResponse as any).success && (ordersResponse as any).data.sales) {
                            const order = (ordersResponse as any).data.sales.find((sale: any) => sale.id === parseInt(orderId));

                            if (order) {
                                setPaymentData({
                                    orderNumber: order.orderNumber,
                                    total: parseFloat(order.total),
                                    paymentMethod: order.paymentMethod,
                                    items: order.items,
                                    customerName: customerName,
                                    customerEmail: customerEmail
                                });
                                setLoading(false);
                                return;
                            }
                        }
                    } catch (error) {
                        console.error('Error fetching order by ID:', error);
                    }
                }

                // Fallback: fetch from sources or intents
                if (sourceId || paymentIntentId) {
                    // Fetch payment status
                    let paymentStatus;
                    if (sourceId) {
                        paymentStatus = await apiService.getPaymentSourceStatus(sourceId);
                    } else {
                        paymentStatus = await apiService.getPaymentIntentStatus(paymentIntentId!);
                    }

                    if ((paymentStatus as any).success) {
                        // Get user's recent orders to find the matching order
                        const ordersResponse = await apiService.getUserSales({ limit: 5 });
                        if ((ordersResponse as any).success && (ordersResponse as any).data.sales) {
                            const recentOrder = (ordersResponse as any).data.sales[ 0 ]; // Most recent order

                            setPaymentData({
                                orderNumber: recentOrder.orderNumber,
                                total: parseFloat(recentOrder.total),
                                paymentMethod: recentOrder.paymentMethod,
                                items: recentOrder.items,
                                customerName: customerName,
                                customerEmail: customerEmail
                            });
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching payment data:', error);
                toast.error('Failed to load payment details');
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentData();
    }, [ searchParams, user ]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading payment details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <Card className="shadow-2xl border-0">
                    <CardHeader className="text-center pb-4">
                        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <CardTitle className="text-3xl font-bold text-green-600 dark:text-green-400">
                            Payment Successful!
                        </CardTitle>
                        <p className="text-muted-foreground mt-2">
                            Your order has been confirmed and payment has been processed successfully.
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {paymentData && (
                            <>
                                {/* Order Details */}
                                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <ShoppingBag className="h-5 w-5" />
                                        Order Details
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Order Number:</span>
                                            <p className="font-mono font-semibold">{paymentData.orderNumber}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Payment Method:</span>
                                            <p className="font-semibold capitalize">{paymentData.paymentMethod}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Total Amount:</span>
                                            <p className="font-semibold text-lg text-green-600">
                                                ₱{paymentData.total.toFixed(2)}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Status:</span>
                                            <p className="font-semibold text-green-600">Completed</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Information */}
                                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Customer Information
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">Name:</span>
                                            <span className="font-semibold">{paymentData.customerName}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">Email:</span>
                                            <span className="font-semibold">{paymentData.customerEmail}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Ordered */}
                                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                                    <h3 className="font-semibold text-lg">Items Ordered</h3>
                                    <div className="space-y-2">
                                        {paymentData.items.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center text-sm">
                                                <span>{item.name} x {item.quantity}</span>
                                                <span className="font-semibold">₱{(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Next Steps */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                            <h3 className="font-semibold text-lg mb-2">What's Next?</h3>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>• You will receive an email confirmation shortly</li>
                                <li>• Your order is being processed and prepared</li>
                                <li>• You can track your order in your account</li>
                                <li>• For COD orders, payment will be collected upon delivery</li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={() => navigate('/account?tab=orders')}
                                className="flex-1"
                            >
                                View My Orders
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate('/catalog')}
                                className="flex-1"
                            >
                                Continue Shopping
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Home
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export { PaymentSuccess };
