import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { apiService, Product, OrderItem } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { OnScreenKeyboard } from "@/components/on-screen-keyboard";
import { NumericKeyboard } from "@/components/numeric-keyboard";
import {
    ShoppingCart,
    Search,
    Trash2,
    Plus,
    Minus,
    CreditCard,
    ArrowLeft,
    Package
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const API_BASE_URL = 'https://tile-depot-backend-production.up.railway.app';

const Transaction = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [ products, setProducts ] = useState<Product[]>([]);
    const [ loading, setLoading ] = useState(true);
    const [ searchQuery, setSearchQuery ] = useState("");
    const [ orderItems, setOrderItems ] = useState<OrderItem[]>([]);
    const [ deleteItemId, setDeleteItemId ] = useState<string | null>(null);
    const [ paymentMethod, setPaymentMethod ] = useState<'cash' | 'cod' | 'gcash' | 'maya'>('cash');
    const [ isProcessing, setIsProcessing ] = useState(false);
    const [ showKeyboard, setShowKeyboard ] = useState(false);
    const [ categories, setCategories ] = useState<string[]>([]);
    const [ brands, setBrands ] = useState<string[]>([]);
    const [ selectedCategory, setSelectedCategory ] = useState<string>("all");
    const [ selectedBrand, setSelectedBrand ] = useState<string>("all");
    const [ customerPayment, setCustomerPayment ] = useState<string>("");
    const [ showNumericKeyboard, setShowNumericKeyboard ] = useState(false);
    const [ promoCode, setPromoCode ] = useState<string>("");
    const [ appliedPromo, setAppliedPromo ] = useState<any>(null);
    const [ promoDiscount, setPromoDiscount ] = useState<number>(0);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await apiService.getProducts({
                limit: 500,
                inStock: true
            });
            if (response.success) {
                setProducts(response.data.products);
                // Extract unique categories and brands
                if (response.data.filters) {
                    setCategories(response.data.filters.availableCategories || []);
                    setBrands(response.data.filters.availableBrands || []);
                }
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    // Show all products by default (for touchscreen POS)
    // Filter by search, category, and brand
    const filteredProducts = products.filter(product => {
        const matchesSearch = searchQuery.trim()
            ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase())
            : true;

        const matchesCategory = selectedCategory && selectedCategory !== "all"
            ? product.category === selectedCategory
            : true;

        const matchesBrand = selectedBrand && selectedBrand !== "all"
            ? product.brand === selectedBrand
            : true;

        return matchesSearch && matchesCategory && matchesBrand;
    });

    const addToOrder = (product: Product) => {
        const existingItem = orderItems.find(item => item.id === product.id);

        if (existingItem) {
            // Check stock before adding
            if (existingItem.quantity >= product.stock) {
                toast.error(`Only ${product.stock} items available in stock`);
                return;
            }
            setOrderItems(orderItems.map(item =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            if (product.stock <= 0) {
                toast.error("Product out of stock");
                return;
            }
            const newItem: OrderItem = {
                id: product.id,
                name: product.name,
                price: product.discountPrice || product.price,
                quantity: 1,
                thumbnail: product.thumbnail
            };
            setOrderItems([ ...orderItems, newItem ]);
        }
        toast.success(`${product.name} added to order`);
    };

    const updateQuantity = (itemId: string, newQuantity: number) => {
        const product = products.find(p => p.id === itemId);
        if (product && newQuantity > product.stock) {
            toast.error(`Only ${product.stock} items available in stock`);
            return;
        }

        if (newQuantity <= 0) {
            setDeleteItemId(itemId);
        } else {
            setOrderItems(orderItems.map(item =>
                item.id === itemId
                    ? { ...item, quantity: newQuantity }
                    : item
            ));
        }
    };

    const removeItem = (itemId: string) => {
        setOrderItems(orderItems.filter(item => item.id !== itemId));
        setDeleteItemId(null);
        toast.success("Item removed from order");
    };

    const calculateSubtotal = () => {
        return orderItems.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    };

    const calculateTax = () => {
        return calculateSubtotal() * 0.12; // 12% tax
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax() - promoDiscount;
    };

    const calculateChange = () => {
        const payment = parseFloat(customerPayment) || 0;
        const total = calculateTotal();
        return Math.max(0, payment - total);
    };

    const applyPromoCode = async () => {
        if (!promoCode.trim()) {
            toast.error("Please enter a promo code");
            return;
        }

        try {
            const response = await apiService.validatePromoCode(promoCode.trim().toUpperCase());

            if (response.success && response.data.valid) {
                const promo = response.data.promoCode;
                setAppliedPromo(promo);

                // Calculate discount based on promo type
                const subtotal = calculateSubtotal();
                let discount = 0;

                if (promo.discountType === 'percentage') {
                    discount = subtotal * (promo.discountValue / 100);
                } else if (promo.discountType === 'fixed') {
                    discount = promo.discountValue;
                }

                setPromoDiscount(discount);
                toast.success(`Promo code "${promo.code}" applied! Discount: ₱${discount.toFixed(2)}`);
            }
        } catch (error: any) {
            toast.error(error?.message || "Invalid or expired promo code");
            setAppliedPromo(null);
            setPromoDiscount(0);
        }
    };

    const removePromoCode = () => {
        setPromoCode("");
        setAppliedPromo(null);
        setPromoDiscount(0);
        toast.info("Promo code removed");
    };

    const isPaymentSufficient = () => {
        // For cash payments, check if payment is enough
        if (paymentMethod === 'cash') {
            const payment = parseFloat(customerPayment) || 0;
            return payment >= calculateTotal();
        }
        // For COD, GCash, and Maya, no payment check needed
        return true;
    };


    const handleCompleteTransaction = async () => {
        if (orderItems.length === 0) {
            toast.error("Please add items to the order");
            return;
        }

        if (paymentMethod === 'cash' && !isPaymentSufficient()) {
            toast.error("Payment amount is insufficient");
            return;
        }

        try {
            setIsProcessing(true);
            const saleData = {
                items: orderItems,
                subtotal: calculateSubtotal(),
                tax: calculateTax(),
                discount: promoDiscount,
                total: calculateTotal(),
                paymentMethod: paymentMethod,
                promoCode: appliedPromo?.code || null,
            };

            const response = await apiService.createSale(saleData);

            if (response.success) {
                // Increment promo code usage if applied
                if (appliedPromo) {
                    try {
                        await apiService.incrementPromoCodeUsage(appliedPromo.code);
                    } catch (promoError) {
                        console.error("Error incrementing promo code:", promoError);
                    }
                }

                // Show change if cash payment
                if (paymentMethod === 'cash') {
                    const change = calculateChange();
                    toast.success(`Transaction completed! Order #${response.order.orderNumber}. Change: ₱${change.toFixed(2)}`);
                } else {
                    toast.success(`Transaction completed! Order #${response.order.orderNumber}`);
                }

                setOrderItems([]);
                setPaymentMethod('cash');
                setCustomerPayment("");
                setShowNumericKeyboard(false);
                setPromoCode("");
                setAppliedPromo(null);
                setPromoDiscount(0);
                // Refresh products to update stock
                await fetchProducts();

                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    navigate("/dashboard");
                }, 1500);
            }
        } catch (error: any) {
            console.error("Error completing transaction:", error);
            toast.error(error?.message || "Failed to complete transaction");
        } finally {
            setIsProcessing(false);
        }
    };

    const getProductImageUrl = (thumbnail?: string) => {
        if (!thumbnail) return null;
        if (thumbnail.startsWith('http')) return thumbnail;
        
        // Normalize path separators
        const normalizedPath = thumbnail.replace(/\\/g, '/');
        
        // Remove uploads/ prefix if it exists, since we'll add it back
        let cleanPath = normalizedPath;
        if (normalizedPath.startsWith('/uploads/')) {
            cleanPath = normalizedPath.substring(9); // Remove "/uploads/" prefix
        } else if (normalizedPath.startsWith('uploads/')) {
            cleanPath = normalizedPath.substring(8); // Remove "uploads/" prefix
        }
        
        return `${API_BASE_URL}/uploads/${cleanPath}`;
    };

    const handleKeyPress = (key: string) => {
        setSearchQuery(prev => prev + key);
    };

    const handleBackspace = () => {
        setSearchQuery(prev => prev.slice(0, -1));
    };

    const handleClearSearch = () => {
        setSearchQuery("");
    };

    const clearFilters = () => {
        setSelectedCategory("all");
        setSelectedBrand("all");
        setSearchQuery("");
    };

    // Numeric keyboard handlers
    const handleNumericKeyPress = (key: string) => {
        // Prevent multiple decimal points
        if (key === '.' && customerPayment.includes('.')) {
            return;
        }
        setCustomerPayment(prev => prev + key);
    };

    const handleClearPayment = () => {
        setCustomerPayment("");
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate("/dashboard")}
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold">New Transaction</h1>
                                <p className="text-sm text-muted-foreground">
                                    Cashier: {user?.name}
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className="text-sm">
                            <Package className="h-4 w-4 mr-1" />
                            {products.length} Products
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-180px)]">
                    {/* Left Side - Products */}
                    <div className="lg:col-span-2">
                        <Card className="h-full flex flex-col">
                            <CardHeader className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">Products</CardTitle>
                                    {(searchQuery || selectedCategory !== "all" || selectedBrand !== "all") && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearFilters}
                                        >
                                            Clear Filters
                                        </Button>
                                    )}
                                </div>

                                {/* Search Input */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => setShowKeyboard(true)}
                                        className="pl-10 h-11"
                                        autoComplete="off"
                                        readOnly
                                    />
                                </div>

                                {/* Filter Row */}
                                <div className="flex gap-2">
                                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="All Categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="All Brands" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Brands</SelectItem>
                                            {brands.map((brand) => (
                                                <SelectItem key={brand} value={brand}>
                                                    {brand}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-hidden">
                                <ScrollArea className="h-[calc(100vh-400px)]">
                                    {loading ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            Loading products...
                                        </div>
                                    ) : filteredProducts.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No products found
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 pb-4">
                                            {filteredProducts.map((product) => (
                                                <Card
                                                    key={product.id}
                                                    className="cursor-pointer hover:border-primary transition-all active:scale-95"
                                                    onClick={() => addToOrder(product)}
                                                >
                                                    <CardContent className="p-2">
                                                        <div className="aspect-square mb-1.5 bg-muted rounded overflow-hidden">
                                                            {product.thumbnail ? (
                                                                <img
                                                                    src={getProductImageUrl(product.thumbnail) || ''}
                                                                    alt={product.name}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = 'none';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Package className="h-8 w-8 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <h3 className="font-medium text-xs line-clamp-2 mb-1 min-h-[2rem]">
                                                            {product.name}
                                                        </h3>
                                                        <div className="flex items-center justify-between gap-1">
                                                            <p className="text-sm font-bold text-primary">
                                                                ₱{parseFloat(product.discountPrice || product.price).toFixed(2)}
                                                            </p>
                                                            <Badge variant={product.stock > 0 ? "secondary" : "destructive"} className="text-[10px] px-1 py-0">
                                                                {product.stock}
                                                            </Badge>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Side - Order Cart */}
                    <div className="lg:col-span-1">
                        <Card className="h-full flex flex-col">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <ShoppingCart className="h-4 w-4" />
                                        Order
                                    </CardTitle>
                                    <Badge variant="secondary">{orderItems.length}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col">
                                <ScrollArea className="flex-1 -mx-6 px-6">
                                    {orderItems.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p>No items in order</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 pb-4">
                                            {orderItems.map((item) => (
                                                <div key={item.id} className="border rounded-lg p-2">
                                                    <div className="flex gap-2 items-start">
                                                        <div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                                                            {item.thumbnail ? (
                                                                <img
                                                                    src={getProductImageUrl(item.thumbnail) || ''}
                                                                    alt={item.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Package className="h-4 w-4 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-1">
                                                                <h4 className="font-medium text-xs line-clamp-2 flex-1">
                                                                    {item.name}
                                                                </h4>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-6 w-6 flex-shrink-0"
                                                                    onClick={() => setDeleteItemId(item.id)}
                                                                >
                                                                    <Trash2 className="h-3 w-3 text-destructive" />
                                                                </Button>
                                                            </div>
                                                            <div className="flex items-center justify-between mt-1">
                                                                <div className="flex items-center gap-1">
                                                                    <Button
                                                                        size="icon"
                                                                        variant="outline"
                                                                        className="h-6 w-6"
                                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                    >
                                                                        <Minus className="h-3 w-3" />
                                                                    </Button>
                                                                    <span className="text-xs font-medium w-6 text-center">
                                                                        {item.quantity}
                                                                    </span>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="outline"
                                                                        className="h-6 w-6"
                                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                    >
                                                                        <Plus className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                                <span className="text-xs font-bold">
                                                                    ₱{(parseFloat(item.price) * item.quantity).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>

                                {/* Order Summary */}
                                {orderItems.length > 0 && (
                                    <div className="mt-3 pt-3 border-t space-y-2">
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">Subtotal:</span>
                                                <span>₱{calculateSubtotal().toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">Tax (12%):</span>
                                                <span>₱{calculateTax().toFixed(2)}</span>
                                            </div>
                                            {promoDiscount > 0 && (
                                                <div className="flex justify-between text-xs text-green-600">
                                                    <span>Promo Discount:</span>
                                                    <span>-₱{promoDiscount.toFixed(2)}</span>
                                                </div>
                                            )}
                                            <Separator className="my-1" />
                                            <div className="flex justify-between text-base font-bold">
                                                <span>Total:</span>
                                                <span className="text-primary">₱{calculateTotal().toFixed(2)}</span>
                                            </div>
                                        </div>

                                        {/* Promo Code Section */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium">Promo Code</label>
                                            {appliedPromo ? (
                                                <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                                                            {appliedPromo.code}
                                                        </p>
                                                        <p className="text-xs text-green-600 dark:text-green-500">
                                                            {appliedPromo.discountType === 'percentage'
                                                                ? `${appliedPromo.discountValue}% off`
                                                                : `₱${appliedPromo.discountValue} off`}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={removePromoCode}
                                                        className="h-7 text-xs"
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Enter code"
                                                        value={promoCode}
                                                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                                        className="h-9 text-xs"
                                                        onKeyPress={(e) => {
                                                            if (e.key === 'Enter') {
                                                                applyPromoCode();
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        onClick={applyPromoCode}
                                                        className="h-9 px-3 text-xs"
                                                        disabled={!promoCode.trim()}
                                                    >
                                                        Apply
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium">Payment Method</label>
                                            <Select value={paymentMethod} onValueChange={(value: 'cash' | 'cod' | 'gcash' | 'maya') => {
                                                setPaymentMethod(value);
                                                // Reset customer payment when changing method
                                                setCustomerPayment("");
                                                setShowNumericKeyboard(false);
                                            }}>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="cash">Cash</SelectItem>
                                                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                                                    <SelectItem value="gcash">GCash</SelectItem>
                                                    <SelectItem value="maya">Maya</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Customer Payment Input - Only for Cash */}
                                        {paymentMethod === 'cash' && (
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium">Customer Payment</label>
                                                <div
                                                    className="h-12 px-3 py-2 border rounded-md bg-background cursor-pointer hover:bg-accent/50 transition-colors flex items-center justify-center"
                                                    onClick={() => setShowNumericKeyboard(true)}
                                                >
                                                    {customerPayment ? (
                                                        <span className="text-2xl font-bold text-primary">
                                                            ₱{customerPayment}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">
                                                            Tap to enter amount
                                                        </span>
                                                    )}
                                                </div>
                                                {customerPayment && parseFloat(customerPayment) > 0 && (
                                                    <div className="mt-2 p-2 bg-muted rounded-md">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="font-medium">Change:</span>
                                                            <span className={`font-bold ${isPaymentSufficient()
                                                                ? "text-green-600"
                                                                : "text-red-600"
                                                                }`}>
                                                                ₱{calculateChange().toFixed(2)}
                                                            </span>
                                                        </div>
                                                        {!isPaymentSufficient() && (
                                                            <p className="text-xs text-red-600 mt-1">
                                                                Insufficient payment
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <Button
                                            className="w-full"
                                            onClick={handleCompleteTransaction}
                                            disabled={isProcessing || (paymentMethod === 'cash' && !isPaymentSufficient())}
                                        >
                                            <CreditCard className="h-4 w-4 mr-2" />
                                            {isProcessing
                                                ? "Processing..."
                                                : "Complete Transaction"
                                            }
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteItemId} onOpenChange={() => setDeleteItemId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Item?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove this item from the order?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteItemId && removeItem(deleteItemId)}>
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* On-Screen Keyboard */}
            {showKeyboard && (
                <OnScreenKeyboard
                    onKeyPress={handleKeyPress}
                    onBackspace={handleBackspace}
                    onClear={handleClearSearch}
                    onClose={() => setShowKeyboard(false)}
                />
            )}

            {/* Numeric Keyboard for Payment */}
            {showNumericKeyboard && (
                <NumericKeyboard
                    onKeyPress={handleNumericKeyPress}
                    onClear={handleClearPayment}
                    onClose={() => setShowNumericKeyboard(false)}
                    currentValue={customerPayment}
                />
            )}
        </div>
    );
};

export { Transaction };

