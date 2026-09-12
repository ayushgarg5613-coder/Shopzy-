import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  X,
  FileText,
} from 'lucide-react';
import { Order } from '../types';
import { api } from '../services/api';
import { OrderTimeline } from '../components/OrderTimeline';

interface OrdersPageProps {
  onOpenAIChat: (prompt: string) => void;
  onNavigateHome: () => void;
  selectedOrderId?: string;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({
  onOpenAIChat,
  onNavigateHome,
  selectedOrderId,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getOrders();
      if (res.success && res.orders) {
        setOrders(res.orders);
        if (selectedOrderId) {
          const match = res.orders.find((o: Order) => o.id === selectedOrderId);
          if (match) setActiveOrder(match);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedOrderId]);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'in_transit':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'packed':
        return 'bg-purple-100 text-purple-900 border-purple-200';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Loading orders & tracking...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-4">
          <Package className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Koi Order Nahi Mila</h2>
        <p className="text-xs sm:text-sm text-gray-500 max-w-sm mt-1 mb-6">
          Aapne abhi tak koi order place nahi kiya hai. Direct weavers se wholesale price par shopping start karein!
        </p>
        <button
          onClick={onNavigateHome}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold text-sm shadow-md cursor-pointer hover:opacity-95"
        >
          Explore Trending Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Title & Sathi AI tracking helper banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
            My Orders ({orders.length})
          </h1>
          <p className="text-xs text-gray-500">
            Track live package movement, courier details & invoices
          </p>
        </div>

        {/* AI Tracking Prompt Chip */}
        <button
          onClick={() => onOpenAIChat('Mera order kaha hai?')}
          className="self-start sm:self-auto px-3.5 py-2 bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 text-rose-700 hover:from-rose-100 hover:to-amber-100 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
        >
          <Sparkles className="w-4 h-4 text-rose-600 animate-pulse" />
          <span>Ask Sathi AI: "Mera order kaha hai?"</span>
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const firstItem = order.items[0];
          const hasMultiple = order.items.length > 1;

          return (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs hover:border-rose-200 transition-all"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100 text-xs">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span className="font-extrabold text-gray-900 text-sm">
                    #{order.orderNumber}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">
                    Placed on{' '}
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="font-bold text-gray-800">
                    Pay via: {order.paymentMethod}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase border ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={firstItem?.image}
                      alt={firstItem?.title}
                      className="w-16 h-20 object-cover rounded-xl bg-gray-100 shrink-0 border border-gray-200"
                    />
                    {hasMultiple && (
                      <span className="absolute -bottom-1.5 -right-1.5 bg-gray-900 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        +{order.items.length - 1} more
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-1">
                      {firstItem?.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Seller: {firstItem?.sellerName}
                    </p>
                    <div className="text-xs text-gray-600 mt-1 flex items-center gap-2">
                      <span>Total Items: {order.items.reduce((s, i) => s + i.quantity, 0)}</span>
                      <span>•</span>
                      <span className="font-extrabold text-gray-950">
                        Paid: ₹{order.totalAmount}
                      </span>
                      {order.resellTotalMargin > 0 && (
                        <span className="text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">
                          Margin: ₹{order.resellTotalMargin}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setActiveOrder(order)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-rose-200 transition-colors"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Track Package</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Delivery ETA info footer */}
              <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  <span>
                    Delivering to: {order.shippingAddress.city}, {order.shippingAddress.pincode}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-semibold text-gray-700">
                    Est Delivery: {order.estimatedDelivery} ({order.courierPartner})
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Tracking Timeline Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-6 border border-gray-100 p-5">
            <button
              onClick={() => setActiveOrder(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <OrderTimeline order={activeOrder} />

            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
              <button
                onClick={() => {
                  const ord = activeOrder;
                  setActiveOrder(null);
                  onOpenAIChat(`Mera order #${ord.orderNumber} kaha pahucha hai?`);
                }}
                className="text-rose-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask Sathi AI about this delivery</span>
              </button>

              <button
                onClick={() => setActiveOrder(null)}
                className="px-4 py-2 bg-gray-900 text-white font-bold rounded-lg cursor-pointer text-xs"
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
