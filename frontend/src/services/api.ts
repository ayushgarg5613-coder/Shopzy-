import { Product, Category, CartItem, Order, Address, ChatMessage, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const apiUrl = (path: string) => `${API_BASE_URL}${path}`;

let currentAuthToken = localStorage.getItem('shopsathi_token') || 'user-priya';

export const setAuthToken = (token: string) => {
  currentAuthToken = token;
  localStorage.setItem('shopsathi_token', token);
};

export const clearAuthToken = () => {
  currentAuthToken = '';
  localStorage.removeItem('shopsathi_token');
};

export const getAuthToken = () => currentAuthToken;

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${currentAuthToken}`,
});

export const api = {
  // Auth
  async login(identifier: string, role?: string) {
    const res = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, role }),
    });
    return res.json();
  },

  async switchDemoUser(role: 'customer' | 'seller' | 'admin') {
    const res = await fetch(apiUrl('/api/auth/switch-demo-user'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    return res.json();
  },

  async getProfile() {
    const res = await fetch(apiUrl('/api/auth/profile'), {
      headers: getHeaders(),
    });
    return res.json();
  },

  // Products
  async getProducts(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const res = await fetch(apiUrl(`/api/products?${query.toString()}`));
    return res.json();
  },

  async getProductById(id: string) {
    const res = await fetch(apiUrl(`/api/products/${id}`));
    return res.json();
  },

  async getCategories() {
    const res = await fetch(apiUrl('/api/products/categories'));
    return res.json();
  },

  async createProduct(productData: Partial<Product>) {
    const res = await fetch(apiUrl('/api/products'), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
    return res.json();
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    const res = await fetch(apiUrl(`/api/products/${id}`), {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async deleteProduct(id: string) {
    const res = await fetch(apiUrl(`/api/products/${id}`), {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  async addReview(productId: string, rating: number, comment: string) {
    const res = await fetch(apiUrl(`/api/products/${productId}/reviews`), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ rating, comment }),
    });
    return res.json();
  },

  // Cart
  async getCart() {
    const res = await fetch(apiUrl('/api/cart'), {
      headers: getHeaders(),
    });
    return res.json();
  },

  async addToCart(productId: string, quantity = 1, selectedColor?: string, selectedSize?: string, resellMargin = 0) {
    const res = await fetch(apiUrl('/api/cart/add'), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ productId, quantity, selectedColor, selectedSize, resellMargin }),
    });
    return res.json();
  },

  async updateCartItem(itemId: string, updates: { quantity?: number; resellMargin?: number; selectedColor?: string; selectedSize?: string }) {
    const res = await fetch(apiUrl(`/api/cart/items/${itemId}`), {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async removeCartItem(itemId: string) {
    const res = await fetch(apiUrl(`/api/cart/items/${itemId}`), {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  async clearCart() {
    const res = await fetch(apiUrl('/api/cart/clear'), {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Orders & Addresses
  async getOrders() {
    const res = await fetch(apiUrl('/api/orders'), {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getOrderById(id: string) {
    const res = await fetch(apiUrl(`/api/orders/${id}`), {
      headers: getHeaders(),
    });
    return res.json();
  },

  async createOrder(orderData: {
    shippingAddress: Address;
    paymentMethod: 'COD' | 'UPI' | 'NET_BANKING' | 'CARD';
    couponCode?: string;
  }) {
    const res = await fetch(apiUrl('/api/orders'), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData),
    });
    return res.json();
  },

  async updateOrderStatus(orderId: string, status: Order['status'], note?: string, location?: string) {
    const res = await fetch(apiUrl(`/api/orders/${orderId}/status`), {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, note, location }),
    });
    return res.json();
  },

  async getAddresses() {
    const res = await fetch(apiUrl('/api/orders/addresses'), {
      headers: getHeaders(),
    });
    return res.json();
  },

  async addAddress(address: Partial<Address>) {
    const res = await fetch(apiUrl('/api/orders/addresses'), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(address),
    });
    return res.json();
  },

  // Chat
  async getChatHistory(sessionId?: string) {
    const res = await fetch(apiUrl(`/api/chat/history?sessionId=${sessionId || ''}`), {
      headers: getHeaders(),
    });
    return res.json();
  },

  async sendChatMessage(query: string, currentProductId?: string, sessionId?: string) {
    const res = await fetch(apiUrl('/api/chat/send'), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ query, currentProductId, sessionId }),
    });
    return res.json();
  },

  async clearChatHistory(sessionId?: string) {
    const res = await fetch(apiUrl('/api/chat/clear'), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ sessionId }),
    });
    return res.json();
  },
};
