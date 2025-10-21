import { Marquee } from "@/components/ui/marque"
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

interface CarouselSectionProps {
    products: ProductType[];
}

const CarouselSection = ({ products }: CarouselSectionProps) => {
    // Don't render if we don't have products
    if (!products || products.length === 0) {
        return null;
    }

    return (
        <div>
            <Marquee
                fade={true}
                className="animate-marquee-left"
            >
                {products.map((product) => (
                    <ErrorBoundary key={product.id}>
                        <Product product={product} showPrice={false} showBrand={false} className="w-full h-56 px-8" />
                    </ErrorBoundary>
                ))}
            </Marquee>
        </div>
    );
};

export { CarouselSection };