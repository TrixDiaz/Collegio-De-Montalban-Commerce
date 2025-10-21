import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiService } from '@/services/api';
import { Loading } from '@/components/ui/loading';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  userGrowth: number;
  revenueGrowth: number;
}

interface CashierSales {
  userId: string;
  userName: string;
  userEmail: string;
  totalSales: number;
  totalTransactions: number;
  totalCash: number;
  totalGCash: number;
  totalMaya: number;
  totalCOD: number;
}

interface TodaySalesData {
  sales: any[];
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

export const Dashboard = () => {
  const navigate = useNavigate();
  const [ stats, setStats ] = useState<DashboardStats | null>(null);
  const [ loading, setLoading ] = useState(true);
  const [ cashierSales, setCashierSales ] = useState<CashierSales[]>([]);
  const [ salesLoading, setSalesLoading ] = useState(true);
  const [ todaySales, setTodaySales ] = useState<TodaySalesData | null>(null);
  const [ todayLoading, setTodayLoading ] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setSalesLoading(true);
        setTodayLoading(true);

        const [ statsResponse, cashierSalesResponse, todaySalesResponse ] = await Promise.all([
          apiService.getDashboardStats(),
          apiService.getSalesByCashier(),
          apiService.getTodayTotalSales()
        ]);

        console.log('Stats Response:', statsResponse);
        console.log('Cashier Sales Response:', cashierSalesResponse);
        console.log('Today Sales Response:', todaySalesResponse);

        // Handle stats response - backend returns { success, data: {...} }
        const statsData = statsResponse.data.data || statsResponse.data;
        console.log('Parsed Stats Data:', statsData);
        setStats(statsData);

        // Handle cashier sales response - backend returns { success, data: [...] }
        const cashierData = cashierSalesResponse.data.data || cashierSalesResponse.data;
        console.log('Parsed Cashier Data:', cashierData);
        setCashierSales(Array.isArray(cashierData) ? cashierData : []);

        // Handle today's sales response
        const todayData = todaySalesResponse.data.data || todaySalesResponse.data;
        console.log('Parsed Today Data:', todayData);
        setTodaySales(todayData);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setStats(null);
        setCashierSales([]);
        setTodaySales(null);
      } finally {
        setLoading(false);
        setSalesLoading(false);
        setTodayLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loading text="Loading dashboard..." />
        </div>
      </MainLayout>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      description: 'Registered users',
      trend: stats?.userGrowth || 0,
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      description: 'Active products',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      description: 'All orders',
    },
    {
      title: 'Total Revenue',
      value: `₱${(stats?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: 'Completed sales earnings',
      trend: stats?.revenueGrowth || 0,
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your business performance
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
                {card.trend !== undefined && (
                  <div className="flex items-center pt-1">
                    {card.trend > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={`text-xs ${card.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {Math.abs(card.trend)}%
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Today's Sales Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Sales Summary</CardTitle>
            <CardDescription>
              Real-time sales data for {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loading text="Loading today's sales..." />
              </div>
            ) : todaySales ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold">{todaySales.summary.totalTransactions}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₱{todaySales.summary.totalSales.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Cash</p>
                  <p className="text-xl font-bold">₱{todaySales.summary.totalCash.toFixed(2)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">GCash</p>
                  <p className="text-xl font-bold">₱{todaySales.summary.totalGCash.toFixed(2)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Maya</p>
                  <p className="text-xl font-bold">₱{todaySales.summary.totalMaya.toFixed(2)}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No sales data available for today
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates from your system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New user registered</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New order received</p>
                    <p className="text-xs text-muted-foreground">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Product updated</p>
                    <p className="text-xs text-muted-foreground">10 minutes ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/products')}
                  className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors cursor-pointer"
                >
                  <Package className="inline-block h-4 w-4 mr-2" />
                  Add new product
                </button>
                <button
                  onClick={() => navigate('/orders')}
                  className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors cursor-pointer"
                >
                  <ShoppingCart className="inline-block h-4 w-4 mr-2" />
                  View pending orders
                </button>
                <button
                  onClick={() => navigate('/users')}
                  className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors cursor-pointer"
                >
                  <Users className="inline-block h-4 w-4 mr-2" />
                  Manage users
                </button>
                <button
                  onClick={() => navigate('/analytics')}
                  className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors cursor-pointer"
                >
                  <DollarSign className="inline-block h-4 w-4 mr-2" />
                  View analytics
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales by Cashier Section */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Cashier</CardTitle>
            <CardDescription>
              Total sales performance per cashier/user
            </CardDescription>
          </CardHeader>
          <CardContent>
            {salesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loading text="Loading sales data..." />
              </div>
            ) : cashierSales.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No sales data available
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cashier</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Transactions</TableHead>
                    <TableHead className="text-right">Cash</TableHead>
                    <TableHead className="text-right">GCash</TableHead>
                    <TableHead className="text-right">Maya</TableHead>
                    <TableHead className="text-right">COD</TableHead>
                    <TableHead className="text-right">Total Sales</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashierSales.map((cashier) => (
                    <TableRow key={cashier.userId}>
                      <TableCell className="font-medium">{cashier.userName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {cashier.userEmail}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{cashier.totalTransactions}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        ₱{cashier.totalCash.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        ₱{cashier.totalGCash.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        ₱{(cashier.totalMaya || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        ₱{cashier.totalCOD.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        ₱{cashier.totalSales.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};
