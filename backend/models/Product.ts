import { db } from '../config/db';
import { Product, ProductReview } from '../../frontend/src/types';

export class ProductModel {
  static getAll(): Product[] {
    return db.products;
  }

  static getById(id: string): Product | undefined {
    return db.findProductById(id);
  }

  static getBySellerId(sellerId: string): Product[] {
    return db.products.filter((p) => p.sellerId === sellerId);
  }

  static create(productData: Omit<Product, 'id'>): Product {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    db.products.unshift(newProduct);
    return newProduct;
  }

  static update(id: string, updates: Partial<Product>): Product | null {
    const product = db.findProductById(id);
    if (!product) return null;
    Object.assign(product, updates);
    return product;
  }

  static delete(id: string): boolean {
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) return false;
    db.products.splice(index, 1);
    return true;
  }

  static addReview(productId: string, review: Omit<ProductReview, 'id' | 'date'>): ProductReview | null {
    const product = db.findProductById(productId);
    if (!product) return null;
    const newReview: ProductReview = {
      ...review,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    if (!product.reviews) product.reviews = [];
    product.reviews.unshift(newReview);
    product.reviewCount = product.reviews.length;
    // recalculate rating average
    const sum = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    product.rating = Number((sum / product.reviews.length).toFixed(1));
    product.ratingCount += 1;
    return newReview;
  }
}
