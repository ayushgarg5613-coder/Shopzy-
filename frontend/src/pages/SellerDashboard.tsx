import React, { useState, useEffect } from 'react';
import {
  Store,
  Package,
  DollarSign,
  TrendingUp,
  Plus,
  Trash2,
  Edit,
  Truck,
  CheckCircle2,
  X,
  Star,
} from 'lucide-react';
import { Product, Order } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const SellerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form for new product
  const [formData, setFormData] = useState({
    title: '',
    titleHindi: '',
    category: 'Women Ethnic',
    price: 399,
    originalPrice: 1299,
    description: '',
    fabric: 'Pure Cotton',
    colors: 'Maroon, Black, Blue',
    sizes: 'M, L, XL, XXL',
    stock: 50,
    images: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=700&auto=format&fit=crop&q=80',
    freeDelivery: true,
    codAvailable: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, orderRes] = await Promise.all([
        api.getProducts(),
        api.getOrders(),
      ]);
      if (prodRes.success && prodRes.products) {
        // filter for this seller
        const myProds = prodRes.products.filter(
          (p: Product) => p.sellerId === user?.id || p.sellerName.includes('Ramesh')
        );
        setProducts(myProds.length > 0 ? myProds : prodRes.products.slice(0, 4));
      }
      if (orderRes.success && orderRes.orders) {
        setOrders(orderRes.orders);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<Product> = {
        title: formData.title,
        titleHindi: formData.titleHindi,
        category: formData.category,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        description: formData.description,
        fabric: formData.fabric,
        colors: formData.colors.split(',').map((c) => c.trim()),
        sizes: formData.sizes.split(',').map((s) => s.trim()),
        stock: Number(formData.stock),
        images: [formData.images],
        freeDelivery: formData.freeDelivery,
        codAvailable: formData.codAvailable,
        sellerId: user?.id || 'seller-ramesh',
        sellerName: user?.name || 'Ramesh Fab Hub',
        sellerCity: 'Jaipur, Rajasthan',
      };

      const res = await api.createProduct(payload);
      if (res.success && res.product) {
        setProducts((prev) => [res.product, ...prev]);
        setShowAddModal(false);
        // reset form
        setFormData({
          title: '',
          titleHindi: '',
          category: 'Women Ethnic',
          price: 399,
          originalPrice: 1299,
          description: '',
          fabric: 'Pure Cotton',
          colors: 'Maroon, Black',
          sizes: 'M, L, XL',
          stock: 50,
          images: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=700&auto=format&fit=crop&q=80',
          freeDelivery: true,
          codAvailable: true,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to remove this product from your inventory?')) return;
    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const res = await api.updateOrderStatus(orderId, newStatus, `Updated by seller ${user?.name}`);
      if (res.success && res.order) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.subtotal, 0);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-rose-700 rounded-2xl p-5 sm:p-6 text-white mb-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-amber-950 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                Seller Hub
              </span>
              <span className="text-xs text-amber-200">Wholesale Direct Manufacturer Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-1">
              Welcome, {user?.name || 'Ramesh Fab Hub'}
            </h1>
            <p className="text-xs text-amber-100 mt-0.5">
              0% Marketplace Commission • Next Day Direct Bank Payouts
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-amber-50 text-amber-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md cursor-pointer transition-all shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-amber-700" />
            <span>List New Product</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Total Listed</span>
            <Package className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
            {products.length}
          </div>
          <span className="text-[11px] text-emerald-700 font-bold">100% active in catalog</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Customer Orders</span>
            <Truck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
            {orders.length}
          </div>
          <span className="text-[11px] text-amber-700 font-bold">
            {orders.filter((o) => o.status !== 'delivered').length} pending dispatch
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Gross Sales (₹)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-700 font-bold">Direct to bank account</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Supplier Rating</span>
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
            4.8★
          </div>
          <span className="text-[11px] text-gray-500">Top Rated Jaipur Weaver</span>
        </div>
      </div>

      {/* Tabs & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Inventory (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
            <h2 className="font-bold text-sm sm:text-base text-gray-900">
              My Listed Catalog ({products.length})
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
            >
              + Add Product
            </button>
          </div>

          <div className="space-y-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-rose-200 transition-colors"
              >
                <img
                  src={p.images[0]}
                  alt=""
                  className="w-14 h-16 object-cover rounded-lg bg-gray-100 shrink-0"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <h3 className="font-bold text-gray-900 truncate">{p.title}</h3>
                  <div className="flex items-center gap-2 text-gray-500 mt-0.5">
                    <span>Category: {p.category}</span>
                    <span>•</span>
                    <span>Stock: {p.stock} units</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-extrabold text-gray-950">₹{p.price}</span>
                    <span className="text-gray-400 line-through text-[11px]">₹{p.originalPrice}</span>
                    <span className="text-emerald-700 font-bold text-[11px]">
                      {p.discountPercent}% OFF
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteProduct(p.id)}
                  className="p-2 text-gray-400 hover:text-rose-600 rounded-lg cursor-pointer"
                  title="Delete product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Incoming Orders to Dispatch (1 col) */}
        <div className="bg-white rounded-xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs">
          <h2 className="font-bold text-sm sm:text-base text-gray-900 pb-3 border-b border-gray-100 mb-4">
            Recent Orders ({orders.length})
          </h2>

          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-3 rounded-xl border border-gray-200 text-xs space-y-2 bg-gray-50/50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-gray-900">#{order.orderNumber}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                    {order.status}
                  </span>
                </div>

                <p className="text-gray-600 text-[11px]">
                  Customer: {order.userName} ({order.shippingAddress.city})
                </p>
                <div className="font-bold text-gray-900">
                  Value: ₹{order.totalAmount} • {order.paymentMethod}
                </div>

                {/* Status Updater Buttons */}
                <div className="pt-2 border-t border-gray-200/80 flex items-center gap-1.5 flex-wrap">
                  {order.status === 'ordered' && (
                    <button
                      onClick={() => handleUpdateOrderStatus(order.id, 'packed')}
                      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded text-[10px] cursor-pointer"
                    >
                      Mark as Packed
                    </button>
                  )}
                  {order.status === 'packed' && (
                    <button
                      onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-[10px] cursor-pointer"
                    >
                      Handover to Courier
                    </button>
                  )}
                  {order.status === 'shipped' && (
                    <button
                      onClick={() => handleUpdateOrderStatus(order.id, 'in_transit')}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-[10px] cursor-pointer"
                    >
                      In Transit
                    </button>
                  )}
                  {order.status === 'in_transit' && (
                    <button
                      onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[10px] cursor-pointer"
                    >
                      Mark Delivered
                    </button>
                  )}
                  {order.status === 'delivered' && (
                    <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-6 border border-gray-100 p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-base text-gray-900">
                List New Wholesale Product
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Product Title (English) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Pure Georgette Chikankari Kurti with Inner"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:border-rose-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Product Title in Hindi (Optional)
                </label>
                <input
                  type="text"
                  value={formData.titleHindi}
                  onChange={(e) => setFormData({ ...formData, titleHindi: e.target.value })}
                  placeholder="e.g. शुद्ध जॉर्जेट चिकनकारी कुर्ती"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:border-rose-500 font-medium"
                  >
                    <option value="Women Ethnic">Women Ethnic</option>
                    <option value="Western Wear">Western Wear</option>
                    <option value="Jewellery & Accessories">Jewellery & Accessories</option>
                    <option value="Men's Fashion">Men's Fashion</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Beauty & Footwear">Beauty & Footwear</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Fabric</label>
                  <input
                    type="text"
                    value={formData.fabric}
                    onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                    placeholder="e.g. Cotton, Rayon, Silk"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Wholesale Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:border-rose-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Original MRP (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:border-rose-500 font-bold text-gray-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Stock Units *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Colors (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.colors}
                    onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                    placeholder="Maroon, Black, Blue"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Sizes (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    placeholder="S, M, L, XL, XXL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe fabric, weave, embroidery details..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold cursor-pointer shadow-sm hover:opacity-95"
                >
                  Publish to Marketplace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
