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
  Copy,
  Calendar
} from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useEffect, useState } from 'react';
import { apiService } from '@/services/api';
import { toast } from 'sonner';
import { Loading } from '@/components/ui/loading';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { PromoForm } from '@/components/forms/promo-form';

interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
  createdAt: string;
  updatedAt: string;
}

export const PromoCodes = () => {
  const [ promoCodes, setPromoCodes ] = useState<PromoCode[]>([]);
  const [ loading, setLoading ] = useState(true);
  const [ searchTerm, setSearchTerm ] = useState('');
  const [ isCreateDialogOpen, setIsCreateDialogOpen ] = useState(false);
  const [ isEditDialogOpen, setIsEditDialogOpen ] = useState(false);
  const [ selectedPromo, setSelectedPromo ] = useState<PromoCode | null>(null);
  const [ page, setPage ] = useState(1);
  const [ totalPages, setTotalPages ] = useState(1);
  const [ deleteDialogOpen, setDeleteDialogOpen ] = useState(false);
  const [ promoToDelete, setPromoToDelete ] = useState<PromoCode | null>(null);

  useEffect(() => {
    fetchPromoCodes();
  }, [ page ]);

  const fetchPromoCodes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPromoCodes(page, 10, searchTerm);
      setPromoCodes(response.data.data.promoCodes || []);
      setTotalPages(response.data.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      toast.error('Failed to fetch promo codes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromo = async (data: any) => {
    try {
      await apiService.createPromoCode(data);
      toast.success('Promo code created successfully');
      setIsCreateDialogOpen(false);
      await fetchPromoCodes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create promo code');
    }
  };

  const handleUpdatePromo = async (data: any) => {
    if (!selectedPromo) return;

    try {
      await apiService.updatePromoCode(selectedPromo.id, data);
      toast.success('Promo code updated successfully');
      setIsEditDialogOpen(false);
      setSelectedPromo(null);
      await fetchPromoCodes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update promo code');
    }
  };

  const handleDeletePromo = (promo: PromoCode) => {
    setPromoToDelete(promo);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePromo = async () => {
    if (!promoToDelete) return;

    try {
      await apiService.deletePromoCode(promoToDelete.id);
      toast.success('Promo code deleted successfully');
      await fetchPromoCodes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete promo code');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Promo code copied to clipboard');
  };

  const openEditDialog = (promo: PromoCode) => {
    setSelectedPromo(promo);
    setIsEditDialogOpen(true);
  };

  const filteredPromoCodes = (promoCodes || []).filter(promo =>
    promo.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (promo: PromoCode) => {
    const now = new Date();
    const startDate = new Date(promo.startDate);
    const endDate = new Date(promo.endDate);

    if (!promo.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }

    if (now < startDate) {
      return <Badge variant="outline">Scheduled</Badge>;
    }

    if (now > endDate) {
      return <Badge variant="destructive">Expired</Badge>;
    }

    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return <Badge variant="destructive">Used Up</Badge>;
    }

    return <Badge variant="default">Active</Badge>;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loading text="Loading promo codes..." />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Promo Codes</h1>
            <p className="text-muted-foreground">
              Manage promotional codes and discounts
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Promo Code
              </Button>
            </DialogTrigger>
          </Dialog>

          <PromoForm
            isOpen={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            onSubmit={handleCreatePromo}
            isEdit={false}
            promo={null}
            isLoading={false}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Promo Codes</CardTitle>
            <CardDescription>
              Manage promotional codes and their usage
            </CardDescription>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search promo codes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromoCodes.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <span>{promo.code}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyCode(promo.code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {promo.discountType === 'percentage'
                        ? `${promo.discountValue}%`
                        : `₱${promo.discountValue}`
                      }
                    </TableCell>
                    <TableCell>
                      {promo.usageLimit
                        ? `${promo.usedCount}/${promo.usageLimit}`
                        : `${promo.usedCount}/∞`
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(promo)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(promo)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeletePromo(promo)}
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

        <PromoForm
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={handleUpdatePromo}
          isEdit={true}
          promo={selectedPromo}
          isLoading={false}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDeletePromo}
          title="Delete Promo Code"
          description={`Are you sure you want to delete "${promoToDelete?.code}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="destructive"
          isLoading={false}
        />
      </div>
    </MainLayout>
  );
};
