import { Response } from 'express';
import { CartModel } from '../models/Cart';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class CartController {
  static getCart(req: AuthenticatedRequest, res: Response): void {
    const userId = req.user?.id || 'user-priya';
    const items = CartModel.getByUserId(userId);

    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const resellTotalMargin = items.reduce((sum, item) => sum + (item.resellMargin || 0) * item.quantity, 0);
    const freeDelivery = subtotal >= 499 || items.every((i) => i.product.freeDelivery);
    const shippingFee = freeDelivery ? 0 : 49;
    const totalAmount = subtotal + resellTotalMargin + shippingFee;

    res.json({
      success: true,
      items,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal,
      resellTotalMargin,
      shippingFee,
      totalAmount,
    });
  }

  static addToCart(req: AuthenticatedRequest, res: Response): void {
    const userId = req.user?.id || 'user-priya';
    const { productId, quantity, selectedColor, selectedSize, resellMargin } = req.body;

    if (!productId) {
      res.status(400).json({ success: false, error: 'Product ID is required' });
      return;
    }

    try {
      const items = CartModel.addItem(
        userId,
        productId,
        quantity || 1,
        selectedColor,
        selectedSize,
        resellMargin || 0
      );
      res.status(201).json({ success: true, items });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  }

  static updateCartItem(req: AuthenticatedRequest, res: Response): void {
    const userId = req.user?.id || 'user-priya';
    const { id } = req.params;
    const { quantity, resellMargin, selectedColor, selectedSize } = req.body;

    const items = CartModel.updateItem(userId, id, {
      quantity,
      resellMargin,
      selectedColor,
      selectedSize,
    });

    res.json({ success: true, items });
  }

  static removeCartItem(req: AuthenticatedRequest, res: Response): void {
    const userId = req.user?.id || 'user-priya';
    const { id } = req.params;

    const items = CartModel.removeItem(userId, id);
    res.json({ success: true, items });
  }

  static clearCart(req: AuthenticatedRequest, res: Response): void {
    const userId = req.user?.id || 'user-priya';
    CartModel.clear(userId);
    res.json({ success: true, items: [] });
  }
}
