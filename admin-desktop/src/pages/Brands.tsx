import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    Tag,
} from 'lucide-react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { useState, useEffect } from 'react';
import { Loading } from '@/components/ui/loading';
import { useBrands, useBrandMutations } from '@/hooks/use-products';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { BrandForm } from '@/components/forms/brand-form';

interface Brand {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export const Brands = () => {
    const [ searchTerm, setSearchTerm ] = useState('');
    const [ isCreateDialogOpen, setIsCreateDialogOpen ] = useState(false);
    const [ isEditDialogOpen, setIsEditDialogOpen ] = useState(false);
    const [ editingBrand, setEditingBrand ] = useState<Brand | null>(null);
    const [ deleteDialogOpen, setDeleteDialogOpen ] = useState(false);
    const [ brandToDelete, setBrandToDelete ] = useState<Brand | null>(null);
    const [ page, setPage ] = useState(1);
    const [ totalPages, setTotalPages ] = useState(1);



    // Fetch brands with optimized caching
    const { data: brandsData, isLoading } = useBrands(page, 10);

    // Use optimized brand mutations
    const { createBrand, updateBrand, deleteBrand } = useBrandMutations();

    // Update total pages when data changes
    useEffect(() => {
        if (brandsData) {
            setTotalPages(brandsData.totalPages || 1);
        }
    }, [ brandsData ]);

    const handleCreateBrand = (data: { name: string }) => {
        createBrand.mutate(data, {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
            }
        });
    };

    const handleUpdateBrand = (data: { name: string }) => {
        if (!editingBrand) return;
        updateBrand.mutate({ id: editingBrand.id, data }, {
            onSuccess: () => {
                setIsEditDialogOpen(false);
                setEditingBrand(null);
            }
        });
    };

    const handleDeleteBrand = (brand: Brand) => {
        setBrandToDelete(brand);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteBrand = () => {
        if (brandToDelete) {
            deleteBrand.mutate(brandToDelete.id);
        }
    };

    const openEditDialog = (brand: Brand) => {
        setEditingBrand(brand);
        setIsEditDialogOpen(true);
    };

    const filteredBrands = (brandsData?.brands || []).filter((brand: Brand) =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-64">
                    <Loading text="Loading brands..." />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Brands</h1>
                        <p className="text-muted-foreground">
                            Manage your product brands
                        </p>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Brand
                            </Button>
                        </DialogTrigger>
                    </Dialog>

                    <BrandForm
                        isOpen={isCreateDialogOpen}
                        onOpenChange={setIsCreateDialogOpen}
                        onSubmit={handleCreateBrand}
                        isEdit={false}
                        brand={null}
                        isLoading={createBrand.isPending}
                    />
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>All Brands</CardTitle>
                                <CardDescription>
                                    A list of all brands in your catalog
                                </CardDescription>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search brands..."
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
                                    <TableHead>Brand</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Updated</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBrands.map((brand: Brand) => (
                                    <TableRow key={brand.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                                                    <Tag className="h-4 w-4" />
                                                </div>
                                                <div className="font-medium">{brand.name}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(brand.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(brand.updatedAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openEditDialog(brand)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteBrand(brand)}
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

                <BrandForm
                    isOpen={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    onSubmit={handleUpdateBrand}
                    isEdit={true}
                    brand={editingBrand}
                    isLoading={updateBrand.isPending}
                />

                {/* Delete Confirmation Dialog */}
                <ConfirmationDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    onConfirm={confirmDeleteBrand}
                    title="Delete Brand"
                    description={`Are you sure you want to delete "${brandToDelete?.name}"? This action cannot be undone.`}
                    confirmText="Delete"
                    variant="destructive"
                    isLoading={deleteBrand.isPending}
                />
            </div>
        </MainLayout>
    );
};
