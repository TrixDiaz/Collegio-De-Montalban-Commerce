import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImageUpload, ThumbnailUpload } from '@/components/ui/image-upload';
import { useCallback, useEffect } from 'react';

export const productFormSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.string().min(1, 'Price is required'),
    discount: z.boolean().optional(),
    discountPrice: z.string().optional(),
    categoryId: z.string().min(1, 'Category is required'),
    brandId: z.string().min(1, 'Brand is required'),
    stock: z.number().min(0, 'Stock must be non-negative'),
    isNew: z.boolean().optional(),
    isBestSeller: z.boolean().optional(),
    isTopRated: z.boolean().optional(),
    isOnSale: z.boolean().optional(),
    isTrending: z.boolean().optional(),
    isHot: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
});

interface Product {
    id: string;
    name: string;
    description: string;
    price: string | number;
    discount?: boolean;
    discountPrice?: string | number;
    categoryId: string;
    brandId: string;
    stock: number;
    isNew?: boolean;
    isBestSeller?: boolean;
    isTopRated?: boolean;
    isOnSale?: boolean;
    isTrending?: boolean;
    isHot?: boolean;
    isFeatured?: boolean;
    images?: string[];
    thumbnail?: string;
    createdAt: string;
    updatedAt: string;
}

interface Category {
    id: string;
    name: string;
}

interface Brand {
    id: string;
    name: string;
}

interface ProductFormProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: z.infer<typeof productFormSchema>) => void;
    isEdit?: boolean;
    product?: Product | null;
    categories: Category[];
    brands: Brand[];
    isLoading: boolean;
    selectedFiles: File[];
    setSelectedFiles: (files: File[]) => void;
    selectedThumbnail: File | null;
    setSelectedThumbnail: (file: File | null) => void;
    previewImages: string[];
    setPreviewImages: (images: string[]) => void;
    previewThumbnail: string | null;
    setPreviewThumbnail: (thumbnail: string | null) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    thumbnailInputRef: React.RefObject<HTMLInputElement | null>;
}

