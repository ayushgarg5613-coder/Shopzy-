import { db } from '../config/db';
import { Order, OrderItem, Address } from '../../frontend/src/types';

export class OrderModel {
  static getAll(): Order[] {
    return db.orders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  static getById(id: string): Order | undefined {
    return db.orders.find((o) => o.id === id || o.orderNumber === id);
  }

  static getByUserId(userId: string): Order[] {
    return db.findOrdersByUserId(userId);
  }

  static create(orderData: {
    userId: string;
    userName: string;
    userPhone: string;
    items: OrderItem[];
    shippingAddress: Address;
    paymentMethod: 'COD' | 'UPI' | 'NET_BANKING' | 'CARD';
    subtotal: number;
    discount: number;
    shippingFee: number;
    resellTotalMargin: number;
    totalAmount: number;
  }): Order {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `SS-${randomSuffix}-IN`;
    const courierOptions = ['Delhivery Express', 'Shadowfax Logistics', 'Ecom Express', 'BlueDart'];
    const selectedCourier = courierOptions[Math.floor(Math.random() * courierOptions.length)];
    const trackingNumber = `${selectedCourier.slice(0, 3).toUpperCase()}-IN-${Math.floor(1000000 + Math.random() * 9000000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      userId: orderData.userId,
      userName: orderData.userName,
      userPhone: orderData.userPhone,
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentMethod === 'COD' ? 'pending' : 'completed',
      subtotal: orderData.subtotal,
      discount: orderData.discount,
      shippingFee: orderData.shippingFee,
      resellTotalMargin: orderData.resellTotalMargin,
      totalAmount: orderData.totalAmount,
      status: 'ordered',
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 96 * 3600 * 1000).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        weekday: 'short',
      }),
      courierPartner: selectedCourier,
      trackingNumber,
      timeline: [
        {
          status: 'ordered',
          title: 'Order Placed Successfully',
          description: `Order confirmed via ${orderData.paymentMethod}. Preparing to ship directly from supplier.`,
          timestamp: new Date().toLocaleString('en-IN'),
          location: `${orderData.shippingAddress.city} Central Hub`,
        },
      ],
    };

    db.orders.unshift(newOrder);
    // reduce product stocks
    for (const item of orderData.items) {
      const prod = db.findProductById(item.productId);
      if (prod && prod.stock >= item.quantity) {
        prod.stock -= item.quantity;
      }
    }
    return newOrder;
  }

  static updateStatus(
    orderId: string,
    status: Order['status'],
    timelineNote?: string,
    location?: string
  ): Order | null {
    const order = db.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return null;

    order.status = status;
    const titles: Record<string, string> = {
      packed: 'Packed and Quality Passed',
      shipped: 'Handed Over to Courier',
      in_transit: 'In Transit',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Package Delivered',
      cancelled: 'Order Cancelled',
    };

    order.timeline.push({
      status,
      title: titles[status] || `Status updated to ${status}`,
      description: timelineNote || `Shipment status updated to ${status}`,
      timestamp: new Date().toLocaleString('en-IN'),
      location: location || 'Transit Hub',
    });

    return order;
  }
}
