import React, { useState, useEffect } from 'react';
import {
  MapPin,
  CreditCard,
  QrCode,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Plus,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';
import { Address, Order } from '../types';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface CheckoutPageProps {
  appliedCoupon: string;
  onOrderPlaced: (order: Order) => void;
  onBackToCart: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  appliedCoupon,
  onOrderPlaced,
  onBackToCart,
}) => {
  const { user } = useAuth();
  const { items, subtotal, resellTotalMargin, shippingFee, totalAmount } = useCart();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI' | 'NET_BANKING' | 'CARD'>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Address Form State
  const [newAddr, setNewAddr] = useState({
    name: user?.name || 'Priya Sharma',
    phone: user?.phone || '9876543210',
    street: '',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302001',
    isDefault: true,
  });

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const res = await api.getAddresses();
        if (res.success && res.addresses.length > 0) {
          setAddresses(res.addresses);
          setSelectedAddressId(res.addresses[0].id);
        } else {
          setShowNewAddressForm(true);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadAddresses();
  }, []);

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.addAddress(newAddr);
      if (res.success && res.address) {
        setAddresses((prev) => [...prev, res.address]);
        setSelectedAddressId(res.address.id);
        setShowNewAddressForm(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePlaceOrder = async () => {
    const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || {
      ...newAddr,
      id: 'addr-temp',
      userId: user?.id || 'user-priya',
    };

    setIsSubmitting(true);
    try {
      const res = await api.createOrder({
        shippingAddress: selectedAddress,
        paymentMethod,
        couponCode: appliedCoupon,
      });

      if (res.success && res.order) {
        onOrderPlaced(res.order);
      }
    } catch (e) {
      console.error('Failed to place order:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const discount = appliedCoupon === 'SATHI100' ? 100 : appliedCoupon === 'PEHLIBAAR' ? 50 : 0;
  const finalPayable = Math.max(0, totalAmount - discount);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBackToCart}
          className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
            Checkout & Delivery Address
          </h1>
          <p className="text-xs text-gray-500">
            Fast delivery across 27,000+ Indian Pincodes with 100% Purchase Protection
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Address & Payment Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Address Selection */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h2 className="font-bold text-sm sm:text-base text-gray-900">
                  Select Delivery Address
                </h2>
              </div>
              {!showNewAddressForm && (
                <button
                  onClick={() => setShowNewAddressForm(true)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              )}
            </div>

            {/* Existing Addresses */}
            {!showNewAddressForm && addresses.length > 0 && (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`block p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-rose-600 bg-rose-50/40 ring-1 ring-rose-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="delivery_address"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1 text-rose-600 focus:ring-rose-500"
                      />
                      <div className="text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">{addr.name}</span>
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-semibold">
                            Home
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">
                          {addr.street}, {addr.city}, {addr.state} -{' '}
                          <span className="font-bold text-gray-900">{addr.pincode}</span>
                        </p>
                        <p className="text-gray-500 mt-0.5">Contact: +91 {addr.phone}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Add New Address Form */}
            {showNewAddressForm && (
              <form onSubmit={handleAddNewAddress} className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Recipient Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddr.name}
                      onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                      placeholder="e.g. Priya Sharma / Customer Name"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                      placeholder="10-digit mobile number"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Flat, House no., Building, Street *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddr.street}
                    onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                    placeholder="e.g. B-42, Malviya Nagar, Near Gaurav Tower"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddr.pincode}
                      onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                      placeholder="e.g. 302001"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:border-rose-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={newAddr.state}
                      onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors shadow-2xs"
                  >
                    Save & Use Address
                  </button>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="px-3 py-2 text-xs text-gray-500 hover:text-gray-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Section 2: Payment Method Selection */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-6 shadow-2xs">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-4">
              <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h2 className="font-bold text-sm sm:text-base text-gray-900">
                Choose Payment Method
              </h2>
            </div>

            <div className="space-y-3">
              {/* COD */}
              <label
                className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-rose-600 bg-rose-50/40 ring-1 ring-rose-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-1 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">
                        Cash on Delivery (COD)
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Most Popular
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Pay cash or UPI directly to the courier agent upon doorstep delivery. No advance payment needed.
                    </p>
                  </div>
                </div>
              </label>

              {/* UPI */}
              <label
                className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'UPI'
                    ? 'border-rose-600 bg-rose-50/40 ring-1 ring-rose-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                    className="mt-1 text-rose-600 focus:ring-rose-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">
                        Instant UPI (Google Pay / PhonePe / Paytm)
                      </span>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Fastest
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Zero transaction fees. Instant confirmation.
                    </p>

                    {paymentMethod === 'UPI' && (
                      <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-md flex items-center justify-center text-gray-600">
                          <QrCode className="w-10 h-10 text-rose-700" />
                        </div>
                        <div className="text-xs">
                          <span className="font-bold text-gray-900 block">Scan with Any UPI App</span>
                          <span className="text-gray-500 text-[11px]">
                            UPI ID: <strong>shopzy@icici</strong>
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                            ✓ Instant auto-verification enabled
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </label>

              {/* Net Banking / Cards */}
              <label
                className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'CARD'
                    ? 'border-rose-600 bg-rose-50/40 ring-1 ring-rose-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'CARD'}
                    onChange={() => setPaymentMethod('CARD')}
                    className="mt-1 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <span className="font-bold text-gray-900 text-sm">
                      Debit / Credit Card / Net Banking
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Visa, MasterCard, RuPay & all major Indian banks supported.
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-3 border-b border-gray-100">
              Order Review ({items.length} {items.length === 1 ? 'Product' : 'Products'})
            </h3>

            {/* Items mini list */}
            <div className="py-3 space-y-2.5 max-h-44 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={i.id} className="flex items-center gap-2.5 text-xs">
                  <img
                    src={i.product.images[0]}
                    alt=""
                    className="w-10 h-12 object-cover rounded bg-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 truncate">{i.product.title}</p>
                    <span className="text-[11px] text-gray-500">
                      Qty: {i.quantity} {i.selectedSize ? `• ${i.selectedSize}` : ''}
                    </span>
                  </div>
                  <span className="font-bold text-gray-900">
                    ₹{i.product.price * i.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Price lines */}
            <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">₹{subtotal}</span>
              </div>

              {resellTotalMargin > 0 && (
                <div className="flex justify-between text-amber-800 font-semibold">
                  <span>Reseller Margin (Your Earning)</span>
                  <span>+₹{resellTotalMargin}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className="font-semibold text-emerald-700 uppercase">
                  {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                <span className="text-sm font-extrabold text-gray-900">Total Payable</span>
                <span className="text-xl font-black text-rose-700">₹{finalPayable}</span>
              </div>
            </div>

            {/* Reselling Profit Alert */}
            {resellTotalMargin > 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <span>Reseller Profit: ₹{resellTotalMargin}</span>
                </div>
                <p className="text-[11px] text-amber-800 mt-1">
                  Customer will pay ₹{finalPayable} at delivery. Your margin ₹{resellTotalMargin} will be transferred to your account.
                </p>
              </div>
            )}

            {/* Place Order CTA */}
            <button
              id="confirm-place-order-btn"
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="mt-5 w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-rose-200 transition-all disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Placing Order...' : 'Place Order (COD / UPI)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="mt-3 text-center text-[11px] text-gray-400">
                            By placing the order, you agree to Shopzy's Terms of Use and 7-day easy return policy.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
