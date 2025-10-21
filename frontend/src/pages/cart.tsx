
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Minus, Plus, Trash2, ShoppingBag, CreditCard, Smartphone, Wallet } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { useAuth } from '@/contexts/auth-context';
import { getImageUrl } from '@/lib/utils';
import { apiService } from '@/services/api';
import { toast } from 'sonner';

const Cart = () => {
    const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [ paymentMethod, setPaymentMethod ] = useState('cod');
    const [ discountCode, setDiscountCode ] = useState('');
    const [ appliedDiscount, setAppliedDiscount ] = useState(0);
    const [ isProcessing, setIsProcessing ] = useState(false);

    // Calculate cart totals
    const subtotal = getTotalPrice();
    const tax = subtotal * 0.12; // 12% VAT
    const discount = appliedDiscount;
    const total = subtotal + tax - discount;

    const applyDiscount = () => {
        if (discountCode.toLowerCase() === 'save10') {
            setAppliedDiscount(subtotal * 0.10);
        } else if (discountCode.toLowerCase() === 'welcome20') {
            setAppliedDiscount(subtotal * 0.20);
        } else {
            setAppliedDiscount(0);
        }
    };

    const clearDiscount = () => {
        setDiscountCode('');
        setAppliedDiscount(0);
    };

    const handleDigitalPayment = async (method: 'gcash' | 'maya') => {
        try {
            setIsProcessing(true);

            // Step 1: Create a pending order in the database (like your PHP code)
            const orderData = {
                items: items.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    discountPrice: item.discountPrice,
                    quantity: item.quantity,
                    thumbnail: item.thumbnail,
                    brand: item.brand,
                    category: item.category,
                    stock: item.stock,
                    sold: 0
                })),
                subtotal,
                tax,
                discount,
                total,
                paymentMethod: method,
                shippingAddress: null,
                notes: discountCode ? `Discount code: ${discountCode}` : null,
                status: 'pending' // Mark as pending until payment is confirmed
            };

            const orderResponse = await apiService.createSale(orderData) as any;

            if (!(orderResponse as any).success) {
                throw new Error('Failed to create order');
            }

            const orderId = (orderResponse as any).data?.id;
            const orderNumber = (orderResponse as any).data?.orderNumber;

            // Step 2: Prepare line items for checkout session
            const lineItems = items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                amount: item.discountPrice || item.price,
                description: `${item.brand} - ${item.category}`,
                images: item.thumbnail ? [ item.thumbnail ] : []
            }));

            // Step 3: Pre-fill customer information
            const customerInfo = {
                name: user?.name || 'Customer',
                email: user?.email || '',
                phone: '' // Add phone if you have it in user object
            };

            // Step 4: Create checkout session with PayMongo
            // Support multiple payment methods based on user's selection
            const paymentMethods = method === 'gcash'
                ? [ 'gcash', 'grab_pay' ] // GCash and GrabPay
                : [ 'paymaya', 'card', 'dob', 'billease' ]; // Maya, Card, Online Banking, Billease

            const response = await apiService.createCheckoutSession(
                lineItems,
                paymentMethods,
                `Tile Depot Order ${orderNumber}`,
                customerInfo,
                orderId
            );

            if ((response as any).success && (response as any).data) {
                const session = (response as any).data.attributes;

                // Redirect to PayMongo hosted checkout page
                if (session.checkout_url) {
                    toast.info(`Redirecting to ${method.toUpperCase()} payment...`);
                    // Save info to localStorage
                    localStorage.setItem('pending_checkout_session', (response as any).data.id);
                    localStorage.setItem('pending_order_id', orderId);
                    // Clear cart before redirect
                    clearCart();
                    // Redirect to PayMongo
                    window.location.href = session.checkout_url;
                }
            }
        } catch (error: unknown) {
            console.error('Error creating checkout session:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to initiate payment';
            toast.error(errorMessage);
            setIsProcessing(false);
            // Redirect to payment fail page
            navigate(`/payment/fail?error_message=${encodeURIComponent(errorMessage)}&payment_method=${method}&amount=${total}`);
        }
    };

    const handlePay = async () => {
        // Check if user is authenticated
        if (!user) {
            toast.error('Please login to continue');
            navigate('/login');
            return;
        }

        // Debug: Check if tokens exist
        const tokens = localStorage.getItem('tokens');
        if (!tokens) {
            toast.error('Authentication tokens not found. Please login again.');
            navigate('/login');
            return;
        }

        if (items.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        // Debug: Log cart items to see what we have
        console.log('Cart items:', items);
        console.log('Cart items length:', items.length);

        // Validate cart items before processing
        const invalidItems = items.filter(item => {
            const isValid = item &&
                item.id &&
                item.name &&
                typeof item.price === 'number' &&
                item.quantity > 0 &&
                item.thumbnail &&
                item.brand &&
                item.category &&
                typeof item.stock === 'number';

            if (!isValid) {
                console.log('Invalid item found:', item);
            }
            return !isValid;
        });

        if (invalidItems.length > 0) {
            console.log('Invalid items:', invalidItems);
            toast.error(`Found ${invalidItems.length} invalid items in cart. Please refresh and try again.`);
            return;
        }

        // For digital payments (GCash, Maya), initiate payment first
        if (paymentMethod === 'gcash' || paymentMethod === 'maya') {
            await handleDigitalPayment(paymentMethod as 'gcash' | 'maya');
            return;
        }

        setIsProcessing(true);
        try {
            const orderData = {
                items: items.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    discountPrice: item.discountPrice,
                    quantity: item.quantity,
                    thumbnail: item.thumbnail,
                    brand: item.brand,
                    category: item.category,
                    stock: item.stock,
                    sold: 0 // Will be updated by backend
                })),
                subtotal,
                tax,
                discount,
                total,
                paymentMethod,
                shippingAddress: null, // Can be added later
                notes: discountCode ? `Discount code: ${discountCode}` : null
            };

            const response = await apiService.createSale(orderData) as any;

            if ((response as any).success) {
                toast.success('Order placed successfully!');
                clearCart();
                // Redirect to payment success page for COD orders too
                navigate(`/payment/success?payment_method=${paymentMethod}&amount=${total}&order_number=${(response as any).data?.orderNumber || 'N/A'}`);
            } else {
                toast.error((response as any).message || 'Failed to place order');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to place order. Please try again.';
            toast.error(errorMessage, {
                description: 'Please check your cart and try again',
                duration: 5000,
            });
            // Redirect to payment fail page for COD errors too
            navigate(`/payment/fail?error_message=${encodeURIComponent(errorMessage)}&payment_method=${paymentMethod}&amount=${total}`);
        } finally {
            setIsProcessing(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <ShoppingBag className="h-24 w-24 text-gray-400 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 mb-6">Add some products to get started!</p>
                    <Button onClick={() => window.location.href = '/catalog'}>
                        Continue Shopping
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-200px)]">
                {/* Cart Items - Left Side */}
                <div className="flex-1 lg:w-2/3">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold">Shopping Cart</h1>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-sm">
                                {items.length} item{items.length !== 1 ? 's' : ''}
                            </Badge>
                            {items.length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (confirm('Are you sure you want to clear your cart?')) {
                                            clearCart();
                                            toast.success('Cart cleared');
                                        }
                                    }}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    Clear Cart
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto pr-4">
                        <div className="space-y-4">
                            {items.map((item) => (
                                <Card key={item.id} className="overflow-hidden">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            {/* Product Image */}
                                            <div className="w-20 h-20 flex-shrink-0">
                                                <img
                                                    src={getImageUrl(item.thumbnail)}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover rounded-md"
                                                />
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-lg truncate">{item.name}</h3>
                                                <p className="text-sm text-gray-600">{item.brand} • {item.category}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-lg font-bold text-primary">
                                                        ₱{((item.discountPrice || item.price) * item.quantity).toFixed(2)}
                                                    </span>
                                                    {item.discountPrice && (
                                                        <span className="text-sm text-gray-500 line-through">
                                                            ₱{(item.price * item.quantity).toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <Input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                                                    className="w-12 text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                                    min="1"
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            {/* Remove Button */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Order Summary - Right Side */}
                <div className="lg:w-1/3 lg:max-w-md">
                    <Card className="sticky top-4 shadow-lg">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Discount Code */}
                            <div className="space-y-2">
                                <Label htmlFor="discount">Discount Code</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="discount"
                                        placeholder="Enter code"
                                        value={discountCode}
                                        onChange={(e) => setDiscountCode(e.target.value)}
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={applyDiscount}
                                        disabled={!discountCode}
                                    >
                                        Apply
                                    </Button>
                                </div>
                                {appliedDiscount > 0 && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-green-600">Discount Applied</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearDiscount}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Pricing Breakdown */}
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>₱{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax (12% VAT)</span>
                                    <span>₱{tax.toFixed(2)}</span>
                                </div>
                                {appliedDiscount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>-₱{appliedDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>₱{total.toFixed(2)}</span>
                            </div>

                            <Separator />

                            {/* Payment Method */}
                            <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                                <Label className="text-base font-semibold">Payment Method</Label>
                                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                                    <div className="flex items-center space-x-3 p-3 rounded-md border hover:bg-muted/50 transition-colors">
                                        <RadioGroupItem value="cod" id="cod" />
                                        <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer flex-1">
                                            <CreditCard className="h-4 w-4" />
                                            <span className="font-medium">Cash on Delivery</span>
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-3 p-3 rounded-md border hover:bg-muted/50 transition-colors">
                                        <RadioGroupItem value="gcash" id="gcash" />
                                        <Label htmlFor="gcash" className="flex items-center gap-2 cursor-pointer flex-1">
                                            <Smartphone className="h-4 w-4" />
                                            <span className="font-medium">GCash (PayMongo)</span>
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-3 p-3 rounded-md border hover:bg-muted/50 transition-colors">
                                        <RadioGroupItem value="maya" id="maya" />
                                        <Label htmlFor="maya" className="flex items-center gap-2 cursor-pointer flex-1">
                                            <Wallet className="h-4 w-4" />
                                            <span className="font-medium">Maya (PayMongo)</span>
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Checkout Button */}
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handlePay}
                                disabled={isProcessing}
                            >
                                {isProcessing
                                    ? "Processing..."
                                    : (paymentMethod === 'gcash' || paymentMethod === 'maya')
                                        ? `Pay with ${paymentMethod.toUpperCase()}`
                                        : "Proceed to Checkout"
                                }
                            </Button>

                            {/* Continue Shopping */}
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => window.location.href = '/catalog'}
                            >
                                Continue Shopping
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export { Cart };
