const API_BASE_URL = 'http://localhost:5000/api/v1';

export interface Product {
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
    createdAt: string;
    updatedAt: string;
}

export interface ProductsResponse {
    success: boolean;
    message: string;
    data: {
        products: Product[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalProducts: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
            limit: number;
            offset: number;
        };
        filters: {
            availableCategories: string[];
            availableBrands: string[];
        };
        appliedFilters: {
            search: string | null;
            category: string | null;
            brand: string | null;
            minPrice: string | null;
            maxPrice: string | null;
            isNew: string | null;
            isBestSeller: string | null;
            isTopRated: string | null;
            isOnSale: string | null;
            isTrending: string | null;
            isHot: string | null;
            isFeatured: string | null;
            inStock: string | null;
            sortBy: string;
            sortOrder: string;
        };
    };
}

export interface ProductResponse {
    success: boolean;
    message: string;
    product: Product;
}

class ApiService {
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;

        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                // Try to parse error response
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (parseError) {
                    // If we can't parse the error response, use the default message
                }
                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    private async refreshToken(): Promise<{ accessToken: string; refreshToken: string } | null> {
        try {
            const token = localStorage.getItem('tokens');
            const tokens = token ? JSON.parse(token) : null;

            if (!tokens?.refreshToken) {
                return null;
            }

            const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${tokens.refreshToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Update tokens in localStorage
                    const newTokens = {
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                    };
                    localStorage.setItem('tokens', JSON.stringify(newTokens));
                    return newTokens;
                }
            }
            return null;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return null;
        }
    }

    private async requestWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const token = localStorage.getItem('tokens');
        const tokens = token ? JSON.parse(token) : null;

        if (!tokens?.accessToken) {
            throw new Error('No access token found. Please login again.');
        }

        // Add authorization header
        const config: RequestInit = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokens.accessToken}`,
                ...options.headers,
            },
        };

        try {
            return await this.request<T>(endpoint, config);
        } catch (error) {
            // If it's an auth error, try to refresh the token
            if (error instanceof Error && error.message.includes('Unauthorized')) {
                console.log('Access token expired, attempting to refresh...');
                const newTokens = await this.refreshToken();

                if (newTokens) {
                    // Retry the request with the new token
                    const retryConfig: RequestInit = {
                        ...options,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${newTokens.accessToken}`,
                            ...options.headers,
                        },
                    };
                    return await this.request<T>(endpoint, retryConfig);
                } else {
                    // Refresh failed, redirect to login
                    localStorage.removeItem('tokens');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    throw new Error('Session expired. Please login again.');
                }
            }
            throw error;
        }
    }

    // Product endpoints
    async getProducts(params?: {
        page?: number;
        limit?: number;
        search?: string;
        category?: string;
        brand?: string;
        minPrice?: number;
        maxPrice?: number;
        sortBy?: string;
        sortOrder?: string;
        isNew?: boolean;
        isBestSeller?: boolean;
        isTopRated?: boolean;
        isOnSale?: boolean;
        isTrending?: boolean;
        isHot?: boolean;
        isFeatured?: boolean;
        inStock?: boolean;
    }): Promise<ProductsResponse> {
        const searchParams = new URLSearchParams();

        if (params) {
            Object.entries(params).forEach(([ key, value ]) => {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, value.toString());
                }
            });
        }

        const queryString = searchParams.toString();
        const endpoint = queryString ? `/products?${queryString}` : '/products';

        return this.request<ProductsResponse>(endpoint);
    }

    async getProductById(id: string): Promise<ProductResponse> {
        return this.request<ProductResponse>(`/products/${id}`);
    }

    // Auth endpoints
    async login(email: string, password: string) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async register(name: string, email: string, password: string) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        });
    }

    async verifyOtp(email: string, otp: string) {
        return this.request('/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ email, otp }),
        });
    }

    async resendOtp(email: string) {
        return this.request('/auth/resend-otp', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }

    async googleAuth(code: string) {
        return this.request('/oauth/google', {
            method: 'POST',
            body: JSON.stringify({ code }),
        });
    }

    // Sales endpoints
    async createSale(orderData: any) {
        return this.requestWithAuth('/sales', {
            method: 'POST',
            body: JSON.stringify(orderData),
        });
    }

    async getUserSales(params?: {
        page?: number;
        limit?: number;
        status?: string;
    }) {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([ key, value ]) => {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, value.toString());
                }
            });
        }

        const queryString = searchParams.toString();
        const endpoint = queryString ? `/sales?${queryString}` : '/sales';

        return this.requestWithAuth(endpoint);
    }

    async getSaleById(id: string) {
        return this.requestWithAuth(`/sales/${id}`);
    }

    async cancelSale(id: string) {
        return this.requestWithAuth(`/sales/${id}/cancel`, {
            method: 'PATCH',
        });
    }

    // Notification endpoints
    async getNotifications(params?: {
        page?: number;
        limit?: number;
    }) {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([ key, value ]) => {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, value.toString());
                }
            });
        }

        const queryString = searchParams.toString();
        const endpoint = queryString ? `/notifications?${queryString}` : '/notifications';

        return this.requestWithAuth(endpoint);
    }

    async getUnreadCount() {
        return this.requestWithAuth('/notifications/unread-count');
    }

    async markNotificationAsRead(id: string) {
        return this.requestWithAuth(`/notifications/${id}/read`, {
            method: 'PATCH',
        });
    }

    async markAllNotificationsAsRead() {
        return this.requestWithAuth('/notifications/mark-all-read', {
            method: 'PATCH',
        });
    }

    async deleteNotification(id: string) {
        return this.requestWithAuth(`/notifications/${id}`, {
            method: 'DELETE',
        });
    }

    // User endpoints
    async getUserProfile() {
        return this.requestWithAuth('/auth/profile');
    }

    // Review endpoints
    async getProductReviews(productId: string, params?: {
        page?: number;
        limit?: number;
    }) {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([ key, value ]) => {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, value.toString());
                }
            });
        }

        const queryString = searchParams.toString();
        const endpoint = queryString ? `/reviews/product/${productId}?${queryString}` : `/reviews/product/${productId}`;

        return this.request(endpoint);
    }

    async getUserReviews(params?: {
        page?: number;
        limit?: number;
    }) {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([ key, value ]) => {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, value.toString());
                }
            });
        }

        const queryString = searchParams.toString();
        const endpoint = queryString ? `/reviews/user?${queryString}` : '/reviews/user';

        return this.requestWithAuth(endpoint);
    }

    async getReviewableOrders() {
        return this.requestWithAuth('/reviews/reviewable');
    }

    async createReview(reviewData: {
        productId: string;
        saleId: string;
        rating: number;
        title?: string;
        comment?: string;
    }) {
        return this.requestWithAuth('/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData),
        });
    }

    async updateReview(reviewId: string, reviewData: {
        rating?: number;
        title?: string;
        comment?: string;
    }) {
        return this.requestWithAuth(`/reviews/${reviewId}`, {
            method: 'PATCH',
            body: JSON.stringify(reviewData),
        });
    }

    async deleteReview(reviewId: string) {
        return this.requestWithAuth(`/reviews/${reviewId}`, {
            method: 'DELETE',
        });
    }

    // PayMongo payment endpoints
    async createPaymentSource(amount: number, type: 'gcash' | 'paymaya') {
        return this.requestWithAuth('/payments/source', {
            method: 'POST',
            body: JSON.stringify({ amount, type }),
        });
    }

    async getPaymentSourceStatus(id: string) {
        return this.requestWithAuth(`/payments/source/${id}`);
    }

    async createPaymentIntent(amount: number, paymentMethod: string, description?: string) {
        return this.requestWithAuth('/payments/intent', {
            method: 'POST',
            body: JSON.stringify({ amount, paymentMethod, description }),
        });
    }

    async getPaymentIntentStatus(id: string) {
        return this.requestWithAuth(`/payments/intent/${id}`);
    }

    async createCheckoutSession(lineItems: Array<{
        name: string;
        quantity: number;
        amount: number;
        description?: string;
        images?: string[];
    }>, paymentMethodTypes: string[], description?: string, customerInfo?: {
        name: string;
        email: string;
        phone?: string;
    }, orderId?: string) {
        return this.requestWithAuth('/payments/checkout', {
            method: 'POST',
            body: JSON.stringify({
                lineItems,
                paymentMethodTypes,
                description,
                customerInfo,
                orderId,
                amount: lineItems.reduce((sum, item) => sum + (item.amount * item.quantity), 0)
            }),
        });
    }

    async getCheckoutSessionStatus(id: string) {
        return this.requestWithAuth(`/payments/checkout/${id}`);
    }

    // Contact endpoints
    async submitContactForm(data: {
        firstName: string;
        lastName: string;
        email: string;
        subject: string;
        message: string;
    }) {
        return this.request('/contact', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
}

export const apiService = new ApiService();
