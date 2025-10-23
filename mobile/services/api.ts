import { GLOBAL_API_BASE_URL } from '@/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use the global API base URL
const BASE_URL = GLOBAL_API_BASE_URL;

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  accessToken?: string;
  refreshToken?: string;
  user?: any;
}

interface LoginResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    isVerified: boolean;
    createdAt: string;
  };
}

interface OTPResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    isVerified: boolean;
    createdAt: string;
  };
  otp: string;
  expiresAt: string;
}

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  userGrowth: number;
  revenueGrowth: number;
}

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

interface ProductsResponse {
  products: Product[];
  totalPages: number;
  currentPage: number;
  totalProducts: number;
}

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
}

interface CategoryDistribution {
  name: string;
  value: number;
}

interface RecentActivity {
  type: string;
  title: string;
  description: string;
  timestamp: string;
  status: string;
}

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  usersGrowth: number;
  salesData: SalesData[];
  topProducts: TopProduct[];
  categoryDistribution: CategoryDistribution[];
  recentActivity: RecentActivity[];
}

class ApiService {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  // Getter for accessToken to check if user is authenticated
  get isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Method to check if tokens are loaded and valid
  async checkAuthStatus(): Promise<boolean> {
    if (!this.accessToken) {
      await this.loadTokens();
    }
    return !!this.accessToken;
  }

  constructor() {
    this.baseURL = BASE_URL;
    // Load tokens asynchronously
    this.initializeTokens();
  }

  private async initializeTokens() {
    await this.loadTokens();
  }

  private async loadTokens() {
    try {
      const tokens = await AsyncStorage.getItem('mobile_tokens');
      if (tokens) {
        const parsed = JSON.parse(tokens);
        this.accessToken = parsed.accessToken;
        this.refreshToken = parsed.refreshToken;
        console.log('🔐 Tokens loaded from storage');
      }
    } catch (error) {
      console.error('Error loading tokens:', error);
    }
  }

