import React from 'react';
import { Heart, Star, ShoppingBag, Truck, Share2 } from 'lucide-react';
import { Product } from '../types';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onResellClick?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onResellClick,
}) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart, lastAddedItem } = useCart();
  const wishlisted = isWishlisted(product.id);
  const isJustAdded = lastAddedItem === product.id;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await addToCart(product.id, 1, product.colors[0], product.sizes[0], 0);
  };

  const estimatedResellProfit = Math.round(product.price * 0.25);

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onSelect(product)}
      className="group bg-white rounded-xl border border-gray-200/90 hover:border-rose-300 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer relative"
    >
      {/* Image Container */}
      <div className="relative aspect-4/5 w-full bg-gray-100 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Wishlist Button */}
        <button
          id={`wishlist-btn-${product.id}`}
          onClick={handleWishlistClick}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer ${
            wishlisted
              ? 'bg-rose-50 text-rose-600 shadow-sm'
              : 'bg-white/80 text-gray-600 hover:bg-white hover:text-rose-600'
          }`}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4.5 h-4.5 ${wishlisted ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Free Delivery Tag */}
        {product.freeDelivery && (
          <div className="absolute top-2.5 left-2.5 bg-emerald-700/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs">
            <Truck className="w-3 h-3" />
            <span>Free Delivery</span>
          </div>
        )}

        {/* Resell Margin Incentive Badge */}
        <div className="absolute bottom-2 left-2 bg-amber-900/85 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
          Earn ₹{estimatedResellProfit}+ margin
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Seller / City */}
          <div className="text-[11px] text-gray-500 font-medium truncate mb-1">
            {product.sellerName} • {product.sellerCity}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-xs sm:text-sm text-gray-900 line-clamp-2 leading-snug group-hover:text-rose-700 transition-colors">
            {product.title}
          </h3>

          {/* Hindi Title if available */}
          {product.titleHindi && (
            <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5 font-normal">
              {product.titleHindi}
            </p>
          )}
        </div>

        <div className="mt-2.5 pt-2 border-t border-gray-100">
          {/* Price Row */}
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base sm:text-lg font-extrabold text-gray-950">
              ₹{product.price}
            </span>
            <span className="text-xs text-gray-400 line-through">
              ₹{product.originalPrice}
            </span>
            <span className="text-[11px] font-bold text-emerald-700">
              {product.discountPercent}% off
            </span>
          </div>

          {/* Rating & Action Row */}
          <div className="mt-2 flex items-center justify-between gap-1">
            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 text-xs font-bold px-1.5 py-0.5 rounded-md">
              <span>{product.rating}</span>
              <Star className="w-3 h-3 fill-emerald-700 text-emerald-700" />
              <span className="text-gray-400 font-normal text-[10px]">
                ({product.ratingCount})
              </span>
            </div>

            <button
              id={`quick-add-${product.id}`}
              onClick={handleQuickAdd}
              className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                isJustAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isJustAdded ? 'Added' : 'Add'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
