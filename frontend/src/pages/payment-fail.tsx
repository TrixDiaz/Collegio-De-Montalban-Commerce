import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, RefreshCw, Mail, User } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { apiService } from '@/services/api';
import { toast } from 'sonner';

interface PaymentFailData {
    errorCode?: string;
    errorMessage?: string;
    paymentMethod?: string;
    amount?: number;
    customerName: string;
    customerEmail: string;
}

const PaymentFail = () => {
    const [ searchParams ] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ paymentData, setPaymentData ] = useState<PaymentFailData | null>(null);
    const [ loading, setLoading ] = useState(true);

    useEffect(() => {
        const fetchPaymentData = async () => {
            try {
                // Get checkout session ID from PayMongo redirect (when cancelled)
                const sessionId = searchParams.get('session_id');
                const checkoutSessionId = searchParams.get('checkout_session_id');

                let customerName = user?.name || 'Customer';
                let customerEmail = user?.email || 'customer@example.com';
                let errorMessage = 'Payment processing failed';
                let paymentMethod = undefined;
                let amount = undefined;

                // Check if session_id is a valid ID (not a placeholder)
                const isValidSessionId = (id: string | null) => {
                    return id && id !== '{CHECKOUT_SESSION_ID}' && !id.includes('{') && !id.includes('}');
                };

                const validSessionId = isValidSessionId(sessionId) ? sessionId : isValidSessionId(checkoutSessionId) ? checkoutSessionId : null;

                // If we have a valid checkout session, fetch it to get customer details
                if (validSessionId) {
                    try {
                        const checkoutSession = await apiService.getCheckoutSessionStatus(validSessionId);

                        if ((checkoutSession as any).success) {
                            const session = (checkoutSession as any).data.attributes;

                            // Get customer billing details from checkout session
                            if (session.billing) {
                                customerName = session.billing.name || customerName;
                                customerEmail = session.billing.email || customerEmail;
                            }

                            paymentMethod = session.payment_method_types?.[ 0 ] || 'digital';
                            amount = session.amount / 100; // Convert from centavos

                            // Check payment status
                            if (session.payment_status === 'unpaid') {
                                errorMessage = 'Payment was cancelled or not completed';
                            } else if (session.payment_status === 'failed') {
                                errorMessage = 'Payment failed. Please try again.';
                            }
                        }
                    } catch (error) {
                        console.error('Error fetching checkout session:', error);
                    }
                }

                // Get error details from URL params (fallback)
                const errorCode = searchParams.get('error_code');
                const errorMessageParam = searchParams.get('error_message');
                const paymentMethodParam = searchParams.get('payment_method');
                const amountParam = searchParams.get('amount');

                setPaymentData({
                    errorCode: errorCode || undefined,
                    errorMessage: errorMessageParam || errorMessage,
                    paymentMethod: paymentMethodParam || paymentMethod,
                    amount: amountParam ? parseFloat(amountParam) : amount,
                    customerName: customerName,
                    customerEmail: customerEmail
                });
            } catch (error) {
                console.error('Error fetching payment data:', error);
                toast.error('Failed to load payment details');
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentData();
    }, [ searchParams, user ]);

    const handleRetryPayment = () => {
        // Navigate back to cart to retry payment
        navigate('/cart');
    };

    const handleContactSupport = () => {
        // You can implement contact support functionality here
        toast.info('Contact support feature coming soon');
    };

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
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <Card className="shadow-2xl border-0">
                    <CardHeader className="text-center pb-4">
                        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                        <CardTitle className="text-3xl font-bold text-red-600 dark:text-red-400">
                            Payment Failed
                        </CardTitle>
                        <p className="text-muted-foreground mt-2">
                            We're sorry, but your payment could not be processed at this time.
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {paymentData && (
                            <>
                                {/* Error Details */}
                                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5" />
                                        Error Details
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        {paymentData.errorCode && (
                                            <div>
                                                <span className="text-muted-foreground">Error Code:</span>
                                                <p className="font-mono font-semibold">{paymentData.errorCode}</p>
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-muted-foreground">Error Message:</span>
                                            <p className="font-semibold text-red-600">{paymentData.errorMessage}</p>
                                        </div>
                                        {paymentData.paymentMethod && (
                                            <div>
                                                <span className="text-muted-foreground">Payment Method:</span>
                                                <p className="font-semibold capitalize">{paymentData.paymentMethod}</p>
                                            </div>
                                        )}
                                        {paymentData.amount && (
                                            <div>
                                                <span className="text-muted-foreground">Amount:</span>
                                                <p className="font-semibold text-lg">₱{paymentData.amount.toFixed(2)}</p>
                                            </div>
                                        )}
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
                            </>
                        )}

                        {/* Common Reasons */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                            <h3 className="font-semibold text-lg mb-2">Common Reasons for Payment Failure</h3>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>• Insufficient funds in your account</li>
                                <li>• Incorrect payment information</li>
                                <li>• Network connectivity issues</li>
                                <li>• Bank or payment provider restrictions</li>
                                <li>• Expired payment method</li>
                            </ul>
                        </div>

                        {/* What to Do Next */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                            <h3 className="font-semibold text-lg mb-2">What to Do Next</h3>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>• Check your payment method details</li>
                                <li>• Ensure you have sufficient funds</li>
                                <li>• Try a different payment method</li>
                                <li>• Contact your bank if the issue persists</li>
                                <li>• Contact our support team for assistance</li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={handleRetryPayment}
                                className="flex-1 flex items-center gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Try Again
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleContactSupport}
                                className="flex-1"
                            >
                                Contact Support
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

export { PaymentFail };