export const ProductForm = ({
    isOpen,
    onOpenChange,
    onSubmit,
    isEdit = false,
    product,
    categories,
    brands,
    isLoading,
    selectedFiles,
    setSelectedFiles,
    setSelectedThumbnail,
    previewImages,
    setPreviewImages,
    previewThumbnail,
    setPreviewThumbnail,
}: ProductFormProps) => {
    const form = useForm<z.infer<typeof productFormSchema>>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: '',
            description: '',
            price: '',
            discount: false,
            discountPrice: '',
            categoryId: '',
            brandId: '',
            stock: 0,
            isNew: false,
            isBestSeller: false,
            isTopRated: false,
            isOnSale: false,
            isTrending: false,
            isHot: false,
            isFeatured: false,
        },
    });

    // Update form values when product changes
    useEffect(() => {
        if (product && isEdit) {
            form.reset({
                name: product.name || '',
                description: product.description || '',
                price: typeof product.price === 'number' ? product.price.toString() : product.price || '',
                discount: product.discount || false,
                discountPrice: typeof product.discountPrice === 'number' ? product.discountPrice.toString() : product.discountPrice || '',
                categoryId: product.categoryId || '',
                brandId: product.brandId || '',
                stock: product.stock || 0,
                isNew: product.isNew || false,
                isBestSeller: product.isBestSeller || false,
                isTopRated: product.isTopRated || false,
                isOnSale: product.isOnSale || false,
                isTrending: product.isTrending || false,
                isHot: product.isHot || false,
                isFeatured: product.isFeatured || false,
            });

            // Populate existing images for edit mode
            if (product.images && product.images.length > 0) {
                const existingImageUrls = product.images.map(imagePath => {
                    // Convert relative path to full URL
                    if (imagePath.startsWith('http')) return imagePath;

                    // Remove 'uploads/' prefix if it exists to avoid double uploads/
                    let cleanPath = imagePath;
                    if (imagePath.startsWith('uploads/')) {
                        cleanPath = imagePath.substring(8); // Remove 'uploads/' prefix
                    }
                    return `http://localhost:5000/uploads/${cleanPath}`;
                });
                setPreviewImages(existingImageUrls);
            }

            // Populate existing thumbnail for edit mode
            if (product.thumbnail) {
                let thumbnailUrl;
                if (product.thumbnail.startsWith('http')) {
                    thumbnailUrl = product.thumbnail;
                } else {
                    // Remove 'uploads/' prefix if it exists to avoid double uploads/
                    let cleanPath = product.thumbnail;
                    if (product.thumbnail.startsWith('uploads/')) {
                        cleanPath = product.thumbnail.substring(8); // Remove 'uploads/' prefix
                    }
                    thumbnailUrl = `http://localhost:5000/uploads/${cleanPath}`;
                }
                setPreviewThumbnail(thumbnailUrl);
            }
        } else if (!isEdit) {
            // Reset form for create mode
            form.reset({
                name: '',
                description: '',
                price: '',
                discount: false,
                discountPrice: '',
                categoryId: '',
                brandId: '',
                stock: 0,
                isNew: false,
                isBestSeller: false,
                isTopRated: false,
                isOnSale: false,
                isTrending: false,
                isHot: false,
                isFeatured: false,
            });

            // Clear images for create mode
            setPreviewImages([]);
            setPreviewThumbnail(null);
            setSelectedFiles([]);
            setSelectedThumbnail(null);
        }
    }, [ product, isEdit, form ]);

    const handleSubmit = (data: z.infer<typeof productFormSchema>) => {
        onSubmit(data);
    };

    // Handle file selection for images
    const handleFileSelect = useCallback((files: FileList | null) => {
        if (!files) return;

        const newFiles = Array.from(files);
        setSelectedFiles([ ...selectedFiles, ...newFiles ]);

        // Create preview URLs
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        setPreviewImages([ ...previewImages, ...newPreviews ]);
    }, [ setSelectedFiles, setPreviewImages ]);

    // Handle file selection for thumbnail
    const handleThumbnailSelect = useCallback((files: FileList | null) => {
        if (!files || files.length === 0) return;

        const file = files[ 0 ];
        setSelectedThumbnail(file);

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setPreviewThumbnail(previewUrl);
    }, [ setSelectedThumbnail, setPreviewThumbnail ]);

    // Handle image removal
    const handleRemoveImage = useCallback((index: number) => {
        const newFiles = selectedFiles.filter((_: File, i: number) => i !== index);
        setSelectedFiles(newFiles);

        const newPreviews = previewImages.filter((_: string, i: number) => i !== index);
        // Revoke the URL to prevent memory leaks
        URL.revokeObjectURL(previewImages[ index ]);
        setPreviewImages(newPreviews);
    }, [ selectedFiles, previewImages, setSelectedFiles, setPreviewImages ]);

    // Handle thumbnail removal
    const handleRemoveThumbnail = useCallback(() => {
        setSelectedThumbnail(null);
        if (previewThumbnail) {
            URL.revokeObjectURL(previewThumbnail);
        }
        setPreviewThumbnail(null);
    }, [ setSelectedThumbnail, setPreviewThumbnail, previewThumbnail ]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Product' : 'Create New Product'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update product information' : 'Add a new product to your catalog'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter product name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="0.00"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="brandId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Brand</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select brand" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {brands.map((brand) => (
                                                    <SelectItem key={brand.id} value={brand.id}>
                                                        {brand.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter product description"
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="stock"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stock</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="space-y-2">
                                <FormField
                                    control={form.control}
                                    name="discount"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Enable Discount</FormLabel>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                {form.watch('discount') && (
                                    <FormField
                                        control={form.control}
                                        name="discountPrice"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Discount Price</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="0.00"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Image Upload Section */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Product Images</label>
                                <ImageUpload
                                    onFileSelect={handleFileSelect}
                                    onRemoveImage={handleRemoveImage}
                                    previewImages={previewImages}
                                    selectedFiles={selectedFiles}
                                    maxFiles={10}
                                    multiple={true}
                                    disabled={isLoading}
                                    isLoading={isLoading}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Thumbnail</label>
                                <ThumbnailUpload
                                    onFileSelect={handleThumbnailSelect}
                                    onRemove={handleRemoveThumbnail}
                                    previewUrl={previewThumbnail}
                                    disabled={isLoading}
                                    isLoading={isLoading}
                                />
                            </div>
                        </div>

                        {/* Product Tags */}
                        <div className="space-y-4">
                            <label className="text-sm font-medium">Product Tags</label>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="isNew"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>New</FormLabel>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="isBestSeller"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Best Seller</FormLabel>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="isTopRated"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Top Rated</FormLabel>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="isOnSale"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>On Sale</FormLabel>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="isTrending"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Trending</FormLabel>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="isHot"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Hot</FormLabel>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="isFeatured"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Featured</FormLabel>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Product' : 'Create Product')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
