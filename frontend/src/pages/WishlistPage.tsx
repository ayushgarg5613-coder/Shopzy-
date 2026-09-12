import React from 'react';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

interface WishlistPageProps {
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigateHome: () => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  allProducts,
  onSelectProduct,
  onNavigateHome,
}) => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const wishlistedProducts = allProducts.filter((p) => wishlist.includes(p.id));

  const handleMoveToCart = async (product: Product) => {
    await addToCart(product.id, 1, product.colors[0], product.sizes[0], 0);
    toggleWishlist(product.id);
  };

  if (wishlistedProducts.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-4">
          <Heart className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Aapki Wishlist Khali Hai</h2>
        <p className="text-xs sm:text-sm text-gray-500 max-w-sm mt-1 mb-6">
          Apne pasandida kurtis, sarees aur jewellery ko wishlist mein save karein taaki baad mein asani se order kar sakein!
        </p>
        <button
          onClick={onNavigateHome}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold text-sm shadow-md cursor-pointer hover:opacity-95"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-24">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
          My Wishlist ({wishlistedProducts.length})
        </h1>
        <p className="text-xs text-gray-500">
          Items you saved for later with real-time price alerts
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {wishlistedProducts.map((product) => (
          <div
            key={product.id}
            className="group bg-white rounded-xl border border-gray-200/90 overflow-hidden shadow-2xs hover:border-rose-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="relative aspect-4/5 bg-gray-100 overflow-hidden">
              <img
                src={product.images[0]}
                alt={product.title}
                referrerPolicy="no-referrer"
                onClick={() => onSelectProduct(product)}
                className="w-full h-full object-cover object-top cursor-pointer group-hover:scale-105 transition-transform duration-300"
              />

              <button
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 text-rose-600 flex items-center justify-center shadow-xs hover:bg-rose-50 cursor-pointer"
                title="Remove from wishlist"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-gray-500 font-medium block truncate">
                  {product.sellerName}
                </span>
                <h3
                  onClick={() => onSelectProduct(product)}
                  className="font-bold text-xs text-gray-900 line-clamp-2 hover:text-rose-600 cursor-pointer mt-0.5"
                >
                  {product.title}
                </h3>
              </div>

              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-extrabold text-gray-900">
                    ₹{product.price}
                  </span>
                  <span className="text-xs text-gray-400 line-through">
                    ₹{product.originalPrice}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700">
                    {product.discountPercent}% off
                  </span>
                </div>

                <button
                  onClick={() => handleMoveToCart(product)}
                  className="mt-2.5 w-full py-1.5 px-2 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Move to Cart</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
