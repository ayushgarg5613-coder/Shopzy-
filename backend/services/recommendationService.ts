import { db } from '../config/db';
import { Product } from '../../frontend/src/types';

export class RecommendationService {
  static getSimilarProducts(productId: string, limit = 4): Product[] {
    const target = db.findProductById(productId);
    if (!target) return db.products.slice(0, limit);

    return db.products
      .filter((p) => p.id !== productId)
      .map((p) => {
        let score = 0;
        if (p.category === target.category) score += 3;
        if (p.subCategory && target.subCategory && p.subCategory === target.subCategory) score += 2;
        if (p.fabric && target.fabric && p.fabric === target.fabric) score += 1;
        const commonTags = p.tags.filter((t) => target.tags.includes(t)).length;
        score += commonTags;
        return { product: p, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((item) => item.product)
      .slice(0, limit);
  }

  static getCheaperAlternatives(productId: string, limit = 3): Product[] {
    const target = db.findProductById(productId);
    if (!target) {
      // Return lowest priced products in catalog
      return [...db.products].sort((a, b) => a.price - b.price).slice(0, limit);
    }

    const cheaperInSameCategory = db.products
      .filter((p) => p.id !== target.id && p.category === target.category && p.price < target.price)
      .sort((a, b) => a.price - b.price);

    if (cheaperInSameCategory.length > 0) {
      return cheaperInSameCategory.slice(0, limit);
    }

    // fallback: cheaper anywhere with related tags
    return db.products
      .filter((p) => p.id !== target.id && p.price < target.price)
      .sort((a, b) => a.price - b.price)
      .slice(0, limit);
  }

  static searchByBudgetAndIntent(query: string, maxBudget?: number): Product[] {
    const q = query.toLowerCase();
    const words = q.split(/\s+/);

    return db.products
      .filter((p) => {
        if (maxBudget && p.price > maxBudget) return false;

        const text = `${p.title} ${p.titleHindi || ''} ${p.description} ${p.category} ${p.subCategory || ''} ${p.tags.join(' ')} ${p.colors.join(' ')} ${p.fabric || ''}`.toLowerCase();

        return words.some((w) => w.length > 2 && text.includes(w));
      })
      .sort((a, b) => {
        // prioritize higher rated and good discount
        return b.rating * 10 - a.price / 100 - (a.rating * 10 - b.price / 100);
      });
  }

  static compareProducts(productIds: string[]): {
    products: Product[];
    winner: Product | null;
    analysis: string;
  } {
    const items = productIds.map((id) => db.findProductById(id)).filter(Boolean) as Product[];
    if (items.length < 2) {
      return {
        products: items,
        winner: items[0] || null,
        analysis: 'Comparison requires at least two products.',
      };
    }

    const [p1, p2] = items;
    let winner = p1;
    let analysis = '';

    if (p1.rating > p2.rating && p1.price <= p2.price) {
      winner = p1;
      analysis = `"${p1.title}" is better! It has a higher rating (${p1.rating}★ vs ${p2.rating}★) and costs ₹${p1.price} (cheaper or equal to ₹${p2.price}).`;
    } else if (p2.rating > p1.rating && p2.price <= p1.price) {
      winner = p2;
      analysis = `"${p2.title}" is better! It boasts a ${p2.rating}★ rating from ${p2.ratingCount} customers and is priced at only ₹${p2.price}.`;
    } else if (p1.price < p2.price) {
      winner = p1;
      analysis = `If budget is your priority, "${p1.title}" (₹${p1.price}) saves you ₹${p2.price - p1.price} compared to "${p2.title}" (₹${p2.price}) with great ${p1.rating}★ quality!`;
    } else {
      winner = p2;
      analysis = `"${p2.title}" (₹${p2.price}) gives superior fabric (${p2.fabric || 'premium material'}) and ${p2.rating}★ rating.`;
    }

    return { products: items, winner, analysis };
  }
}
