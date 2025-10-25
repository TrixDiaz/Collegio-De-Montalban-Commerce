import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Plus,
  Search,
  Edit,
  Trash2,
  Package
} from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Loading } from '@/components/ui/loading';
import { useProducts, useBrands, useCategories, useProductMutations } from '@/hooks/use-products';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { ProductForm } from '@/components/forms/product-form';

interface Product {
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
  categoryId: string;
  brandId: string;
  createdAt: string;
  updatedAt: string;
}



export const Products = () => {
  const [ products, setProducts ] = useState<Product[]>([]);
  const [ searchTerm, setSearchTerm ] = useState('');
  const [ debouncedSearchTerm, setDebouncedSearchTerm ] = useState('');
  const [ isCreateDialogOpen, setIsCreateDialogOpen ] = useState(false);
  const [ isEditDialogOpen, setIsEditDialogOpen ] = useState(false);
  const [ selectedProduct, setSelectedProduct ] = useState<Product | null>(null);
  const [ page, setPage ] = useState(1);
  const [ totalPages, setTotalPages ] = useState(1);
  const [ selectedFiles, setSelectedFiles ] = useState<File[]>([]);
  const [ selectedThumbnail, setSelectedThumbnail ] = useState<File | null>(null);
  const [ previewImages, setPreviewImages ] = useState<string[]>([]);
  const [ previewThumbnail, setPreviewThumbnail ] = useState<string | null>(null);
  const [ deleteDialogOpen, setDeleteDialogOpen ] = useState(false);
  const [ productToDelete, setProductToDelete ] = useState<Product | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Utility function to get full image URL
  const getImageUrl = useCallback((imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;

    // Normalize path separators - database stores paths like "uploads/products/thumbnail-..."
    const normalizedPath = imagePath.replace(/\\/g, '/');

    // The backend serves static files from /uploads, so we need to remove the "uploads/" prefix
    // if it exists, since the backend route is already "/uploads"
    let cleanPath = normalizedPath;
    if (normalizedPath.startsWith('/uploads/')) {
      cleanPath = normalizedPath.substring(9); // Remove "/uploads/" prefix
    } else if (normalizedPath.startsWith('uploads/')) {
      cleanPath = normalizedPath.substring(8); // Remove "uploads/" prefix
    }

    // Ensure no double slashes in the final URL
    const finalUrl = `http://localhost:5000/uploads/${cleanPath}`.replace(/\/+/g, '/').replace('http:/', 'http://');
    console.log('Image URL:', finalUrl, 'Original path:', imagePath);
    return finalUrl;
  }, []);

  // Fetch brands with optimized caching
  const { data: brandsData } = useBrands(1, 100);

  // Fetch categories with optimized caching
  const { data: categoriesData } = useCategories(1, 100);

  // Fetch products with optimized caching
  const { data: productsData, isLoading: productsLoading } = useProducts(page, 10, debouncedSearchTerm);

  // Use optimized product mutations
  const { createProduct, updateProduct, deleteProduct } = useProductMutations();

  useEffect(() => {
    if (productsData) {
      console.log('Products data structure:', productsData);
      console.log('Products array:', productsData.products);
      console.log('Total pages:', productsData.totalPages);
      setProducts(productsData.products || []);
      setTotalPages(productsData.totalPages || 1);
    }
  }, [ productsData ]);

  // Debounce search term with 3-second delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1000);

    return () => clearTimeout(timer);
  }, [ searchTerm ]);


  // Clean up object URLs on component unmount
  useEffect(() => {
    return () => {
      previewImages.forEach(url => URL.revokeObjectURL(url));
      if (previewThumbnail) {
        URL.revokeObjectURL(previewThumbnail);
      }
    };
  }, [ previewImages, previewThumbnail ]);

  const handleCreateProduct = async (data: {
    name: string;
    description: string;
    price: string;
    discount?: boolean;
    discountPrice?: string;
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
  }) => {
    console.log('Form data received:', data);
    const formData = new FormData();

    // Add form data
    Object.keys(data).forEach(key => {
      if (data[ key as keyof typeof data ] !== null && data[ key as keyof typeof data ] !== undefined) {
        const value = String(data[ key as keyof typeof data ]);
        console.log(`Adding to FormData: ${key} = ${value}`);
        formData.append(key, value);
      }
    });

    // Debug: Log all FormData entries
    console.log('FormData contents:');
    for (const [ key, value ] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    // Add thumbnail
    if (selectedThumbnail) {
      console.log('Adding thumbnail:', selectedThumbnail.name);
      formData.append('thumbnail', selectedThumbnail);
    }

    // Add images
    selectedFiles.forEach(file => {
      console.log('Adding image:', file.name);
      formData.append('images', file);
    });

    createProduct.mutate(formData, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        setSelectedFiles([]);
        setSelectedThumbnail(null);
        setPreviewImages([]);
        setPreviewThumbnail(null);
      }
    });
  };

  const handleUpdateProduct = async (data: {
    name: string;
    description: string;
    price: string;
    discount?: boolean;
    discountPrice?: string;
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
  }) => {
    if (!selectedProduct) return;

    const formData = new FormData();

    // Add form data
    Object.keys(data).forEach(key => {
      if (data[ key as keyof typeof data ] !== null && data[ key as keyof typeof data ] !== undefined) {
        formData.append(key, String(data[ key as keyof typeof data ]));
      }
    });

    // Add thumbnail
    if (selectedThumbnail) {
      console.log('Adding thumbnail for update:', selectedThumbnail.name);
      formData.append('thumbnail', selectedThumbnail);
    }

    // Add images
    selectedFiles.forEach(file => {
      console.log('Adding image for update:', file.name);
      formData.append('images', file);
    });

    updateProduct.mutate({ id: selectedProduct.id, formData }, {
      onSuccess: () => {
        setIsEditDialogOpen(false);
        setSelectedProduct(null);
        setSelectedFiles([]);
        setSelectedThumbnail(null);
        setPreviewImages([]);
        setPreviewThumbnail(null);
      }
    });
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteProduct = () => {
    if (productToDelete) {
      deleteProduct.mutate(productToDelete.id);
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const filteredProducts = (products || []).filter(product =>
    product.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  if (productsLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loading text="Loading products..." />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground">
              Manage your product catalog
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
          </Dialog>

          <ProductForm
            isOpen={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            onSubmit={handleCreateProduct}
            isEdit={false}
            product={null}
            categories={categoriesData?.categories || []}
            brands={brandsData?.brands || []}
            isLoading={createProduct.isPending}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            selectedThumbnail={selectedThumbnail}
            setSelectedThumbnail={setSelectedThumbnail}
            previewImages={previewImages}
            setPreviewImages={setPreviewImages}
            previewThumbnail={previewThumbnail}
            setPreviewThumbnail={setPreviewThumbnail}
            fileInputRef={fileInputRef}
            thumbnailInputRef={thumbnailInputRef}
          />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Products</CardTitle>
                <CardDescription>
                  A list of all products in your catalog
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-6 w-6 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category & Brand</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock & Sales</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                          {product.thumbnail ? (
                            <img
                              src={getImageUrl(product.thumbnail)}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-md"
                              crossOrigin="anonymous"
                              onError={(e) => {
                                console.error('Table thumbnail failed to load:', product.thumbnail);
                                // Replace with fallback icon
                                const img = e.target as HTMLImageElement;
                                img.style.display = 'none';
                                const parent = img.parentElement;
                                if (parent) {
                                  parent.innerHTML = '<svg class="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                                }
                              }}
                              onLoad={() => {
                                console.log('Image loaded successfully:', product.thumbnail);
                              }}
                            />
                          ) : (
                            <Package className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline">{product.category}</Badge>
                        <div className="text-xs text-muted-foreground">{product.brand}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <div>₱{product.price}</div>
                        {product.discount && product.discountPrice && (
                          <div className="text-sm text-green-600">
                            ${product.discountPrice}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>Stock: {product.stock}</div>
                        <div className="text-xs text-muted-foreground">Sold: {product.sold}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.isNew && <Badge variant="default" className="text-xs">New</Badge>}
                        {product.isBestSeller && <Badge variant="secondary" className="text-xs">Best Seller</Badge>}
                        {product.isFeatured && <Badge variant="outline" className="text-xs">Featured</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(product.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(product)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteProduct(product)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Page {page} of {Math.max(totalPages, 1)}
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage(Math.max(1, page - 1))}
                  className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {Array.from({ length: Math.max(totalPages, 1) }, (_, i) => i + 1).map((pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => setPage(pageNum)}
                    isActive={page === pageNum}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

        <ProductForm
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={handleUpdateProduct}
          isEdit={true}
          product={selectedProduct}
          categories={categoriesData?.categories || []}
          brands={brandsData?.brands || []}
          isLoading={updateProduct.isPending}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          selectedThumbnail={selectedThumbnail}
          setSelectedThumbnail={setSelectedThumbnail}
          previewImages={previewImages}
          setPreviewImages={setPreviewImages}
          previewThumbnail={previewThumbnail}
          setPreviewThumbnail={setPreviewThumbnail}
          fileInputRef={fileInputRef}
          thumbnailInputRef={thumbnailInputRef}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDeleteProduct}
          title="Delete Product"
          description={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="destructive"
          isLoading={deleteProduct.isPending}
        />
      </div>
    </MainLayout>
  );
};