import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Search, Star, Package, X } from "lucide-react"
import { apiService } from "@/services/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getImageUrl } from "@/lib/utils"

interface Product {
    id: string;
    name: string;
    price: string;
    discountPrice?: string;
    thumbnail: string;
    brand: string;
    category: string;
    rating: string;
    isFeatured: boolean;
}

interface SearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
    const [ searchQuery, setSearchQuery ] = useState("")
    const [ featuredProducts, setFeaturedProducts ] = useState<Product[]>([])
    const [ searchResults, setSearchResults ] = useState<Product[]>([])
    const [ loading, setLoading ] = useState(false)
    const navigate = useNavigate()
    const [ searchParams, setSearchParams ] = useSearchParams()

    // Initialize search query from URL on component mount
    useEffect(() => {
        const urlQuery = searchParams.get('q')
        if (urlQuery) {
            setSearchQuery(urlQuery)
        }
    }, [ searchParams ])

    // Fetch random products on component mount
    useEffect(() => {
        const fetchRandomProducts = async () => {
            try {
                const response = await apiService.getProducts({
                    limit: 5,
                    sortBy: "createdAt",
                    sortOrder: "desc"
                })
                console.log("Random products response:", response)
                if (response.success && response.data && response.data.products && Array.isArray(response.data.products)) {
                    // Shuffle the products to get random order
                    const shuffled = response.data.products.sort(() => Math.random() - 0.5)
                    setFeaturedProducts(shuffled.slice(0, 5))
                } else {
                    console.error("Invalid response structure:", response)
                    setFeaturedProducts([])
                }
            } catch (error) {
                console.error("Error fetching random products:", error)
            }
        }
        fetchRandomProducts()
    }, [])

    // Search products when query changes
    useEffect(() => {
        if (searchQuery.trim().length > 0) {
            // Update URL with search query
            const newSearchParams = new URLSearchParams(searchParams)
            newSearchParams.set('q', searchQuery)
            setSearchParams(newSearchParams)

            const searchProducts = async () => {
                setLoading(true)
                try {
                    const searchResponse = await apiService.getProducts({
                        search: searchQuery,
                        limit: 5,
                    })
                    console.log("Search response:", searchResponse)

                    if (searchResponse.success && searchResponse.data && searchResponse.data.products && Array.isArray(searchResponse.data.products)) {
                        console.log("Search results:", searchResponse.data.products)
                        setSearchResults(searchResponse.data.products)
                    } else {
                        console.log("Search failed:", searchResponse.message)
                        setSearchResults([])
                    }
                } catch (error) {
                    console.error("Error searching products:", error)
                    setSearchResults([])
                } finally {
                    setLoading(false)
                }
            }

            const timeoutId = setTimeout(searchProducts, 300) // Debounce search
            return () => clearTimeout(timeoutId)
        } else {
            // Clear search query from URL when empty
            const newSearchParams = new URLSearchParams(searchParams)
            newSearchParams.delete('q')
            setSearchParams(newSearchParams)
            setSearchResults([])
        }
    }, [ searchQuery, searchParams, setSearchParams ])

    const handleProductClick = (productId: string) => {
        console.log("Product clicked:", productId)
        navigate(`/product/${productId}`)
        onOpenChange(false)
    }


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Search Products
                    </DialogTitle>
                    <DialogDescription>
                        Search for products by name, brand, or category. Click on any product to view details.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-10"
                            autoFocus
                        />
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSearchQuery("")}
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                    </div>

                    {/* Search Results */}
                    <div className="flex-1 overflow-y-auto">
                        {searchQuery.trim().length === 0 ? (
                            // Show random products by default
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-muted-foreground">Random Products</h3>
                                {featuredProducts.length > 0 ? (
                                    <div className="space-y-2">
                                        {featuredProducts.map((product) => (
                                            <div
                                                key={product.id}
                                                onClick={() => handleProductClick(product.id)}
                                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                                            >
                                                <img
                                                    src={getImageUrl(product.thumbnail || '')}
                                                    alt={product.name || 'Product'}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{product.name || 'Unnamed Product'}</p>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {product.brand || 'Unknown Brand'} • {product.category || 'Uncategorized'}
                                                    </p>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <div className="flex items-center">
                                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                            <span className="text-xs ml-1">{product.rating || '0'}</span>
                                                        </div>
                                                        <Badge variant="secondary" className="text-xs">
                                                            ₱{product.discountPrice ? parseFloat(product.discountPrice).toFixed(2) : parseFloat(product.price || '0').toFixed(2)}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                                        <Package className="mr-2 h-4 w-4" />
                                        <span>No products available</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Show search results when typing
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-muted-foreground">Search Results</h3>
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                        <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <div className="space-y-2">
                                        {searchResults.map((product) => (
                                            <div
                                                key={product.id}
                                                onClick={() => handleProductClick(product.id)}
                                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                                            >
                                                <img
                                                    src={getImageUrl(product.thumbnail || '')}
                                                    alt={product.name || 'Product'}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{product.name || 'Unnamed Product'}</p>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {product.brand || 'Unknown Brand'} • {product.category || 'Uncategorized'}
                                                    </p>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <div className="flex items-center">
                                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                            <span className="text-xs ml-1">{product.rating || '0'}</span>
                                                        </div>
                                                        <Badge variant="secondary" className="text-xs">
                                                            ₱{product.discountPrice ? parseFloat(product.discountPrice).toFixed(2) : parseFloat(product.price || '0').toFixed(2)}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                                        <Package className="mr-2 h-4 w-4" />
                                        <span>No products found for "{searchQuery}"</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export { SearchDialog }
