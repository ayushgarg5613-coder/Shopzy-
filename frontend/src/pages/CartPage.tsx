import React, { useState } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  TrendingUp,
  Tag,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Check,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

interface CartPageProps {
  onProceedToCheckout: (couponCode: string) => void;
  onNavigateHome: () => void;
  onSelectProduct: (product: Product) => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  onProceedToCheckout,
  onNavigateHome,
  onSelectProduct,
}) => {
  const {
    items,
    itemCount,
    subtotal,
    resellTotalMargin,
    shippingFee,
    totalAmount,
    updateQuantity,
    updateResellMargin,
    removeFromCart,
    clearCart,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = (code: string) => {
    const cleanCode = code.toUpperCase().trim();
    if (cleanCode === 'SATHI100') {
      if (subtotal < 500) {
        setCouponError('Minimum order amount ₹500 required for SATHI100');
        return;
      }
      setAppliedCoupon('SATHI100');
      setCouponError('');
    } else if (cleanCode === 'PEHLIBAAR') {
      if (subtotal < 300) {
        setCouponError('Minimum order amount ₹300 required for PEHLIBAAR');
        return;
      }
      setAppliedCoupon('PEHLIBAAR');
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code. Try SATHI100 or PEHLIBAAR');
    }
  };

  const couponDiscount =
    appliedCoupon === 'SATHI100' ? 100 : appliedCoupon === 'PEHLIBAAR' ? 50 : 0;
  const finalCalculatedTotal = Math.max(0, totalAmount - couponDiscount);

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Aapka Cart Khali Hai!</h2>
        <p className="text-xs sm:text-sm text-gray-500 max-w-sm mt-1 mb-6">
          Explore thousands of wholesale ethnic wear, jewellery, and home products with free delivery!
        </p>
        <button
          onClick={onNavigateHome}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold text-sm shadow-md cursor-pointer hover:opacity-95 transition-opacity"
        >
          Start Shopping Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
            Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs text-gray-500">
            Wholesale pricing guaranteed with direct manufacturer shipping
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-gray-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-3.5">
          {items.map((item) => {
            const prod = item.product;
            const itemMargin = item.resellMargin || 0;
            const singleCustomerPrice = prod.price + itemMargin;

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200/90 p-3.5 sm:p-4 shadow-2xs hover:border-rose-200 transition-all"
              >
                <div className="flex gap-3 sm:gap-4">
                  {/* Product Image */}
                  <img
                    src={prod.images[0]}
                    alt={prod.title}
                    referrerPolicy="no-referrer"
                    onClick={() => onSelectProduct(prod)}
                    className="w-20 h-24 sm:w-24 sm:h-28 object-cover rounded-lg bg-gray-100 shrink-0 cursor-pointer"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3
                          onClick={() => onSelectProduct(prod)}
                          className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-2 hover:text-rose-600 cursor-pointer"
                        >
                          {prod.title}
                        </h3>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Supplier: {prod.sellerName} ({prod.sellerCity})
                        </p>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Variant details */}
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-600 flex-wrap">
                      {item.selectedSize && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-[11px] font-medium">
                          Size: {item.selectedSize}
                        </span>
                      )}
                      {item.selectedColor && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-[11px] font-medium">
                          Color: {item.selectedColor}
                        </span>
                      )}
                      {prod.freeDelivery && (
                        <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-0.5">
                          <Truck className="w-3 h-3" /> Free Delivery
                        </span>
                      )}
                    </div>

                    {/* Price & Quantity Adjuster */}
                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-extrabold text-gray-950">
                          ₹{prod.price}
                        </span>
                        <span className="text-xs text-gray-400 line-through">
                          ₹{prod.originalPrice}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700">
                          {prod.discountPercent}% OFF
                        </span>
                      </div>

                      {/* Quantity Controller */}
                      <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 hover:bg-gray-100 text-gray-600 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 hover:bg-gray-100 text-gray-600 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reselling Margin Bar Per Item */}
                <div className="mt-3 pt-2.5 border-t border-dashed border-gray-200 bg-amber-50/50 p-2.5 rounded-lg flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-amber-950">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    <span className="font-semibold">Reseller Margin:</span>
                    <span className="text-[11px] text-gray-500">
                      (Target Customer Price: ₹{singleCustomerPrice})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-gray-500 font-medium">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={itemMargin}
                        onChange={(e) => updateResellMargin(item.id, Math.max(0, Number(e.target.value)))}
                        className="w-16 px-2 py-1 bg-white border border-amber-300 rounded text-xs font-bold text-amber-900"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-amber-800">
                      Earn: ₹{itemMargin * item.quantity}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Price Breakdown Sidebar */}
        <div className="space-y-4">
          {/* Coupons Card */}
          <div className="bg-white rounded-xl border border-gray-200/90 p-4 shadow-2xs">
            <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900 uppercase tracking-wider mb-2">
              <Tag className="w-4 h-4 text-rose-600" />
              <span>Coupons & Offers</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter SATHI100 or PEHLIBAAR"
                className="flex-1 px-3 py-2 text-xs uppercase bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-rose-500 font-bold"
              />
              <button
                onClick={() => handleApplyCoupon(couponCode)}
                className="px-3.5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                Apply
              </button>
            </div>

            {couponError && (
              <p className="text-[11px] text-rose-600 font-medium mt-1.5">{couponError}</p>
            )}

            {appliedCoupon && (
              <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800 font-semibold">
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> '{appliedCoupon}' applied (-₹{couponDiscount})
                </span>
                <button
                  onClick={() => {
                    setAppliedCoupon('');
                    setCouponCode('');
                  }}
                  className="text-rose-600 text-[11px] underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Quick Coupon Chips */}
            <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-wrap gap-1.5">
              <button
                onClick={() => handleApplyCoupon('SATHI100')}
                className="text-[11px] bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold px-2 py-1 rounded border border-rose-200 cursor-pointer"
              >
                SATHI100 (₹100 OFF on ₹500+)
              </button>
              <button
                onClick={() => handleApplyCoupon('PEHLIBAAR')}
                className="text-[11px] bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold px-2 py-1 rounded border border-rose-200 cursor-pointer"
              >
                PEHLIBAAR (₹50 OFF on ₹300+)
              </button>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-white rounded-xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-3 border-b border-gray-100">
              Price Details ({itemCount} {itemCount === 1 ? 'Item' : 'Items'})
            </h3>

            <div className="mt-3 space-y-2.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Total Wholesale Price</span>
                <span className="font-semibold text-gray-900">₹{subtotal}</span>
              </div>

              {resellTotalMargin > 0 && (
                <div className="flex justify-between text-amber-800 font-semibold">
                  <span>Reseller Margin (Your Profit)</span>
                  <span>+₹{resellTotalMargin}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Delivery Charges</span>
                <span className="font-semibold">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-bold uppercase">Free Delivery</span>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{couponDiscount}</span>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                <span className="text-sm font-extrabold text-gray-900">Order Total</span>
                <span className="text-xl font-black text-rose-700">₹{finalCalculatedTotal}</span>
              </div>
            </div>

            {/* Reseller Earning Highlight Banner */}
            {resellTotalMargin > 0 && (
              <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-950">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <span>Your Margin on this Order: ₹{resellTotalMargin}</span>
                </div>
                <p className="text-[11px] text-amber-800 mt-1">
                  When your customer accepts the delivery, ₹{resellTotalMargin} will be transferred directly to your registered UPI ID!
                </p>
              </div>
            )}

            {/* Checkout Button */}
            <button
              id="proceed-to-checkout-btn"
              onClick={() => onProceedToCheckout(appliedCoupon)}
              className="mt-5 w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-rose-200 transition-all"
            >
              <span>Continue to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Safe & Secure Payments • Easy 7 Days Return</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
