import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';

export const brandFormSchema = z.object({
    name: z.string().min(1, 'Brand name is required'),
});

interface Brand {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

interface BrandFormProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: z.infer<typeof brandFormSchema>) => void;
    isEdit?: boolean;
    brand?: Brand | null;
    isLoading: boolean;
}

export const BrandForm = ({
    isOpen,
    onOpenChange,
    onSubmit,
    isEdit = false,
    brand,
    isLoading,
}: BrandFormProps) => {
    const form = useForm<z.infer<typeof brandFormSchema>>({
        resolver: zodResolver(brandFormSchema),
        defaultValues: {
            name: '',
        },
    });

    // Reset form when brand changes (for edit mode)
    useEffect(() => {
        if (brand && isEdit) {
            form.reset({
                name: brand.name,
            });
        } else if (!isEdit) {
            form.reset({
                name: '',
            });
        }
    }, [ brand, isEdit, form ]);

    const handleSubmit = (data: z.infer<typeof brandFormSchema>) => {
        onSubmit(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Brand' : 'Create New Brand'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update brand information' : 'Add a new brand to your catalog'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Brand Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter brand name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Brand' : 'Create Brand')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
