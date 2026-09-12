import React, { useState } from 'react';
import {
  X,
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Heart,
  Share2,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Product } from '../types';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAskAI: (prompt: string, product: Product) => void;
  onGoToCart: () => void;
  onSelectSimilarProduct?: (prod: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAskAI,
  onGoToCart,
  onSelectSimilarProduct,
}) => {
  if (!product) return null;

  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || '');
  const [resellMargin, setResellMargin] = useState(0);
  const [isReselling, setIsReselling] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = async (goToCartAfter = false) => {
    await addToCart(
      product.id,
      1,
      selectedColor,
      selectedSize,
      isReselling ? resellMargin : 0
    );
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
    if (goToCartAfter) {
      onClose();
      onGoToCart();
    }
  };

  const finalCustomerPrice = product.price + (isReselling ? resellMargin : 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-6 border border-gray-100 flex flex-col md:flex-row max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Image Gallery */}
        <div className="w-full md:w-1/2 p-4 sm:p-6 bg-gray-50 flex flex-col justify-between overflow-y-auto">
          <div className="relative aspect-4/5 rounded-xl overflow-hidden bg-white border border-gray-200">
            <img
              src={product.images[selectedImage] || product.images[0]}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
            />

            {/* Free Delivery Tag */}
            {product.freeDelivery && (
              <span className="absolute top-3 left-3 bg-emerald-700 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Truck className="w-3.5 h-3.5" /> Free Delivery
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-14 h-16 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer ${
                    selectedImage === idx ? 'border-rose-600 shadow-xs' : 'border-gray-200 opacity-70'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Ask Sathi AI Shortcut */}
          <div className="mt-4 p-3 bg-gradient-to-r from-rose-50 to-amber-50 rounded-xl border border-rose-200/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-bold text-gray-900">Sathi AI Shopper Help</span>
              </div>
              <span className="text-[10px] text-rose-700 bg-rose-100 font-semibold px-1.5 py-0.5 rounded-full">
                Instant
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                onClick={() => {
                  onClose();
                  onAskAI(`Show me something similar to "${product.title}" but cheaper`, product);
                }}
                className="text-[11px] bg-white hover:bg-rose-50 text-rose-800 font-medium px-2 py-1 rounded-md border border-rose-200 cursor-pointer"
              >
                Similar but cheaper?
              </button>
              <button
                onClick={() => {
                  onClose();
                  onAskAI(`Is this "${product.title}" worth buying? Compare with others`, product);
                }}
                className="text-[11px] bg-white hover:bg-rose-50 text-rose-800 font-medium px-2 py-1 rounded-md border border-rose-200 cursor-pointer"
              >
                Which one is better?
              </button>
            </div>
          </div>
        </div>

        {/* Right: Details & Buying Flow */}
        <div className="w-full md:w-1/2 p-5 sm:p-6 overflow-y-auto flex flex-col justify-between">
          <div>
            {/* Seller & Verification */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <div className="flex items-center gap-1 font-semibold text-rose-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Wholesale Supplier: {product.sellerName}</span>
              </div>
              <span>{product.sellerCity}</span>
            </div>

            {/* Title */}
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
              {product.title}
            </h2>
            {product.titleHindi && (
              <p className="text-xs text-gray-500 mt-0.5">{product.titleHindi}</p>
            )}

            {/* Rating Bar */}
            <div className="flex items-center gap-2 mt-2.5">
              <div className="flex items-center gap-1 bg-emerald-700 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                <span>{product.rating}</span>
                <Star className="w-3 h-3 fill-white" />
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {product.ratingCount} Ratings & {product.reviewCount} Reviews
              </span>
            </div>

            {/* Pricing Details */}
            <div className="mt-3 p-3 bg-rose-50/50 rounded-xl border border-rose-100 flex items-baseline justify-between">
              <div>
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Wholesale Direct Price
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-black text-gray-900">
                    ₹{product.price}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    ₹{product.originalPrice}
                  </span>
                  <span className="text-xs font-bold text-emerald-700">
                    {product.discountPercent}% OFF
                  </span>
                </div>
              </div>
              <div className="text-right text-[11px] text-gray-500">
                <span className="text-emerald-700 font-bold block">In Stock ({product.stock})</span>
                <span>Includes all taxes</span>
              </div>
            </div>

            {/* Color Selection */}
            {product.colors.length > 0 && (
              <div className="mt-4">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Select Color: <span className="font-normal text-rose-700">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer transition-all ${
                        selectedColor === c
                          ? 'border-rose-600 bg-rose-50 text-rose-800 ring-2 ring-rose-200'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes.length > 0 && (
              <div className="mt-4">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Select Size: <span className="font-normal text-rose-700">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer transition-all ${
                        selectedSize === s
                          ? 'border-rose-600 bg-rose-50 text-rose-800 ring-2 ring-rose-200'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reselling Margin Feature (Social Commerce) */}
            <div className="mt-4 p-3.5 bg-amber-50/70 border border-amber-200/90 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-bold text-amber-950">
                    Social Reseller Mode (WhatsApp / Instagram)
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isReselling}
                    onChange={(e) => {
                      setIsReselling(e.target.checked);
                      if (e.target.checked && resellMargin === 0) setResellMargin(150);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {isReselling && (
                <div className="mt-2.5 pt-2 border-t border-amber-200/60 text-xs">
                  <p className="text-amber-900 text-[11px] mb-1.5">
                    Add your margin. Your customer will see total <strong>₹{finalCustomerPrice}</strong> on their invoice, and your profit <strong>₹{resellMargin}</strong> will be deposited to your UPI/bank upon delivery!
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">Add Margin:</span>
                    {[100, 150, 200, 300].map((m) => (
                      <button
                        key={m}
                        onClick={() => setResellMargin(m)}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold cursor-pointer transition-all ${
                          resellMargin === m
                            ? 'bg-amber-600 text-white'
                            : 'bg-white text-amber-800 border border-amber-300'
                        }`}
                      >
                        +₹{m}
                      </button>
                    ))}
                    <div className="flex items-center gap-1 ml-auto">
                      <span className="text-gray-500">₹</span>
                      <input
                        type="number"
                        value={resellMargin}
                        onChange={(e) => setResellMargin(Math.max(0, Number(e.target.value)))}
                        className="w-16 px-1.5 py-1 text-xs border border-gray-300 rounded bg-white font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Guarantees */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] text-gray-600 border-y border-gray-100 py-2.5">
              <div className="flex flex-col items-center">
                <Truck className="w-4 h-4 text-rose-600 mb-0.5" />
                <span>Free Delivery</span>
              </div>
              <div className="flex flex-col items-center">
                <RotateCcw className="w-4 h-4 text-rose-600 mb-0.5" />
                <span>7 Days Return</span>
              </div>
              <div className="flex flex-col items-center">
                <ShieldCheck className="w-4 h-4 text-rose-600 mb-0.5" />
                <span>COD Available</span>
              </div>
            </div>

            {/* Description */}
            <div className="mt-3 text-xs text-gray-600 leading-relaxed">
              <span className="font-bold text-gray-900 block mb-0.5">Product Description:</span>
              <p>{product.description}</p>
              {product.fabric && (
                <p className="mt-1">
                  <strong>Fabric:</strong> {product.fabric}
                </p>
              )}
            </div>

            {/* Reviews Sample */}
            {product.reviews && product.reviews.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <span className="font-bold text-xs text-gray-900 block mb-2">
                  Customer Reviews ({product.reviews.length})
                </span>
                <div className="space-y-2">
                  {product.reviews.slice(0, 2).map((rev) => (
                    <div key={rev.id} className="p-2.5 bg-gray-50 rounded-lg text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-800">{rev.userName}</span>
                        <div className="flex items-center text-amber-500 text-[10px] font-bold">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-[11px]">{rev.comment}</p>
                      {rev.customerCity && (
                        <span className="text-[10px] text-emerald-700 block mt-1">
                          ✓ Verified Purchase from {rev.customerCity}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons Sticky Footer */}
          <div className="mt-5 pt-3 border-t border-gray-100 flex items-center gap-2">
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                wishlisted ? 'border-rose-300 bg-rose-50 text-rose-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-600' : ''}`} />
            </button>

            <button
              id="modal-add-to-cart-btn"
              onClick={() => handleAddToCart(false)}
              className="flex-1 py-3 px-4 rounded-xl border border-rose-600 text-rose-700 hover:bg-rose-50 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{addedToast ? 'Added to Cart ✓' : 'Add to Cart'}</span>
            </button>

            <button
              id="modal-buy-now-btn"
              onClick={() => handleAddToCart(true)}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md shadow-rose-200"
            >
              <span>Buy Now (₹{finalCustomerPrice})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
