import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { toast } from 'sonner';

// Query keys factory for better organization
export const productKeys = {
    all: [ 'products' ] as const,
    lists: () => [ ...productKeys.all, 'list' ] as const,
    list: (filters: Record<string, any>) => [ ...productKeys.lists(), { filters } ] as const,
    details: () => [ ...productKeys.all, 'detail' ] as const,
    detail: (id: string) => [ ...productKeys.details(), id ] as const,
};

export const brandKeys = {
    all: [ 'brands' ] as const,
    lists: () => [ ...brandKeys.all, 'list' ] as const,
    list: (filters: Record<string, any>) => [ ...brandKeys.lists(), { filters } ] as const,
    details: () => [ ...brandKeys.all, 'detail' ] as const,
    detail: (id: string) => [ ...brandKeys.details(), id ] as const,
};

export const categoryKeys = {
    all: [ 'categories' ] as const,
    lists: () => [ ...categoryKeys.all, 'list' ] as const,
    list: (filters: Record<string, any>) => [ ...categoryKeys.lists(), { filters } ] as const,
    details: () => [ ...categoryKeys.all, 'detail' ] as const,
    detail: (id: string) => [ ...categoryKeys.details(), id ] as const,
};

// Custom hook for products with optimized caching
export const useProducts = (page = 1, limit = 10, search?: string, category?: string, brand?: string) => {
    return useQuery({
        queryKey: productKeys.list({ page, limit, search, category, brand }),
        queryFn: async () => {
            const response = await apiService.getProducts(page, limit, search, category, brand);
            return response.data.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};

// Custom hook for brands with optimized caching
export const useBrands = (page = 1, limit = 100, search?: string) => {
    return useQuery({
        queryKey: brandKeys.list({ page, limit, search }),
        queryFn: async () => {
            const response = await apiService.getBrands(page, limit, search);
            return response.data.data.brands || [];
        },
        staleTime: 10 * 60 * 1000, // 10 minutes - brands change less frequently
        gcTime: 15 * 60 * 1000, // 15 minutes
        retry: 2,
    });
};

// Custom hook for categories with optimized caching
export const useCategories = (page = 1, limit = 100, search?: string) => {
    return useQuery({
        queryKey: categoryKeys.list({ page, limit, search }),
        queryFn: async () => {
            const response = await apiService.getCategories(page, limit, search);
            return response.data.data.categories || [];
        },
        staleTime: 10 * 60 * 1000, // 10 minutes - categories change less frequently
        gcTime: 15 * 60 * 1000, // 15 minutes
        retry: 2,
    });
};

// Custom hook for product mutations with optimized invalidation
export const useProductMutations = () => {
    const queryClient = useQueryClient();

    const createProduct = useMutation({
        mutationFn: async (formData: FormData) => {
            const response = await apiService.createProduct(formData);
            return response.data.product;
        },
        onSuccess: () => {
            // Invalidate all product queries
            queryClient.invalidateQueries({ queryKey: productKeys.all });
            toast.success('Product created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create product');
        },
    });

    const updateProduct = useMutation({
        mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
            const response = await apiService.updateProduct(id, formData);
            return response.data.product;
        },
        onSuccess: (data, variables) => {
            // Invalidate all product queries
            queryClient.invalidateQueries({ queryKey: productKeys.all });
            // Update the specific product in cache if it exists
            queryClient.setQueryData(productKeys.detail(variables.id), data);
            toast.success('Product updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update product');
        },
    });

    const deleteProduct = useMutation({
        mutationFn: async (productId: string) => {
            await apiService.deleteProduct(productId);
        },
        onSuccess: (_, productId) => {
            // Invalidate all product queries
            queryClient.invalidateQueries({ queryKey: productKeys.all });
            // Remove the specific product from cache
            queryClient.removeQueries({ queryKey: productKeys.detail(productId) });
            toast.success('Product deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete product');
        },
    });

    return {
        createProduct,
        updateProduct,
        deleteProduct,
    };
};

// Custom hook for brand mutations
export const useBrandMutations = () => {
    const queryClient = useQueryClient();

    const createBrand = useMutation({
        mutationFn: async (data: { name: string }) => {
            const response = await apiService.createBrand(data);
            return response.data.brand;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: brandKeys.all });
            toast.success('Brand created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create brand');
        },
    });

    const updateBrand = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: { name: string } }) => {
            const response = await apiService.updateBrand(id, data);
            return response.data.brand;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: brandKeys.all });
            queryClient.setQueryData(brandKeys.detail(variables.id), data);
            toast.success('Brand updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update brand');
        },
    });

    const deleteBrand = useMutation({
        mutationFn: async (brandId: string) => {
            await apiService.deleteBrand(brandId);
        },
        onSuccess: (_, brandId) => {
            queryClient.invalidateQueries({ queryKey: brandKeys.all });
            queryClient.removeQueries({ queryKey: brandKeys.detail(brandId) });
            toast.success('Brand deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete brand');
        },
    });

    return {
        createBrand,
        updateBrand,
        deleteBrand,
    };
};

// Custom hook for category mutations
export const useCategoryMutations = () => {
    const queryClient = useQueryClient();

    const createCategory = useMutation({
        mutationFn: async (data: { name: string }) => {
            const response = await apiService.createCategory(data);
            return response.data.category;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: categoryKeys.all });
            toast.success('Category created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create category');
        },
    });

    const updateCategory = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: { name: string } }) => {
            const response = await apiService.updateCategory(id, data);
            return response.data.category;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: categoryKeys.all });
            queryClient.setQueryData(categoryKeys.detail(variables.id), data);
            toast.success('Category updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update category');
        },
    });

    const deleteCategory = useMutation({
        mutationFn: async (categoryId: string) => {
            await apiService.deleteCategory(categoryId);
        },
        onSuccess: (_, categoryId) => {
            queryClient.invalidateQueries({ queryKey: categoryKeys.all });
            queryClient.removeQueries({ queryKey: categoryKeys.detail(categoryId) });
            toast.success('Category deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete category');
        },
    });

    return {
        createCategory,
        updateCategory,
        deleteCategory,
    };
};
