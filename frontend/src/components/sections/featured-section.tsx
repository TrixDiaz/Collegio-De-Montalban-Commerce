import { Product } from "@/components/product";
import { ErrorBoundary } from "@/components/ErrorBoundary";

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

interface FeaturedSectionProps {
    products: ProductType[];
}

const FeaturedSection = ({ products }: FeaturedSectionProps) => {
    // Don't render if we don't have enough products
    if (!products || products.length < 3) {
        return null;
    }

    return (
        <section>
            <h2 className="text-4xl font-bold mb-8">Featured Tiles Products</h2>
            <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                    {/* Left Column with Featured Product */}
                    <div className="col-span-1 lg:col-span-2 flex justify-center items-center bg-secondary/20 h-full rounded-xl shadow p-6">
                        <ErrorBoundary>
                            <Product product={products[ 0 ]} className="h-96" />
                        </ErrorBoundary>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-secondary/20 rounded-xl shadow p-6 flex justify-center items-center ">
                            <ErrorBoundary>
                                <Product product={products[ 1 ]} className="h-56" />
                            </ErrorBoundary>
                        </div>
                        <div className="bg-secondary/20 rounded-xl shadow p-6 flex justify-center items-center ">
                            <ErrorBoundary>
                                <Product product={products[ 2 ]} className="h-56" />
                            </ErrorBoundary>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export { FeaturedSection };
