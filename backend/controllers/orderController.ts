import { Response } from 'express';
import { OrderModel } from '../models/Order';
import { CartModel } from '../models/Cart';
import { db } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Address } from '../../frontend/src/types';

export class OrderController {
  static getOrders(req: AuthenticatedRequest, res: Response): void {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    if (user.role === 'admin') {
      res.json({ success: true, orders: OrderModel.getAll() });
      return;
    }

    if (user.role === 'seller') {
      // Return orders containing products from this seller
      const allOrders = OrderModel.getAll();
      const sellerOrders = allOrders.filter((o) =>
        o.items.some((item) => {
          const product = db.findProductById(item.productId);
          return product?.sellerId === user.id;
        })
      );
      res.json({ success: true, orders: sellerOrders });
      return;
    }

    // Customer
    const orders = OrderModel.getByUserId(user.id);
    res.json({ success: true, orders });
  }

  static getOrderById(req: AuthenticatedRequest, res: Response): void {
    const { id } = req.params;
    const order = OrderModel.getById(id);

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    res.json({ success: true, order });
  }

  static createOrder(req: AuthenticatedRequest, res: Response): void {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { shippingAddress, paymentMethod, couponCode } = req.body;

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.pincode) {
      res.status(400).json({ success: false, error: 'Complete shipping address is required' });
      return;
    }

    const cartItems = CartModel.getByUserId(user.id);
    if (cartItems.length === 0) {
      res.status(400).json({ success: false, error: 'Cart is empty' });
      return;
    }

    const orderItems = cartItems.map((item) => ({
      productId: item.productId,
      title: item.product.title,
      image: item.product.images[0] || '',
      price: item.product.price,
      resellMargin: item.resellMargin || 0,
      finalCustomerPrice: item.product.price + (item.resellMargin || 0),
      quantity: item.quantity,
      color: item.selectedColor,
      size: item.selectedSize,
      sellerName: item.product.sellerName,
    }));

    const subtotal = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    const resellTotalMargin = cartItems.reduce((sum, i) => sum + (i.resellMargin || 0) * i.quantity, 0);

    let discount = 0;
    if (couponCode === 'SATHI100' && subtotal >= 500) {
      discount = 100;
    } else if (couponCode === 'PEHLIBAAR' && subtotal >= 300) {
      discount = 50;
    }

    const shippingFee = subtotal >= 499 ? 0 : 49;
    const totalAmount = Math.max(0, subtotal - discount + resellTotalMargin + shippingFee);

    const order = OrderModel.create({
      userId: user.id,
      userName: shippingAddress.name || user.name,
      userPhone: shippingAddress.phone || user.phone,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      subtotal,
      discount,
      shippingFee,
      resellTotalMargin,
      totalAmount,
    });

    // Clear user cart
    CartModel.clear(user.id);

    // Save address if not already present
    const existingAddr = db.addresses.find(
      (a) => a.userId === user.id && a.street === shippingAddress.street && a.pincode === shippingAddress.pincode
    );
    if (!existingAddr) {
      db.addresses.push({
        ...shippingAddress,
        id: `addr-${Date.now()}`,
        userId: user.id,
      });
    }

    res.status(201).json({ success: true, order });
  }

  static updateStatus(req: AuthenticatedRequest, res: Response): void {
    const { id } = req.params;
    const { status, note, location } = req.body;

    if (!status) {
      res.status(400).json({ success: false, error: 'Status is required' });
      return;
    }

    const updated = OrderModel.updateStatus(id, status, note, location);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    res.json({ success: true, order: updated });
  }

  static getAddresses(req: AuthenticatedRequest, res: Response): void {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    res.json({ success: true, addresses: db.findAddressesByUserId(user.id) });
  }

  static addAddress(req: AuthenticatedRequest, res: Response): void {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const newAddr: Address = {
      ...req.body,
      id: `addr-${Date.now()}`,
      userId: user.id,
    };
    db.addresses.push(newAddr);
    res.status(201).json({ success: true, address: newAddr });
  }
}
