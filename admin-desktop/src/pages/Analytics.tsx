import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  Package,
  Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useEffect, useState, useCallback } from 'react';
import { apiService } from '@/services/api';
import { Loading } from '@/components/ui/loading';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  usersGrowth: number;
  salesData: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  categoryDistribution: Array<{
    name: string;
    value: number;
  }>;
  recentActivity: Array<{
    type: string;
    title: string;
    description: string;
    timestamp: string;
    status: string;
  }>;
}

export const Analytics = () => {
  const [ analytics, setAnalytics ] = useState<AnalyticsData | null>(null);
  const [ loading, setLoading ] = useState(true);
  const [ period, setPeriod ] = useState('30d');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Starting analytics fetch...');

      // First test the basic connection
      try {
        const testResponse = await apiService.testAnalytics();
        console.log('Analytics test response:', testResponse);
      } catch (testError) {
        console.error('Analytics test failed:', testError);
      }

      const [
        statsResponse,
        salesResponse,
        productsResponse,
        categoryResponse,
        activityResponse
      ] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getSalesAnalytics(period),
        apiService.getProductAnalytics(),
        apiService.getCategoryDistribution(period),
        apiService.getRecentActivity(10)
      ]);

      console.log('Analytics Stats Response:', statsResponse);
      console.log('Analytics Sales Response:', salesResponse);
      console.log('Analytics Products Response:', productsResponse);
      console.log('Analytics Category Response:', categoryResponse);
      console.log('Analytics Activity Response:', activityResponse);

      // Handle response structures - backend returns { success, data: {...} }
      const statsData = statsResponse.data?.data || statsResponse.data;
      const salesData = salesResponse.data?.data || salesResponse.data;
      const productsData = productsResponse.data?.data || productsResponse.data;
      const categoryData = categoryResponse.data?.data || categoryResponse.data;
      const activityData = activityResponse.data?.data || activityResponse.data;

      console.log('Processed Stats Data:', statsData);
      console.log('Processed Sales Data:', salesData);
      console.log('Processed Products Data:', productsData);
      console.log('Processed Category Data:', categoryData);
      console.log('Processed Activity Data:', activityData);

      setAnalytics({
        totalRevenue: statsData?.totalRevenue || 0,
        totalOrders: statsData?.totalOrders || 0,
        totalUsers: statsData?.totalUsers || 0,
        totalProducts: statsData?.totalProducts || 0,
        revenueGrowth: statsData?.revenueGrowth || 0,
        ordersGrowth: statsData?.ordersGrowth || 0,
        usersGrowth: statsData?.usersGrowth || 0,
        salesData: Array.isArray(salesData) ? salesData : [],
        topProducts: Array.isArray(productsData) ? productsData : [],
        categoryDistribution: Array.isArray(categoryData) ? categoryData : [],
        recentActivity: Array.isArray(activityData) ? activityData : []
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      console.error('Error details:', error);

      // Set empty analytics data instead of null to show the UI
      setAnalytics({
        totalRevenue: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalProducts: 0,
        revenueGrowth: 0,
        ordersGrowth: 0,
        usersGrowth: 0,
        salesData: [],
        topProducts: [],
        categoryDistribution: [],
        recentActivity: []
      });
    } finally {
      setLoading(false);
    }
  }, [ period ]);

  useEffect(() => {
    fetchAnalytics();
  }, [ fetchAnalytics ]);

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₱${(analytics?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      change: analytics?.revenueGrowth || 0,
      description: 'vs. previous period',
    },
    {
      title: 'Total Orders',
      value: analytics?.totalOrders || 0,
      icon: ShoppingCart,
      change: analytics?.ordersGrowth || 0,
      description: 'vs. previous period',
    },
    {
      title: 'Total Users',
      value: analytics?.totalUsers || 0,
      icon: Users,
      change: analytics?.usersGrowth || 0,
      description: 'vs. previous period',
    },
    {
      title: 'Total Products',
      value: analytics?.totalProducts || 0,
      icon: Package,
      change: 0,
      description: 'Active products',
    },
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loading text="Loading analytics..." />
        </div>
      </MainLayout>
    );
  }

  if (!analytics) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">Failed to load analytics data</p>
            <button
              onClick={fetchAnalytics}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Insights into your business performance
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
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
                {card.change !== 0 && (
                  <div className="flex items-center pt-1">
                    {card.change > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={`text-xs ${card.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {Math.abs(card.change)}%
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Sales Chart */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>
                Revenue and orders over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.salesData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8884d8"
                      strokeWidth={2}
                      name="Revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      name="Orders"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Products Chart */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>
                Revenue by product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.topProducts?.slice(0, 5) || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Top Products List */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Top Products List</CardTitle>
              <CardDescription>
                Best performing products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(analytics?.topProducts || []).slice(0, 5).map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-medium text-primary-foreground">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{product.name || 'Unknown Product'}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.sales || 0} sales
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      ₱{(product.revenue || 0).toFixed(2)}
                    </div>
                  </div>
                ))}
                {(!analytics?.topProducts || analytics.topProducts.length === 0) && (
                  <div className="text-center text-muted-foreground py-8">
                    <Package className="h-8 w-8 mx-auto mb-2" />
                    <p>No product data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sales Distribution */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Sales Distribution</CardTitle>
              <CardDescription>
                Revenue breakdown by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {(!analytics?.categoryDistribution || analytics.categoryDistribution.length === 0) ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No category data available</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.categoryDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analytics.categoryDistribution.map((entry, index) => {
                          const colors = [ '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c', '#d0ed57', '#83a6ed', '#8dd1e1' ];
                          return <Cell key={`cell-${index}`} fill={colors[ index % colors.length ]} />;
                        })}
                      </Pie>
                      <Tooltip formatter={(value: number) => `₱${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(!analytics?.recentActivity || analytics.recentActivity.length === 0) ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.recentActivity.map((activity, index) => {
                  // Helper function to format time ago
                  const getTimeAgo = (timestamp: string) => {
                    const now = new Date();
                    const then = new Date(timestamp);
                    const diffMs = now.getTime() - then.getTime();
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffHours = Math.floor(diffMins / 60);
                    const diffDays = Math.floor(diffHours / 24);

                    if (diffMins < 1) return 'Just now';
                    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
                    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                  };

                  // Determine color based on activity type
                  const getActivityColor = (type: string) => {
                    switch (type) {
                      case 'order': return 'bg-green-500';
                      case 'user': return 'bg-blue-500';
                      case 'product': return 'bg-yellow-500';
                      default: return 'bg-purple-500';
                    }
                  };

                  return (
                    <div key={index} className="flex items-center space-x-4">
                      <div className={`w-2 h-2 rounded-full ${getActivityColor(activity.type)}`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{getTimeAgo(activity.timestamp)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};
