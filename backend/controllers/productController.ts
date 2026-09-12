import { Request, Response } from 'express';
import { ProductModel } from '../models/Product';
import { CategoryModel } from '../models/Category';
import { RecommendationService } from '../services/recommendationService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class ProductController {
  static getAll(req: Request, res: Response): void {
    let products = ProductModel.getAll();

    const {
      search,
      category,
      minPrice,
      maxPrice,
      minRating,
      sortBy,
      freeDelivery,
      cod,
      fabric,
      color,
      sellerId,
    } = req.query;

    if (sellerId) {
      products = products.filter((p) => p.sellerId === sellerId);
    }

    if (search) {
      const q = (search as string).toLowerCase().trim();
      products = products.filter((p) => {
        const text = `${p.title} ${p.titleHindi || ''} ${p.description} ${p.category} ${p.tags.join(' ')} ${p.colors.join(' ')} ${p.fabric || ''}`.toLowerCase();
        return text.includes(q);
      });
    }

    if (category && category !== 'all') {
      const cat = (category as string).toLowerCase();
      products = products.filter(
        (p) => p.category.toLowerCase() === cat || p.subCategory?.toLowerCase() === cat
      );
    }

    if (minPrice) {
      products = products.filter((p) => p.price >= Number(minPrice));
    }

    if (maxPrice) {
      products = products.filter((p) => p.price <= Number(maxPrice));
    }

    if (minRating) {
      products = products.filter((p) => p.rating >= Number(minRating));
    }

    if (freeDelivery === 'true') {
      products = products.filter((p) => p.freeDelivery);
    }

    if (cod === 'true') {
      products = products.filter((p) => p.codAvailable);
    }

    if (fabric) {
      const fab = (fabric as string).toLowerCase();
      products = products.filter((p) => p.fabric?.toLowerCase().includes(fab));
    }

    if (color) {
      const col = (color as string).toLowerCase();
      products = products.filter((p) => p.colors.some((c) => c.toLowerCase().includes(col)));
    }

    // Sorting
    switch (sortBy) {
      case 'price_low':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        products.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'popularity':
      default:
        products.sort((a, b) => b.ratingCount - a.ratingCount);
        break;
    }

    res.json({
      success: true,
      count: products.length,
      products,
    });
  }

  static getById(req: Request, res: Response): void {
    const { id } = req.params;
    const product = ProductModel.getById(id);

    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    const similar = RecommendationService.getSimilarProducts(id, 4);
    const cheaper = RecommendationService.getCheaperAlternatives(id, 3);

    res.json({
      success: true,
      product,
      similar,
      cheaper,
    });
  }

  static getCategories(req: Request, res: Response): void {
    res.json({
      success: true,
      categories: CategoryModel.getAll(),
    });
  }

  static create(req: AuthenticatedRequest, res: Response): void {
    const productData = req.body;
    if (!productData.title || !productData.price || !productData.category) {
      res.status(400).json({ success: false, error: 'Title, price, and category are required' });
      return;
    }

    const newProduct = ProductModel.create({
      ...productData,
      sellerId: req.user?.id || 'user-seller-ramesh',
      sellerName: req.user?.businessName || req.user?.name || 'Jaipur Fab Hub Wholesale',
      sellerCity: req.user?.city || 'Jaipur',
      rating: 4.8,
      ratingCount: 1,
      reviewCount: 0,
      images: productData.images?.length
        ? productData.images
        : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80'],
      colors: productData.colors || ['Black', 'Maroon'],
      sizes: productData.sizes || ['Free Size'],
      tags: productData.tags || [productData.category.toLowerCase()],
      discountPercent: Math.round(
        (((productData.originalPrice || productData.price * 2) - productData.price) /
          (productData.originalPrice || productData.price * 2)) *
          100
      ),
      originalPrice: productData.originalPrice || productData.price * 2,
      freeDelivery: productData.freeDelivery ?? true,
      codAvailable: productData.codAvailable ?? true,
      returnDays: 7,
    });

    res.status(201).json({ success: true, product: newProduct });
  }

  static update(req: AuthenticatedRequest, res: Response): void {
    const { id } = req.params;
    const updated = ProductModel.update(id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }
    res.json({ success: true, product: updated });
  }

  static delete(req: AuthenticatedRequest, res: Response): void {
    const { id } = req.params;
    const deleted = ProductModel.delete(id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }
    res.json({ success: true, message: 'Product deleted' });
  }

  static addReview(req: AuthenticatedRequest, res: Response): void {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      res.status(400).json({ success: false, error: 'Rating and comment are required' });
      return;
    }

    const review = ProductModel.addReview(id, {
      userId: req.user?.id || 'guest',
      userName: req.user?.name || 'Verified Customer',
      rating: Number(rating),
      comment,
      verifiedPurchase: true,
      helpfulCount: 0,
      customerCity: req.user?.city || 'Jaipur',
    });

    if (!review) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    res.status(201).json({ success: true, review });
  }
}
