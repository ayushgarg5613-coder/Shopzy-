import { db } from '../config/db';
import { ProductReview } from '../../frontend/src/types';

export class ReviewModel {
  static getForProduct(productId: string): ProductReview[] {
    const product = db.findProductById(productId);
    return product?.reviews || [];
  }

  static upvote(productId: string, reviewId: string): boolean {
    const product = db.findProductById(productId);
    if (!product || !product.reviews) return false;
    const review = product.reviews.find((r) => r.id === reviewId);
    if (!review) return false;
    review.helpfulCount += 1;
    return true;
  }
}
