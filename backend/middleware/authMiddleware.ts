import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/User';
import { User } from '../../frontend/src/types';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  let userId: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    userId = authHeader.split(' ')[1];
  } else if (req.headers['x-user-id']) {
    userId = req.headers['x-user-id'] as string;
  } else if (req.query.userId) {
    userId = req.query.userId as string;
  }

  // If no userId provided, fall back to default user for seamless experience, or reject if strict
  if (!userId) {
    userId = 'user-priya'; // Default customer
  }

  const user = UserModel.getById(userId);
  if (!user) {
    res.status(401).json({ success: false, error: 'Unauthorized: User not found' });
    return;
  }

  req.user = user;
  next();
};
