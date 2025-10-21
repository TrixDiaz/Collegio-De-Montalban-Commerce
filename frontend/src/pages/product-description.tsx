import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Star, ShoppingCart, Minus, Plus } from "lucide-react";
import { apiService } from "@/services/api";
import { useCart } from "@/contexts/cart-context";
import { getImageUrl } from "@/lib/utils";
import { toast } from "sonner";

interface ProductType {
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

const ProductDescription = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [ product, setProduct ] = useState<ProductType | null>(null);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState<string | null>(null);
    const [ selectedImage, setSelectedImage ] = useState(0);
    const [ quantity, setQuantity ] = useState(1);
    const [ isAddingToCart, setIsAddingToCart ] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const response = await apiService.getProductById(id);

                if (response.success) {
                    setProduct(response.product);
                } else {
                    setError("Product not found");
                }
            } catch (err) {
                console.error("Error fetching product:", err);
                setError("Failed to fetch product");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [ id ]);

    const handleAddToCart = async () => {
        if (!product) return;

        setIsAddingToCart(true);
        try {
            // Add multiple items based on quantity
            for (let i = 0; i < quantity; i++) {
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
            }

            // Show success toast
            toast.success(`${product.name} added to cart!`);

            console.log(`Added ${quantity} ${product.name} to cart`);
        } catch (err) {
            console.error("Error adding to cart:", err);
            toast.error("Failed to add item to cart", {
                description: "Please try again later",
                duration: 3000,
            });
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleQuantityChange = (change: number) => {
        setQuantity(prev => Math.max(1, Math.min(product?.stock || 1, prev + change)));
    };

    if (loading) {
        return (
            <div className="container max-w-7xl mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-32 mb-4"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="h-96 bg-gray-300 rounded"></div>
                            <div className="flex space-x-2">
                                {[ 1, 2, 3, 4 ].map(i => (
                                    <div key={i} className="h-20 w-20 bg-gray-300 rounded"></div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="container max-w-7xl mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500 mb-4">Product Not Found</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => window.location.reload()}>
                            Retry
                        </Button>
                        <Button onClick={() => navigate(-1)}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Go Back
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const currentPrice = product.discountPrice || product.price;
    const originalPrice = product.discount ? product.price : null;
    const discountPercentage = product.discount && originalPrice
        ? Math.round(((parseFloat(originalPrice) - parseFloat(currentPrice)) / parseFloat(originalPrice)) * 100)
        : 0;

    return (
        <div className="container max-w-7xl mx-auto px-4 py-8">
            {/* Back Button */}
            <div className="flex gap-4 mb-6">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Images */}
                <div className="space-y-4">
                    {/* Main Image */}
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                            src={getImageUrl(product.images[ selectedImage ] || product.thumbnail)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Thumbnail Images */}
                    {product.images.length > 1 && (
                        <div className="flex space-x-2 overflow-x-auto">
                            {product.images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === index ? 'border-primary' : 'border-transparent'
                                        }`}
                                >
                                    <img
                                        src={getImageUrl(image)}
                                        alt={`${product.name} ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                    {/* Product Title and Badges */}
                    <div>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {product.isNew && <Badge variant="secondary" className="bg-green-100 text-green-800">New</Badge>}
                            {product.isBestSeller && <Badge variant="secondary" className="bg-blue-100 text-blue-800">Best Seller</Badge>}
                            {product.isTopRated && <Badge variant="secondary" className="bg-purple-100 text-purple-800">Top Rated</Badge>}
                            {product.isOnSale && <Badge variant="destructive">Sale</Badge>}
                            {product.isHot && <Badge variant="secondary" className="bg-orange-100 text-orange-800">Hot</Badge>}
                            {product.isTrending && <Badge variant="secondary" className="bg-pink-100 text-pink-800">Trending</Badge>}
                            {product.isFeatured && <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Featured</Badge>}
                        </div>
                        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                        <div className="flex items-center space-x-2 mb-2">
                            <div className="flex items-center">
                                {[ ...Array(5) ].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-4 w-4 ${i < Math.floor(parseFloat(product.rating))
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-gray-600">
                                {product.rating} ({product.numReviews} reviews)
                            </span>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center space-x-4">
                        <span className="text-3xl font-bold text-primary">
                            ₱{parseFloat(currentPrice).toLocaleString()}
                        </span>
                        {originalPrice && (
                            <>
                                <span className="text-xl text-gray-500 line-through">
                                    ₱{parseFloat(originalPrice).toLocaleString()}
                                </span>
                                <Badge variant="destructive" className="text-sm">
                                    -{discountPercentage}%
                                </Badge>
                            </>
                        )}
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Stock:</span>
                        <span className={`text-sm font-medium ${product.stock > 10 ? 'text-green-600' :
                            product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                            {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                        </span>
                    </div>

                    <Separator />

                    {/* Description */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Description</h3>
                        <p className="text-gray-600 leading-relaxed">{product.description}</p>
                    </div>

                    {/* Product Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">Brand:</span>
                            <span className="ml-2 font-medium">{product.brand}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Category:</span>
                            <span className="ml-2 font-medium">{product.category}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Sold:</span>
                            <span className="ml-2 font-medium">{product.sold} units</span>
                        </div>
                        <div>
                            <span className="text-gray-600">SKU:</span>
                            <span className="ml-2 font-medium">{product.id}</span>
                        </div>
                    </div>

                    {/* Quantity and Add to Cart */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium">Quantity:</span>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuantityChange(-1)}
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-12 text-center font-medium">{quantity}</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuantityChange(1)}
                                    disabled={quantity >= product.stock}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <Button
                        size="lg"
                        onClick={handleAddToCart}
                        disabled={product.stock === 0 || isAddingToCart}
                        className="w-full"
                    >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export { ProductDescription };
