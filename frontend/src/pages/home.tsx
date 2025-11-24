import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { FeaturedSection } from "@/components/sections/featured-section";
import { CarouselSection } from "@/components/sections/carousel-section";
import { HeroSection } from "@/components/sections/hero-sections";
import { apiService, API_BASE_URL } from "@/services/api";

interface ProductType {
    id: string;
    name: string;
    description: string;
    price: string;
    discount: boolean;
    discountPrice?: string;
    isAvailable: boolean;
    thumbnail: string;
    images: string[];
    category: string;
    brand: string;
    stock: number;
    sold: number;
    rating: string;
    isFeatured: boolean;
    isNew: boolean;
    isBestSeller: boolean;
    isTopRated: boolean;
    isTrending: boolean;
    isOnSale: boolean;
    isHot: boolean;
    numReviews: number;
    createdAt: string;
    updatedAt: string;
}

interface ApiProduct {
    id: string;
    name: string;
    description: string;
    price: string;
    discount?: boolean;
    discountPrice?: string;
    stock: number;
    thumbnail: string;
    images: string[];
    category: string;
    brand: string;
    sold: number;
    rating: string;
    numReviews: number;
    isFeatured: boolean;
    isNew: boolean;
    isBestSeller: boolean;
    isTopRated: boolean;
    isTrending: boolean;
    isOnSale: boolean;
    isHot: boolean;
}

const Home = () => {
    const [ products, setProducts ] = useState<ProductType[]>([]);
    const [ loading, setLoading ] = useState(true);
    const [ searchParams ] = useSearchParams();
    const { login } = useAuth();
    const navigate = useNavigate();
    const oauthProcessed = useRef(false);

    // Handle OAuth success
    const handleOAuthSuccess = useCallback(async () => {
        if (oauthProcessed.current) return;

        const token = searchParams.get('token');
        const refresh = searchParams.get('refresh');
        const oauth = searchParams.get('oauth');

        if (oauth === 'success' && token && refresh) {
            oauthProcessed.current = true;

            try {
                // URL decode the tokens
                const decodedToken = decodeURIComponent(token);
                const decodedRefresh = decodeURIComponent(refresh);

                // Get user data
                const response = await fetch(`${API_BASE_URL}/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${decodedToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const userData = await response.json();

                    // Login the user
                    login({
                        id: userData.user.id,
                        email: userData.user.email,
                        name: userData.user.name,
                        picture: userData.user.picture,
                        isVerified: userData.user.isVerified,
                    }, {
                        accessToken: decodedToken,
                        refreshToken: decodedRefresh
                    });

                    toast.success('Login successful!');

                    // Clean up URL parameters
                    navigate('/', { replace: true });
                } else {
                    throw new Error('Failed to get user data');
                }
            } catch (error) {
                console.error('OAuth success error:', error);
                toast.error('Authentication failed. Please try again.');
                navigate('/', { replace: true });
            }
        }
    }, [ searchParams, login, navigate ]);

    useEffect(() => {
        handleOAuthSuccess();
    }, [ handleOAuthSuccess ]);

    const fetchProducts = useCallback(async () => {
        try {
            const response = await apiService.getProducts({
                limit: 20,
                sortBy: "createdAt",
                sortOrder: "desc"
            });

            if (response.success) {
                const transformedProducts = response.data.products.map((product: ApiProduct) => ({
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    discount: product.discount || false,
                    discountPrice: product.discountPrice,
                    isAvailable: product.stock > 0,
                    thumbnail: product.thumbnail,
                    images: product.images,
                    category: product.category,
                    brand: product.brand,
                    stock: product.stock,
                    sold: product.sold,
                    rating: product.rating,
                    numReviews: product.numReviews,
                    isFeatured: product.isFeatured,
                    isNew: product.isNew,
                    isBestSeller: product.isBestSeller,
                    isTopRated: product.isTopRated,
                    isTrending: product.isTrending,
                    isOnSale: product.isOnSale,
                    isHot: product.isHot,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }));
                setProducts(transformedProducts);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [ fetchProducts ]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    const featuredProducts = products.filter(product => product && product.isFeatured).slice(0, 3);
    const carouselProducts = products.filter(product => product).slice(0, 10);

    return (
        <div>
            <div className="container max-w-7xl mx-auto px-4 space-y-12">
                <HeroSection />
                <FeaturedSection products={featuredProducts} />
                <CarouselSection products={carouselProducts} />
            </div>
        </div>
    );
};



export { Home };