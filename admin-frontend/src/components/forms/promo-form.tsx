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
import { useEffect } from 'react';

export const promoFormSchema = z.object({
    code: z.string().min(2, 'Promo code must be at least 2 characters'),
    discountType: z.enum([ 'percentage', 'fixed' ], {
        required_error: 'Discount type is required',
    }),
    discountValue: z.number().min(0, 'Discount value must be non-negative'),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    usageLimit: z.number().min(0).optional(),
    isActive: z.boolean().optional(),
});

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

interface PromoFormProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: z.infer<typeof promoFormSchema>) => void;
    isEdit?: boolean;
    promo?: PromoCode | null;
    isLoading: boolean;
}

export const PromoForm = ({
    isOpen,
    onOpenChange,
    onSubmit,
    isEdit = false,
    promo,
    isLoading,
}: PromoFormProps) => {
    const form = useForm<z.infer<typeof promoFormSchema>>({
        resolver: zodResolver(promoFormSchema),
        defaultValues: {
            code: '',
            discountType: 'percentage',
            discountValue: 0,
            startDate: '',
            endDate: '',
            usageLimit: undefined,
            isActive: true,
        },
    });

    // Reset form when promo changes (for edit mode)
    useEffect(() => {
        if (promo && isEdit) {
            form.reset({
                code: promo.code,
                discountType: promo.discountType,
                discountValue: promo.discountValue,
                startDate: promo.startDate ? promo.startDate.split('T')[ 0 ] : '',
                endDate: promo.endDate ? promo.endDate.split('T')[ 0 ] : '',
                usageLimit: promo.usageLimit,
                isActive: promo.isActive,
            });
        } else if (!isEdit) {
            form.reset({
                code: '',
                discountType: 'percentage',
                discountValue: 0,
                startDate: '',
                endDate: '',
                usageLimit: undefined,
                isActive: true,
            });
        }
    }, [ promo, isEdit, form ]);

    const handleSubmit = (data: z.infer<typeof promoFormSchema>) => {
        onSubmit(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Promo Code' : 'Create Promo Code'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update promo code settings' : 'Add a new promotional code'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Promo Code</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter promo code (e.g., SAVE20)"
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="discountType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Discount Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="percentage">Percentage</SelectItem>
                                                <SelectItem value="fixed">Fixed Amount</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="discountValue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Discount Value</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Enter value"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Date</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Date</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="usageLimit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Usage Limit (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Leave empty for unlimited"
                                            {...field}
                                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Promo Code' : 'Create Promo Code')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
