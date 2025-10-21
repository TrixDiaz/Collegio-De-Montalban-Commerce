import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { LogOut, ShoppingCart, DollarSign, Receipt, CreditCard, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SaleItem {
    id: string;
    name: string;
    price: string;
    quantity: number;
}

interface Sale {
    id: string;
    orderNumber: string;
    items: SaleItem[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    paymentMethod: 'cash' | 'cod' | 'gcash' | 'maya';
    status: string;
    createdAt: string;
}

interface TodaySalesData {
    sales: Sale[];
    summary: {
        totalTransactions: number;
        totalSales: number;
        totalCash: number;
        totalGCash: number;
        totalMaya: number;
        totalCOD: number;
    };
    date: string;
}

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [ todaySales, setTodaySales ] = useState<TodaySalesData | null>(null);
    const [ loading, setLoading ] = useState(true);

    useEffect(() => {
        fetchTodaySales();
        // Refresh every 30 seconds
        const interval = setInterval(fetchTodaySales, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchTodaySales = async () => {
        try {
            const response = await apiService.getTodaySales();
            if (response.success) {
                setTodaySales(response.data);
            }
        } catch (error) {
            console.error("Error fetching today's sales:", error);
            toast.error("Failed to load today's sales");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const formatCurrency = (amount: number) => {
        return `₱${amount.toFixed(2)}`;
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const getPaymentMethodBadge = (method: string) => {
        const variants: Record<string, "default" | "secondary" | "outline"> = {
            cash: "default",
            gcash: "secondary",
            maya: "secondary",
            cod: "outline"
        };
        return <Badge variant={variants[ method ] || "default"}>{method.toUpperCase()}</Badge>;
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="text-muted-foreground">Welcome to Tile Depot POS</p>
                    </div>
                    <Button onClick={handleLogout} variant="outline">
                        <LogOut className="size-4 mr-2" />
                        Logout
                    </Button>
                </div>

                {/* New Transaction Card - Prominent placement */}
                <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate("/transaction")}>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <ShoppingCart className="size-6 text-primary" />
                            Start New Transaction
                        </CardTitle>
                        <CardDescription>Click here to begin a new sale</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Cashier: <span className="font-semibold text-foreground">{user?.name}</span>
                        </p>
                    </CardContent>
                </Card>

                {/* Today's Sales Summary */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <DollarSign className="size-4 text-green-600" />
                                Total Sales
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-green-600">
                                {loading ? "..." : formatCurrency(todaySales?.summary.totalSales || 0)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {todaySales?.summary.totalTransactions || 0} transactions
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Wallet className="size-4 text-blue-600" />
                                Cash
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-blue-600">
                                {loading ? "..." : formatCurrency(todaySales?.summary.totalCash || 0)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Cash payments
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <CreditCard className="size-4 text-purple-600" />
                                GCash
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-purple-600">
                                {loading ? "..." : formatCurrency(todaySales?.summary.totalGCash || 0)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                GCash payments
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <CreditCard className="size-4 text-pink-600" />
                                Maya
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-pink-600">
                                {loading ? "..." : formatCurrency(todaySales?.summary.totalMaya || 0)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Maya payments
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Receipt className="size-4 text-orange-600" />
                                COD
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-orange-600">
                                {loading ? "..." : formatCurrency(todaySales?.summary.totalCOD || 0)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Cash on Delivery
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Today's Transactions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Receipt className="size-5" />
                            Today's Transactions
                        </CardTitle>
                        <CardDescription>
                            All sales made today by {user?.name}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Loading transactions...
                            </div>
                        ) : todaySales?.sales.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Receipt className="size-12 mx-auto mb-2 opacity-50" />
                                <p>No transactions yet today</p>
                            </div>
                        ) : (
                            <ScrollArea className="h-[400px]">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Time</TableHead>
                                            <TableHead>Order #</TableHead>
                                            <TableHead>Items</TableHead>
                                            <TableHead>Payment</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {todaySales?.sales.map((sale) => (
                                            <TableRow key={sale.id}>
                                                <TableCell className="font-medium">
                                                    {formatTime(sale.createdAt)}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    {sale.orderNumber}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {sale.items.length} item(s)
                                                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                            {sale.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getPaymentMethodBadge(sale.paymentMethod)}
                                                </TableCell>
                                                <TableCell className="text-right font-bold">
                                                    {formatCurrency(sale.total)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export { Dashboard };

