const API_BASE_URL = 'http://localhost:5000/api/v1';

export interface User {
    id: string;
    email: string;
    name: string;
    isVerified: boolean;
    createdAt?: string;
}

export interface Product {
    id: string;
    name: string;
    description?: string;
    price: string;
    discount?: boolean;
    discountPrice?: string;
    stock: number;
    sold: number;
    thumbnail?: string;
    images: string[];
    rating?: string;
    category?: string;
    brand?: string;
    categoryId?: string;
    brandId?: string;
}

export interface OrderItem {
    id: string;
    name: string;
    price: string;
    quantity: number;
    thumbnail?: string;
}

export interface Sale {
    items: OrderItem[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    paymentMethod: 'cash' | 'cod' | 'gcash' | 'maya';
    shippingAddress?: object;
    notes?: string;
    promoCode?: string;
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
            if (error instanceof Error && error.message.includes('Unauthorized')) {
                console.log('Access token expired, attempting to refresh...');
                const newTokens = await this.refreshToken();

                if (newTokens) {
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
                    localStorage.removeItem('tokens');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    throw new Error('Session expired. Please login again.');
                }
            }
            throw error;
        }
    }

    // Auth endpoints
    async generateOtp(email: string) {
        return this.request('/auth/generate-otp', {
            method: 'POST',
            body: JSON.stringify({ email }),
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

    async getUserProfile() {
        return this.requestWithAuth('/auth/me');
    }

    // Product endpoints
    async getProducts(params?: {
        page?: number;
        limit?: number;
        search?: string;
        category?: string;
        brand?: string;
        inStock?: boolean;
    }) {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([ key, value ]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value.toString());
                }
            });
        }
        const queryString = queryParams.toString();
        return this.requestWithAuth<any>(`/products${queryString ? `?${queryString}` : ''}`);
    }

    async getProductById(id: string) {
        return this.requestWithAuth<any>(`/products/${id}`);
    }

    // Sales endpoints
    async createSale(saleData: Sale) {
        return this.requestWithAuth<any>('/sales', {
            method: 'POST',
            body: JSON.stringify(saleData),
        });
    }

    async getUserSales(params?: { page?: number; limit?: number; status?: string }) {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([ key, value ]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value.toString());
                }
            });
        }
        const queryString = queryParams.toString();
        return this.requestWithAuth<any>(`/sales${queryString ? `?${queryString}` : ''}`);
    }

    async getSaleById(id: string) {
        return this.requestWithAuth<any>(`/sales/${id}`);
    }

    async getTodaySales() {
        return this.requestWithAuth<any>('/sales/today/summary');
    }

    // Promo code endpoints
    async validatePromoCode(code: string) {
        return this.request<any>('/promos/validate', {
            method: 'POST',
            body: JSON.stringify({ code }),
        });
    }

    async incrementPromoCodeUsage(code: string) {
        return this.request<any>('/promos/increment', {
            method: 'POST',
            body: JSON.stringify({ code }),
        });
    }

    // PayMongo payment endpoints
    async createPaymentSource(amount: number, type: 'gcash' | 'paymaya') {
        return this.requestWithAuth<any>('/payments/source', {
            method: 'POST',
            body: JSON.stringify({ amount, type }),
        });
    }

    async getPaymentSourceStatus(id: string) {
        return this.requestWithAuth<any>(`/payments/source/${id}`);
    }

    async createPaymentIntent(amount: number, paymentMethod: string, description?: string) {
        return this.requestWithAuth<any>('/payments/intent', {
            method: 'POST',
            body: JSON.stringify({ amount, paymentMethod, description }),
        });
    }

    async getPaymentIntentStatus(id: string) {
        return this.requestWithAuth<any>(`/payments/intent/${id}`);
    }
}

export const apiService = new ApiService();