  async saveTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    try {
      await AsyncStorage.setItem('mobile_tokens', JSON.stringify({ accessToken, refreshToken }));
      console.log('🔐 Tokens saved successfully');
    } catch (error) {
      console.error('Error saving tokens:', error);
    }
  }

  async clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    try {
      await AsyncStorage.removeItem('mobile_tokens');
      console.log('🔐 Tokens cleared successfully');
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    try {
      console.log('🌐 Making request to:', url);
      console.log('🌐 Headers:', headers);

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('🌐 Response status:', response.status);
      console.log('🌐 Response ok:', response.ok);

      const data = await response.json();

      if (!response.ok) {
        console.error('🌐 API Error:', data);
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('🌐 API request failed:', error);
      console.error('🌐 Error type:', (error as any).constructor.name);
      console.error('🌐 Error message:', (error as any).message);

      // Handle timeout errors
      if ((error as any).name === 'AbortError') {
        throw new Error('Request timeout: The server took too long to respond. Please check your connection.');
      }

      // Handle network errors
      if (error instanceof TypeError && (error as any).message.includes('Network request failed')) {
        throw new Error('Network error: Unable to connect to server. Please check your internet connection and ensure the backend server is running.');
      }

      throw error;
    }
  }

  // Auth methods
  async generateOTP(email: string): Promise<OTPResponse> {
    const response = await this.makeRequest<OTPResponse>('/auth/generate-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return response as OTPResponse;
  }

  async resendOTP(email: string): Promise<OTPResponse> {
    const response = await this.makeRequest<OTPResponse>('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return response as OTPResponse;
  }

  async verifyOTP(email: string, otp: string): Promise<LoginResponse> {
    const response = await this.makeRequest<LoginResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });

    const loginResponse = response as LoginResponse;
    if (loginResponse.success && loginResponse.accessToken && loginResponse.refreshToken) {
      this.saveTokens(loginResponse.accessToken, loginResponse.refreshToken);
    }

    return loginResponse;
  }

  async refreshAccessToken(): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await this.makeRequest<{ accessToken: string; refreshToken: string }>('/auth/refresh-token', {
      method: 'POST',
    });

    const tokenResponse = response as { accessToken: string; refreshToken: string };
    if (tokenResponse.accessToken && tokenResponse.refreshToken) {
      this.saveTokens(tokenResponse.accessToken, tokenResponse.refreshToken);
    }

    return tokenResponse;
  }

  async getProfile(): Promise<any> {
    const response = await this.makeRequest<any>('/auth/me');
    return response.user;
  }

  logout() {
    this.clearTokens();
  }

  // Health check method (public endpoint)
  async healthCheck(): Promise<{ message: string; status: string; timestamp: string }> {
    const response = await fetch(`${this.baseURL.replace('/api/v1', '')}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Health check failed with status ${response.status}`);
    }

    return await response.json();
  }

  // Connection test method
  async testConnection(): Promise<{ success: boolean; message: string; url: string }> {
    try {
      console.log('🔍 Testing connection to:', this.baseURL);

      // Test basic health check
      const healthResponse = await fetch(`${this.baseURL.replace('/api/v1', '')}/`);
      const healthData = await healthResponse.json();
      console.log('✅ Health check successful:', healthData);

      return {
        success: true,
        message: 'Connection successful',
        url: this.baseURL
      };
    } catch (error) {
      console.log('❌ Connection failed:', error);
      return {
        success: false,
        message: `Connection failed: ${(error as any).message}`,
        url: this.baseURL
      };
    }
  }

  // Dashboard methods
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.makeRequest<DashboardStats>('/admin/analytics/dashboard/stats');
    return (response.data || response) as DashboardStats;
  }


  // Analytics methods
  async getSalesAnalytics(period: string = '30d'): Promise<SalesData[]> {
    const response = await this.makeRequest<SalesData[]>(`/admin/analytics/sales?period=${period}`);
    return (response.data || response) as SalesData[];
  }

  async getProductAnalytics(): Promise<TopProduct[]> {
    const response = await this.makeRequest<TopProduct[]>('/admin/analytics/products');
    return (response.data || response) as TopProduct[];
  }

  async getCategoryDistribution(period: string = '30d'): Promise<CategoryDistribution[]> {
    const response = await this.makeRequest<CategoryDistribution[]>(`/admin/analytics/category-distribution?period=${period}`);
    return (response.data || response) as CategoryDistribution[];
  }

  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    const response = await this.makeRequest<RecentActivity[]>(`/admin/analytics/recent-activity?limit=${limit}`);
    return (response.data || response) as RecentActivity[];
  }

  // Product methods
  async getProducts(page: number = 1, limit: number = 10, search?: string): Promise<ProductsResponse> {
    let url = `/products?page=${page}&limit=${limit}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const response = await this.makeRequest<ProductsResponse>(url);
    return (response.data || response) as ProductsResponse;
  }

  async getProductById(id: string): Promise<Product> {
    const response = await this.makeRequest<Product>(`/products/${id}`);
    return (response.data || response) as Product;
  }

  async createProduct(formData: FormData): Promise<Product> {
    const url = `${this.baseURL}/products`;

    const headers: Record<string, string> = {};
    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }
    // Don't set Content-Type for FormData, let the browser set it

    try {
      console.log('🌐 Creating product with FormData');
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      return (data.data || data) as Product;
    } catch (error) {
      console.error('🌐 Create product failed:', error);
      throw error;
    }
  }

  async updateProduct(id: string, formData: FormData): Promise<Product> {
    const url = `${this.baseURL}/products/${id}`;

    const headers: Record<string, string> = {};
    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }
    // Don't set Content-Type for FormData, let the browser set it

    try {
      console.log('🌐 Updating product with FormData');
      console.log('🌐 URL:', url);
      console.log('🌐 Headers:', headers);

      // Log FormData contents for debugging
      console.log('🌐 FormData contents:');
      for (let pair of (formData as any).entries()) {
        console.log('🌐 FormData:', pair[ 0 ], '=', pair[ 1 ]);
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      return (data.data || data) as Product;
    } catch (error) {
      console.error('🌐 Update product failed:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    await this.makeRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories methods
  async getCategories(): Promise<Array<{ id: string, name: string }>> {
    const response = await this.makeRequest<any>('/categories');
    // Handle the nested data structure from the backend
    if (response.data && response.data.categories) {
      return response.data.categories;
    }
    return response.data || response;
  }

  // Brands methods
  async getBrands(): Promise<Array<{ id: string, name: string }>> {
    const response = await this.makeRequest<any>('/brands');
    // Handle the nested data structure from the backend
    if (response.data && response.data.brands) {
      return response.data.brands;
    }
    return response.data || response;
  }

  // Sales methods
  async getTodaySales(): Promise<any> {
    const response = await this.makeRequest<any>('/sales/today/summary');
    return response.data || response;
  }

  async getUserSales(page: number = 1, limit: number = 10, status?: string): Promise<any> {
    let url = `/sales?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    const response = await this.makeRequest<any>(url);
    return response.data || response;
  }

  async getSaleById(id: string): Promise<any> {
    const response = await this.makeRequest<any>(`/sales/${id}`);
    return response.data || response;
  }

  async updateSaleStatus(id: string, status: string): Promise<any> {
    const response = await this.makeRequest<any>(`/sales/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return response.data || response;
  }

  async cancelSale(id: string): Promise<any> {
    const response = await this.makeRequest<any>(`/sales/${id}/cancel`, {
      method: 'PATCH',
    });
    return response.data || response;
  }

  // Users methods
  async getUsers(page: number = 1, limit: number = 10): Promise<any> {
    const response = await this.makeRequest<any>(`/admin/users?page=${page}&limit=${limit}`);
    return response.data || response;
  }

  async getUserById(id: string): Promise<any> {
    const response = await this.makeRequest<any>(`/admin/users/${id}`);
    return response.data || response;
  }

  async updateUser(id: string, userData: any): Promise<any> {
    const response = await this.makeRequest<any>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return response.data || response;
  }

  async deleteUser(id: string): Promise<void> {
    await this.makeRequest(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async createUser(userData: { name: string; email: string }): Promise<any> {
    console.log('Creating user with data:', userData);
    try {
      const response = await this.makeRequest<any>('/admin/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      console.log('Create user response:', response);
      return response.data || response;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  // Utility method to get image URL
  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;

    // Normalize path separators
    const normalizedPath = imagePath.replace(/\\/g, '/');

    // Remove uploads/ prefix if it exists
    let cleanPath = normalizedPath;
    if (normalizedPath.startsWith('/uploads/')) {
      cleanPath = normalizedPath.substring(9);
    } else if (normalizedPath.startsWith('uploads/')) {
      cleanPath = normalizedPath.substring(8);
    }

    // Use the global base URL for image serving
    const baseUrl = GLOBAL_API_BASE_URL.replace('/api/v1', '');
    return `${baseUrl}/uploads/${cleanPath}`.replace(/\/+/g, '/').replace('http:/', 'http://');
  }
}

export const apiService = new ApiService();
export type { Product, ProductsResponse, DashboardStats, AnalyticsData, SalesData, TopProduct, CategoryDistribution, RecentActivity };
