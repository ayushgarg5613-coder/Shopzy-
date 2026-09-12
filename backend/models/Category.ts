import { db } from '../config/db';
import { Category } from '../../frontend/src/types';

export class CategoryModel {
  static getAll(): Category[] {
    return db.categories;
  }

  static getBySlug(slug: string): Category | undefined {
    return db.categories.find((c) => c.slug === slug || c.name.toLowerCase() === slug.toLowerCase());
  }
}
