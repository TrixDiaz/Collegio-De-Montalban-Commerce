import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Product } from "@/components/product";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Loader2 } from "lucide-react";
import { apiService } from "@/services/api";

// Define the Product interface locally to avoid import issues
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

const features = [
    { key: "isOnSale", label: "Sale", color: "bg-red-500" },
    { key: "isHot", label: "Hot", color: "bg-orange-500" },
    { key: "isNew", label: "New", color: "bg-green-500" },
    { key: "isBestSeller", label: "Best Seller", color: "bg-blue-500" },
    { key: "isTopRated", label: "Top Rated", color: "bg-purple-500" },
    { key: "isTrending", label: "Trending", color: "bg-pink-500" },
    { key: "isFeatured", label: "Featured", color: "bg-yellow-500" }
];

// Maximum price for the price range slider
const MAX_PRICE = 100000;

const Catalog = () => {
    const [ products, setProducts ] = useState<ApiProduct[]>([]);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState<string | null>(null);
    const [ categories, setCategories ] = useState<string[]>([]);
    const [ brands, setBrands ] = useState<string[]>([]);
    const [ searchParams, setSearchParams ] = useSearchParams();

    // Initialize state from URL parameters
    const [ searchTerm, setSearchTerm ] = useState(searchParams.get('q') || "");
    const [ selectedCategory, setSelectedCategory ] = useState(searchParams.get('category') || "All");
    const [ selectedBrand, setSelectedBrand ] = useState(searchParams.get('brand') || "All");
    const [ priceRange, setPriceRange ] = useState([
        parseInt(searchParams.get('minPrice') || '0'),
        parseInt(searchParams.get('maxPrice') || MAX_PRICE.toString())
    ]);
    const [ selectedFeatures, setSelectedFeatures ] = useState<string[]>(
        searchParams.get('features')?.split(',').filter(Boolean) || []
    );
    const [ showFilters, setShowFilters ] = useState(false);
    const [ sortBy, setSortBy ] = useState(searchParams.get('sort') || "name");

    // Fetch products on component mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await apiService.getProducts({
                    limit: 100, // Get more products
                    inStock: true,
                });

                if (response.success) {
                    setProducts(response.data.products);
                    setCategories([ "All", ...response.data.filters.availableCategories ]);
                    setBrands([ "All", ...response.data.filters.availableBrands ]);
                } else {
                    setError("Failed to fetch products");
                }
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Failed to fetch products");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        const filtered = products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
            const matchesBrand = selectedBrand === "All" || product.brand === selectedBrand;
            const productPrice = product.discountPrice ? parseFloat(product.discountPrice) : parseFloat(product.price);
            const matchesPrice = productPrice >= priceRange[ 0 ] && productPrice <= priceRange[ 1 ];
            const matchesFeatures = selectedFeatures.length === 0 || selectedFeatures.some(feature => product[ feature as keyof ApiProduct ]);

            return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesFeatures;
        });

        // Sort products
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "price-low":
                    const priceA = a.discountPrice ? parseFloat(a.discountPrice) : parseFloat(a.price);
                    const priceB = b.discountPrice ? parseFloat(b.discountPrice) : parseFloat(b.price);
                    return priceA - priceB;
                case "price-high":
                    const priceAHigh = a.discountPrice ? parseFloat(a.discountPrice) : parseFloat(a.price);
                    const priceBHigh = b.discountPrice ? parseFloat(b.discountPrice) : parseFloat(b.price);
                    return priceBHigh - priceAHigh;
                case "rating":
                    return parseFloat(b.rating) - parseFloat(a.rating);
                case "newest":
                    return b.isNew ? -1 : a.isNew ? 1 : 0;
                default:
                    return a.name.localeCompare(b.name);
            }
        });

        return filtered;
    }, [ products, searchTerm, selectedCategory, selectedBrand, priceRange, selectedFeatures, sortBy ]);

    // Update URL when filters change
    const updateURL = (newParams: Record<string, string | null>) => {
        const currentParams = new URLSearchParams(searchParams);

        Object.entries(newParams).forEach(([ key, value ]) => {
            if (value && value !== "All" && value !== "") {
                currentParams.set(key, value);
            } else {
                currentParams.delete(key);
            }
        });

        setSearchParams(currentParams);
    };

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCategory("All");
        setSelectedBrand("All");
        setPriceRange([ 0, MAX_PRICE ]);
        setSelectedFeatures([]);
        setSearchParams(new URLSearchParams()); // Clear all URL params
    };

    const toggleFeature = (featureKey: string) => {
        setSelectedFeatures(prev => {
            const newFeatures = prev.includes(featureKey)
                ? prev.filter(f => f !== featureKey)
                : [ ...prev, featureKey ];

            updateURL({ features: newFeatures.length > 0 ? newFeatures.join(',') : null });
            return newFeatures;
        });
    };

    return (
        <div className="container max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Filters Sidebar */}
                <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                    <Card className="sticky top-4 h-[calc(100vh-2rem)]">
                        <ScrollArea className="h-full">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold">Filters</h2>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="text-sm"
                                    >
                                        Clear All
                                    </Button>
                                </div>

                                {/* Search */}
                                <div className="mb-6">
                                    <label className="text-sm font-medium mb-2 block">Search</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            placeholder="Search products..."
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                updateURL({ q: e.target.value });
                                            }}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <Separator className="mb-6" />

                                {/* Category Filter */}
                                <div className="mb-6">
                                    <label className="text-sm font-medium mb-3 block">Category</label>
                                    <div className="space-y-2">
                                        {categories.map((category) => (
                                            <div key={category} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={category}
                                                    checked={selectedCategory === category}
                                                    onCheckedChange={() => {
                                                        setSelectedCategory(category);
                                                        updateURL({ category: category === "All" ? null : category });
                                                    }}
                                                />
                                                <label
                                                    htmlFor={category}
                                                    className="text-sm cursor-pointer"
                                                >
                                                    {category}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator className="mb-6" />

                                {/* Brand Filter */}
                                <div className="mb-6">
                                    <label className="text-sm font-medium mb-3 block">Brand</label>
                                    <div className="space-y-2">
                                        {brands.map((brand) => (
                                            <div key={brand} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={brand}
                                                    checked={selectedBrand === brand}
                                                    onCheckedChange={() => {
                                                        setSelectedBrand(brand);
                                                        updateURL({ brand: brand === "All" ? null : brand });
                                                    }}
                                                />
                                                <label
                                                    htmlFor={brand}
                                                    className="text-sm cursor-pointer"
                                                >
                                                    {brand}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator className="mb-6" />

                                {/* Price Range */}
                                <div className="mb-6">
                                    <label className="text-sm font-medium mb-3 block">
                                        Price Range: ₱{priceRange[ 0 ]} - ₱{priceRange[ 1 ]}
                                    </label>
                                    <Slider
                                        value={priceRange}
                                        onValueChange={(value) => {
                                            setPriceRange(value);
                                            updateURL({
                                                minPrice: value[ 0 ] === 0 ? null : value[ 0 ].toString(),
                                                maxPrice: value[ 1 ] === MAX_PRICE ? null : value[ 1 ].toString()
                                            });
                                        }}
                                        max={MAX_PRICE}
                                        min={0}
                                        step={100}
                                        className="w-full"
                                    />
                                </div>

                                <Separator className="mb-6" />

                                {/* Features Filter */}
                                <div className="mb-6">
                                    <label className="text-sm font-medium mb-3 block">Features</label>
                                    <div className="space-y-2">
                                        {features.map((feature) => (
                                            <div key={feature.key} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={feature.key}
                                                    checked={selectedFeatures.includes(feature.key)}
                                                    onCheckedChange={() => toggleFeature(feature.key)}
                                                />
                                                <label
                                                    htmlFor={feature.key}
                                                    className="text-sm cursor-pointer flex items-center gap-2"
                                                >
                                                    <div className={`w-3 h-3 rounded-full ${feature.color}`}></div>
                                                    {feature.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </ScrollArea>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold">Product Catalog</h1>
                            <p className="text-gray-600 mt-1">
                                Showing {filteredProducts.length} of {products.length} products
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Mobile Filter Toggle */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                className="lg:hidden"
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Filters
                            </Button>

                            {/* Sort Dropdown */}
                            <Select value={sortBy} onValueChange={(value) => {
                                setSortBy(value);
                                updateURL({ sort: value });
                            }}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name">Name (A-Z)</SelectItem>
                                    <SelectItem value="price-low">Price (Low to High)</SelectItem>
                                    <SelectItem value="price-high">Price (High to Low)</SelectItem>
                                    <SelectItem value="rating">Rating</SelectItem>
                                    <SelectItem value="newest">Newest</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <span className="ml-2">Loading products...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-500 text-lg">Error: {error}</p>
                            <Button
                                variant="outline"
                                onClick={() => window.location.reload()}
                                className="mt-4"
                            >
                                Retry
                            </Button>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <ScrollArea className="h-[calc(100vh-2rem)] w-full">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pr-4 pb-4">
                                {filteredProducts.map((product) => (
                                    <div key={product.id} className="h-80">
                                        <ErrorBoundary>
                                            <Product
                                                product={{
                                                    ...product,
                                                    images: product.images || [],
                                                    numReviews: product.numReviews || 0
                                                }}
                                            />
                                        </ErrorBoundary>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                            <Button
                                variant="outline"
                                onClick={clearFilters}
                                className="mt-4"
                            >
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export { Catalog };
