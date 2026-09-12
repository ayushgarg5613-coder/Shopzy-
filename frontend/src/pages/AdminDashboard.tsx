import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Package,
  Users,
  Store,
  CheckCircle2,
  Trash2,
  Search,
} from 'lucide-react';
import { Product, Order } from '../types';
import { api } from '../services/api';

export const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState<string>('all');

  const loadData = async () => {
    try {
      setLoading(true);
      const [orderRes, prodRes] = await Promise.all([api.getOrders(), api.getProducts()]);
      if (orderRes.success && orderRes.orders) {
        setOrders(orderRes.orders);
      }
      if (prodRes.success && prodRes.products) {
        setProducts(prodRes.products);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    try {
      const res = await api.updateOrderStatus(orderId, status, 'Status updated by Super Admin');
      if (res.success && res.order) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Admin: remove this product from the platform?')) return;
    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const platformGMV = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const filteredOrders =
    orderFilter === 'all' ? orders : orders.filter((o) => o.status === orderFilter);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-rose-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white mb-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-xs text-rose-200 uppercase font-bold tracking-wider">
                Shopzy Central Administration
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-1">Platform Control & Analytics</h1>
            <p className="text-xs text-gray-300 mt-0.5">
              Live monitoring of marketplace orders, manufacturer fulfillment, and AI interactions
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Platform GMV</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
            ₹{(platformGMV + 14850).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-700 font-bold">+18.4% vs last week</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Total Orders</span>
            <Package className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
            {orders.length}
          </div>
          <span className="text-[11px] text-gray-500">Across 14 states</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Catalog Items</span>
            <Store className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
            {products.length}
          </div>
          <span className="text-[11px] text-emerald-700 font-bold">100% in stock</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Active Sellers</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
            18
          </div>
          <span className="text-[11px] text-gray-500">Surat, Jaipur, Varanasi</span>
        </div>
      </div>

      {/* Orders Manager */}
      <div className="bg-white rounded-xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 mb-4">
          <div>
            <h2 className="font-extrabold text-sm sm:text-base text-gray-900">
              Live Order Management & Status Controller
            </h2>
            <p className="text-xs text-gray-500">
              Update shipment statuses in real time to simulate courier transit
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {['all', 'ordered', 'packed', 'shipped', 'in_transit', 'delivered'].map((st) => (
              <button
                key={st}
                onClick={() => setOrderFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-bold capitalize cursor-pointer transition-colors ${
                  orderFilter === st
                    ? 'bg-rose-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider font-semibold">
                <th className="pb-2.5 font-bold">Order #</th>
                <th className="pb-2.5 font-bold">Customer</th>
                <th className="pb-2.5 font-bold">Destination</th>
                <th className="pb-2.5 font-bold">Amount</th>
                <th className="pb-2.5 font-bold">Payment</th>
                <th className="pb-2.5 font-bold">Status</th>
                <th className="pb-2.5 font-bold text-right">Quick Transition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-gray-50/80">
                  <td className="py-3 font-bold text-gray-900">#{ord.orderNumber}</td>
                  <td className="py-3 font-medium text-gray-800">{ord.userName}</td>
                  <td className="py-3 text-gray-600">
                    {ord.shippingAddress.city}, {ord.shippingAddress.pincode}
                  </td>
                  <td className="py-3 font-extrabold text-gray-950">₹{ord.totalAmount}</td>
                  <td className="py-3 text-gray-600">{ord.paymentMethod}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-50 text-rose-700 border border-rose-200">
                      {ord.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <select
                      value={ord.status}
                      onChange={(e) =>
                        handleUpdateStatus(ord.id, e.target.value as Order['status'])
                      }
                      className="bg-white border border-gray-300 rounded px-2 py-1 text-[11px] font-semibold text-gray-800 cursor-pointer focus:outline-hidden focus:border-rose-500"
                    >
                      <option value="ordered">Ordered</option>
                      <option value="packed">Packed</option>
                      <option value="shipped">Shipped</option>
                      <option value="in_transit">In Transit</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Catalog Manager */}
      <div className="bg-white rounded-xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs">
        <h2 className="font-extrabold text-sm sm:text-base text-gray-900 pb-3 border-b border-gray-100 mb-4">
          All Products ({products.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="p-3 rounded-xl border border-gray-100 flex items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={p.images[0]}
                  alt=""
                  className="w-12 h-14 object-cover rounded bg-gray-100 shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{p.title}</p>
                  <p className="text-[11px] text-gray-500 truncate">
                    {p.sellerName} • ₹{p.price}
                  </p>
                  <span className="text-[10px] text-emerald-700 font-bold">
                    Rating: {p.rating}★ ({p.ratingCount})
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDeleteProduct(p.id)}
                className="text-gray-400 hover:text-rose-600 p-1.5 cursor-pointer"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
