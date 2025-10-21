import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, getImageUrl } from '@/lib/utils';
import { useCart } from '@/contexts/cart-context';
import { ShoppingCart, Star } from 'lucide-react';
import { toast } from 'sonner';
// Import the Product interface directly
interface ApiProduct {
    id: string;
    name: string;
    description: string;
    price: string;
    discount: boolean;
    discountPrice?: string;
    stock: number;
    sold: number;
    thumbnail: string;
    images: string[];
    rating: string;
    isNew: boolean;
    isBestSeller: boolean;
    isTopRated: boolean;
    isOnSale: boolean;
    isTrending: boolean;
    isHot: boolean;
    isFeatured: boolean;
    numReviews: number;
    category: string;
    brand: string;
    createdAt: string;
    updatedAt: string;
}

interface ProductData extends ApiProduct {
    isInCart?: boolean;
    isWishlisted?: boolean;
    viewCount?: number;
    lastViewed?: string;
    customTags?: string[];
    userRating?: number;
    userReview?: string;
    isRecommended?: boolean;
    discountPercentage?: number;
    originalPrice?: number;
    savings?: number;
    availability?: 'in-stock' | 'low-stock' | 'out-of-stock' | 'pre-order';
    shippingInfo?: {
        free: boolean;
        estimatedDays: number;
        cost: number;
    };
    warranty?: {
        period: string;
        type: string;
    };
}

interface ProductProps {
    product: ProductData;
    className?: string;
    showSale?: boolean;
    showBrand?: boolean;
    showName?: boolean;
    showPrice?: boolean;
    showAddToCart?: boolean;
}

const Product = ({
    product,
    className,
    showSale = true,
    showBrand = true,
    showName = true,
    showPrice = true,
    showAddToCart = true,
}: ProductProps) => {
    // Add null/undefined checks
    if (!product) {
        console.error('Product component received undefined product prop');
        return (
            <div className={cn("w-full h-full overflow-hidden flex items-center justify-center", className)}>
                <div className="text-center text-muted-foreground">
                    <p>Product not available</p>
                </div>
            </div>
        );
    }

    const [ currentImage, setCurrentImage ] = useState(product.thumbnail || '');
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const handleMouseEnter = () => {
        if (product.images && product.images.length > 0) {
            const randomIndex = Math.floor(Math.random() * product.images.length);
            setCurrentImage(product.images[ randomIndex ]);
        }
    };

    const handleMouseLeave = () => {
        setCurrentImage(product.thumbnail || '');
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        addToCart({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            discountPrice: product.discountPrice ? parseFloat(product.discountPrice) : undefined,
            thumbnail: product.thumbnail,
            brand: product.brand,
            category: product.category,
            stock: product.stock,
        });
        toast.success(`${product.name} added to cart!`);
    };

    const handleProductClick = () => {
        console.log("Product clicked with ID:", product.id);
        navigate(`/product/${product.id}`);
    };

    return (
        <div className={cn("w-full h-full overflow-hidden", className)}>
            {/* Product Image */}
            <div
                className="relative w-full h-full group cursor-pointer flex items-center justify-center"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleProductClick}
            >
                <img
                    src={getImageUrl(currentImage || product.thumbnail || '')}
                    alt={product.name || 'Product'}
                    className="max-h-full max-w-full object-contain transition-all duration-500 ease-in-out group-hover:scale-105"
                />

                {/* Status Badges - Top Left */}
                <div className="absolute top-1 left-1 flex flex-row gap-1">
                    <div className="flex flex-col gap-1">
                        {showSale && product.isOnSale && (
                            <Badge variant="destructive" className="font-medium text-xs px-1 py-0.5">
                                Sale
                            </Badge>
                        )}
                        {!product.isOnSale && product.isNew && (
                            <Badge variant="default" className="bg-green-600 hover:bg-green-700 font-medium text-xs px-1 py-0.5">
                                New
                            </Badge>
                        )}
                        {!product.isOnSale && !product.isNew && product.isBestSeller && (
                            <Badge variant="secondary" className="font-medium text-xs px-1 py-0.5">
                                Best Seller
                            </Badge>
                        )}
                    </div>
                    {/* Brand */}
                    {showBrand && product.brand && (
                        <Badge className="text-xs px-1 py-0.5">
                            {product.brand}
                        </Badge>
                    )}
                </div>

                {/* Rating - Top Right */}
                <div className="absolute top-1 right-1">
                    <div className="flex items-center gap-1 bg-secondary/90 backdrop-blur-sm rounded px-1 py-0.5">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">{product.rating || '0'}</span>
                    </div>
                </div>

                {/* Product Name - Bottom Left */}
                {showName && (
                    <div className="absolute bottom-1 left-1 max-w-[60%]">
                        <div className="border border-white/20 bg-secondary/90 backdrop-blur-sm rounded px-1 py-0.5 shadow-md">
                            <span className="font-medium text-xs leading-tight block truncate">
                                {product.name || 'Unnamed Product'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Price - Bottom Right */}
                {showPrice && (
                    <div className="absolute bottom-1 right-1">
                        <div className="bg-primary text-primary-foreground font-semibold text-xs rounded px-1 py-0.5 shadow-md">
                            ₱{product.discountPrice ? parseFloat(product.discountPrice).toFixed(2) : parseFloat(product.price || '0').toFixed(2)}
                        </div>
                    </div>
                )}

                {/* Add to Cart Button - Center */}
                {showAddToCart && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                            onClick={handleAddToCart}
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                        >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

export { Product };