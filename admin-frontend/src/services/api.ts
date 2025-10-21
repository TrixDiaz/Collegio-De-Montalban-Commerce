import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const tokens = localStorage.getItem('admin_tokens');
    if (tokens) {
      const { accessToken } = JSON.parse(tokens);
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokens = localStorage.getItem('admin_tokens');
        if (tokens) {
          const { refreshToken } = JSON.parse(tokens);
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken
          });

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('admin_tokens', JSON.stringify({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
          }));

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('admin_tokens');
        localStorage.removeItem('admin_user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export const apiService = {
  // Auth endpoints - matching your existing backend
  resendOtp: (email: string) => api.post('/auth/resend-otp', { email }),
  verifyOtp: (email: string, otp: string) => api.post('/auth/verify-otp', { email, otp }),

  // Admin endpoints
  getUsers: (page = 1, limit = 10) => api.get(`/admin/users?page=${page}&limit=${limit}`),
  createUser: (userData: any) => api.post('/admin/users', userData),
  updateUser: (id: string, userData: any) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),

  // Products endpoints - using your existing product API structure
  getProducts: (page = 1, limit = 10, search?: string, category?: string, brand?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (brand) params.append('brand', brand);
    return api.get(`/products?${params.toString()}`);
  },
  getProductById: (id: string) => api.get(`/products/${id}`),
  createProduct: (formData: FormData) => {
    return api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  updateProduct: (id: string, formData: FormData) => {
    return api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteProduct: (id: string) => api.delete(`/products/${id}`),

  // Brands endpoints
  getBrands: (page = 1, limit = 100, search?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    return api.get(`/brands?${params.toString()}`);
  },
  getBrandById: (id: string) => api.get(`/brands/${id}`),
  createBrand: (brandData: any) => api.post('/brands', brandData),
  updateBrand: (id: string, brandData: any) => api.put(`/brands/${id}`, brandData),
  deleteBrand: (id: string) => api.delete(`/brands/${id}`),

  // Categories endpoints
  getCategories: (page = 1, limit = 100, search?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    return api.get(`/categories?${params.toString()}`);
  },
  getCategoryById: (id: string) => api.get(`/categories/${id}`),
  createCategory: (categoryData: any) => api.post('/categories', categoryData),
  updateCategory: (id: string, categoryData: any) => api.put(`/categories/${id}`, categoryData),
  deleteCategory: (id: string) => api.delete(`/categories/${id}`),

  // Orders endpoints (mock for now since orders table doesn't exist yet)
  getOrders: (page = 1, limit = 10) => api.get(`/admin/orders?page=${page}&limit=${limit}`),
  updateOrderStatus: (id: string, status: string) => api.put(`/admin/orders/${id}/status`, { status }),

  // Analytics endpoints
  testAnalytics: () => api.get('/admin/analytics/test'),
  getDashboardStats: () => api.get('/admin/analytics/dashboard/stats'),
  getSalesAnalytics: (period = '30d') => api.get(`/admin/analytics/sales?period=${period}`),
  getProductAnalytics: () => api.get('/admin/analytics/products'),
  getSalesByCashier: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/admin/analytics/sales-by-cashier?${params.toString()}`);
  },
  getTodayTotalSales: () => api.get('/admin/analytics/today'),
  getCategoryDistribution: (period = '30d') => api.get(`/admin/analytics/category-distribution?period=${period}`),
  getRecentActivity: (limit = 10) => api.get(`/admin/analytics/recent-activity?limit=${limit}`),

  // Discount endpoints
  getDiscounts: (page = 1, limit = 10) => api.get(`/discounts?page=${page}&limit=${limit}`),
  getDiscountById: (id: string) => api.get(`/discounts/${id}`),
  createDiscount: (discountData: any) => api.post('/discounts', discountData),
  updateDiscount: (id: string, discountData: any) => api.put(`/discounts/${id}`, discountData),
  deleteDiscount: (id: string) => api.delete(`/discounts/${id}`),
  getActiveDiscounts: () => api.get('/discounts/active'),

  // Promo code endpoints
  getPromoCodes: (page = 1, limit = 10, search?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    return api.get(`/promos?${params.toString()}`);
  },
  getPromoCodeById: (id: string) => api.get(`/promos/${id}`),
  createPromoCode: (promoData: any) => api.post('/promos', promoData),
  updatePromoCode: (id: string, promoData: any) => api.put(`/promos/${id}`, promoData),
  deletePromoCode: (id: string) => api.delete(`/promos/${id}`),
  getActivePromoCodes: () => api.get('/promos/active'),
  validatePromoCode: (code: string) => api.post('/promos/validate', { code }),
};

export default api;
