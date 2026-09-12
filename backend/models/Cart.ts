import { db } from '../config/db';
import { CartItem } from '../../frontend/src/types';

export class CartModel {
  static getByUserId(userId: string): CartItem[] {
    if (!db.carts[userId]) {
      db.carts[userId] = [];
    }
    return db.carts[userId];
  }

  static addItem(
    userId: string,
    productId: string,
    quantity = 1,
    selectedColor?: string,
    selectedSize?: string,
    resellMargin = 0
  ): CartItem[] {
    const product = db.findProductById(productId);
    if (!product) throw new Error('Product not found');

    if (!db.carts[userId]) {
      db.carts[userId] = [];
    }

    const existingIndex = db.carts[userId].findIndex(
      (item) =>
        item.productId === productId &&
        item.selectedColor === selectedColor &&
        item.selectedSize === selectedSize
    );

    if (existingIndex > -1) {
      db.carts[userId][existingIndex].quantity += quantity;
      db.carts[userId][existingIndex].resellMargin = resellMargin;
    } else {
      const newItem: CartItem = {
        id: `cart-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId,
        product,
        quantity,
        selectedColor: selectedColor || product.colors[0],
        selectedSize: selectedSize || product.sizes[0],
        resellMargin,
      };
      db.carts[userId].push(newItem);
    }

    return db.carts[userId];
  }

  static updateItem(
    userId: string,
    cartItemId: string,
    updates: { quantity?: number; resellMargin?: number; selectedColor?: string; selectedSize?: string }
  ): CartItem[] {
    const cart = db.carts[userId];
    if (!cart) return [];

    const item = cart.find((i) => i.id === cartItemId);
    if (item) {
      if (typeof updates.quantity === 'number') {
        if (updates.quantity <= 0) {
          db.carts[userId] = cart.filter((i) => i.id !== cartItemId);
          return db.carts[userId];
        }
        item.quantity = updates.quantity;
      }
      if (typeof updates.resellMargin === 'number') {
        item.resellMargin = Math.max(0, updates.resellMargin);
      }
      if (updates.selectedColor) item.selectedColor = updates.selectedColor;
      if (updates.selectedSize) item.selectedSize = updates.selectedSize;
    }

    return db.carts[userId];
  }

  static removeItem(userId: string, cartItemId: string): CartItem[] {
    if (!db.carts[userId]) return [];
    db.carts[userId] = db.carts[userId].filter((i) => i.id !== cartItemId);
    return db.carts[userId];
  }

  static clear(userId: string): void {
    db.carts[userId] = [];
  }
}
