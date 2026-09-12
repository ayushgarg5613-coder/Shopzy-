import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  resellTotalMargin: number;
  shippingFee: number;
  totalAmount: number;
  loading: boolean;
  addToCart: (
    productId: string,
    quantity?: number,
    color?: string,
    size?: string,
    resellMargin?: number
  ) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  updateResellMargin: (itemId: string, margin: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  lastAddedItem: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<string | null>(null);

  const refreshCart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getCart();
      if (res.success && res.items) {
        setItems(res.items);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [user?.id, refreshCart]);

  const addToCart = async (
    productId: string,
    quantity = 1,
    color?: string,
    size?: string,
    resellMargin = 0
  ): Promise<boolean> => {
    try {
      const res = await api.addToCart(productId, quantity, color, size, resellMargin);
      if (res.success && res.items) {
        setItems(res.items);
        setLastAddedItem(productId);
        setTimeout(() => setLastAddedItem(null), 3000);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to add to cart:', err);
      return false;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const res = await api.updateCartItem(itemId, { quantity });
      if (res.success && res.items) {
        setItems(res.items);
      }
    } catch (err) {
      console.error('Failed to update cart quantity:', err);
    }
  };

  const updateResellMargin = async (itemId: string, margin: number) => {
    try {
      const res = await api.updateCartItem(itemId, { resellMargin: margin });
      if (res.success && res.items) {
        setItems(res.items);
      }
    } catch (err) {
      console.error('Failed to update resell margin:', err);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const res = await api.removeCartItem(itemId);
      if (res.success && res.items) {
        setItems(res.items);
      }
    } catch (err) {
      console.error('Failed to remove cart item:', err);
    }
  };

  const clearCart = async () => {
    try {
      const res = await api.clearCart();
      if (res.success) {
        setItems([]);
      }
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const resellTotalMargin = items.reduce(
    (acc, item) => acc + (item.resellMargin || 0) * item.quantity,
    0
  );
  const freeDelivery = subtotal >= 499 || items.every((i) => i.product.freeDelivery);
  const shippingFee = subtotal > 0 && !freeDelivery ? 49 : 0;
  const totalAmount = subtotal + resellTotalMargin + shippingFee;

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        resellTotalMargin,
        shippingFee,
        totalAmount,
        loading,
        addToCart,
        updateQuantity,
        updateResellMargin,
        removeFromCart,
        clearCart,
        refreshCart,
        lastAddedItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
