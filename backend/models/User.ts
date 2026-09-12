import { db } from '../config/db';
import { User, UserRole } from '../../frontend/src/types';

export class UserModel {
  static getAll(): User[] {
    return db.users;
  }

  static getById(id: string): User | undefined {
    return db.findUserById(id);
  }

  static getByEmailOrPhone(query: string): User | undefined {
    return db.findUserByEmailOrPhone(query);
  }

  static create(userData: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    return newUser;
  }

  static update(id: string, updates: Partial<User>): User | null {
    const user = db.findUserById(id);
    if (!user) return null;
    Object.assign(user, updates);
    return user;
  }
}
