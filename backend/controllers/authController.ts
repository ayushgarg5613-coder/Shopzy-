import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class AuthController {
  static login(req: Request, res: Response): void {
    const { identifier, phone, email, role } = req.body;
    const query = identifier || phone || email;

    if (!query) {
      res.status(400).json({ success: false, error: 'Phone or email required' });
      return;
    }

    let user = UserModel.getByEmailOrPhone(query);

    // If user doesn't exist, create a new demo customer/seller/admin user
    if (!user) {
      const isEmail = query.includes('@');
      user = UserModel.create({
        name: isEmail ? query.split('@')[0] : `User ${query.slice(-4)}`,
        email: isEmail ? query : `${query}@shopzy.in`,
        phone: !isEmail ? query : '9876543210',
        role: role || 'customer',
        city: 'Jaipur',
        state: 'Rajasthan',
      });
    }

    res.json({
      success: true,
      user,
      token: user.id, // Bearer token is userId in this architecture
    });
  }

  static getProfile(req: AuthenticatedRequest, res: Response): void {
    res.json({
      success: true,
      user: req.user,
    });
  }

  static switchDemoUser(req: Request, res: Response): void {
    const { role } = req.body;
    const allUsers = UserModel.getAll();
    const targetUser = allUsers.find((u) => u.role === role);

    if (!targetUser) {
      res.status(404).json({ success: false, error: `No user found for role ${role}` });
      return;
    }

    res.json({
      success: true,
      user: targetUser,
      token: targetUser.id,
    });
  }

  static listAllUsers(req: Request, res: Response): void {
    res.json({
      success: true,
      users: UserModel.getAll(),
    });
  }
}
