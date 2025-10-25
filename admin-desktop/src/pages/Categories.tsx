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
    Folder
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
import { useCategories, useCategoryMutations } from '@/hooks/use-products';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { CategoryForm } from '@/components/forms/category-form';

interface Category {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export const Categories = () => {
    const [ searchTerm, setSearchTerm ] = useState('');
    const [ isCreateDialogOpen, setIsCreateDialogOpen ] = useState(false);
    const [ isEditDialogOpen, setIsEditDialogOpen ] = useState(false);
    const [ editingCategory, setEditingCategory ] = useState<Category | null>(null);
    const [ deleteDialogOpen, setDeleteDialogOpen ] = useState(false);
    const [ categoryToDelete, setCategoryToDelete ] = useState<Category | null>(null);
    const [ page, setPage ] = useState(1);
    const [ totalPages, setTotalPages ] = useState(1);

    // Fetch categories with optimized caching
    const { data: categoriesData, isLoading } = useCategories(page, 10);

    // Use optimized category mutations
    const { createCategory, updateCategory, deleteCategory } = useCategoryMutations();

    // Update total pages when data changes
    useEffect(() => {
        if (categoriesData) {
            setTotalPages(categoriesData.totalPages || 1);
        }
    }, [ categoriesData ]);

    const handleCreateCategory = (data: { name: string }) => {
        createCategory.mutate(data, {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
            }
        });
    };

    const handleUpdateCategory = (data: { name: string }) => {
        if (!editingCategory) return;
        updateCategory.mutate({ id: editingCategory.id, data }, {
            onSuccess: () => {
                setIsEditDialogOpen(false);
                setEditingCategory(null);
            }
        });
    };

    const handleDeleteCategory = (category: Category) => {
        setCategoryToDelete(category);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteCategory = () => {
        if (categoryToDelete) {
            deleteCategory.mutate(categoryToDelete.id);
        }
    };

    const openEditDialog = (category: Category) => {
        setEditingCategory(category);
        setIsEditDialogOpen(true);
    };

    const filteredCategories = (categoriesData?.categories || []).filter((category: Category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-64">
                    <Loading text="Loading categories..." />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                        <p className="text-muted-foreground">
                            Manage your product categories
                        </p>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Category
                            </Button>
                        </DialogTrigger>
                    </Dialog>

                    <CategoryForm
                        isOpen={isCreateDialogOpen}
                        onOpenChange={setIsCreateDialogOpen}
                        onSubmit={handleCreateCategory}
                        isEdit={false}
                        category={null}
                        isLoading={createCategory.isPending}
                    />
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>All Categories</CardTitle>
                                <CardDescription>
                                    A list of all categories in your catalog
                                </CardDescription>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search categories..."
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
                                    <TableHead>Category</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Updated</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCategories.map((category: Category) => (
                                    <TableRow key={category.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                                                    <Folder className="h-4 w-4" />
                                                </div>
                                                <div className="font-medium">{category.name}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(category.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(category.updatedAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openEditDialog(category as Category)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteCategory(category as Category)}
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

                <CategoryForm
                    isOpen={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    onSubmit={handleUpdateCategory}
                    isEdit={true}
                    category={editingCategory}
                    isLoading={updateCategory.isPending}
                />

                {/* Delete Confirmation Dialog */}
                <ConfirmationDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    onConfirm={confirmDeleteCategory}
                    title="Delete Category"
                    description={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
                    confirmText="Delete"
                    variant="destructive"
                    isLoading={deleteCategory.isPending}
                />
            </div>
        </MainLayout>
    );
};
