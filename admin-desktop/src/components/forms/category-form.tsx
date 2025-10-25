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

export const categoryFormSchema = z.object({
    name: z.string().min(1, 'Category name is required'),
});

interface Category {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

interface CategoryFormProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: z.infer<typeof categoryFormSchema>) => void;
    isEdit?: boolean;
    category?: Category | null;
    isLoading: boolean;
}

export const CategoryForm = ({
    isOpen,
    onOpenChange,
    onSubmit,
    isEdit = false,
    category,
    isLoading,
}: CategoryFormProps) => {
    const form = useForm<z.infer<typeof categoryFormSchema>>({
        resolver: zodResolver(categoryFormSchema),
        defaultValues: {
            name: '',
        },
    });

    // Reset form when category changes (for edit mode)
    useEffect(() => {
        if (category && isEdit) {
            form.reset({
                name: category.name,
            });
        } else if (!isEdit) {
            form.reset({
                name: '',
            });
        }
    }, [ category, isEdit, form ]);

    const handleSubmit = (data: z.infer<typeof categoryFormSchema>) => {
        onSubmit(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Category' : 'Create New Category'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update category information' : 'Add a new category to your catalog'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter category name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Category' : 'Create Category')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
