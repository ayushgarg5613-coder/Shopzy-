import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product, Category, FilterState, Order } from './types';
import { api } from './services/api';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import { Navbar } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { ProductModal } from './components/ProductModal';
import { AIChatDrawer } from './components/AIChatDrawer';

import { HomePage } from './pages/HomePage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { WishlistPage } from './pages/WishlistPage';
import { SellerDashboard } from './pages/SellerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProfilePage } from './pages/ProfilePage';

const initialFilters: FilterState = {
  category: 'all',
  minPrice: 0,
  maxPrice: 10000,
  minRating: 0,
  onlyFreeDelivery: false,
  onlyCod: false,
  sortBy: 'popularity',
  searchQuery: '',
};

const MainApp: React.FC = () => {
  const { role } = useAuth();

  const [activeView, setActiveView] = useState<
    'home' | 'cart' | 'checkout' | 'orders' | 'wishlist' | 'seller' | 'admin' | 'profile' | 'categories'
  >('home');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>(undefined);
  const [appliedCoupon, setAppliedCoupon] = useState<string>('');
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [showOrderPlacedModal, setShowOrderPlacedModal] = useState(false);

  // Load products and categories from backend
  const loadCatalog = async (currentFilters: FilterState) => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.getProducts({
          category: currentFilters.category !== 'all' ? currentFilters.category : undefined,
          minPrice: currentFilters.minPrice || undefined,
          maxPrice: currentFilters.maxPrice !== 10000 ? currentFilters.maxPrice : undefined,
          minRating: currentFilters.minRating || undefined,
          onlyFreeDelivery: currentFilters.onlyFreeDelivery || undefined,
          onlyCod: currentFilters.onlyCod || undefined,
          search: currentFilters.searchQuery || undefined,
          sortBy: currentFilters.sortBy,
          fabric: currentFilters.selectedFabric,
          color: currentFilters.selectedColor,
        }),
        api.getCategories(),
      ]);

      if (prodRes.success && prodRes.products) {
        setProducts(prodRes.products);
      }
      if (catRes.success && catRes.categories) {
        setCategories(catRes.categories);
      }
    } catch (err) {
      console.error('Failed to load catalog data:', err);
    }
  };

  useEffect(() => {
    loadCatalog(filters);
  }, [filters]);

  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  const handleSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
    setActiveView('home');
  };

  const handleOpenAIChat = (prompt?: string) => {
    setAiInitialPrompt(prompt);
    setIsAIChatOpen(true);
  };

  const handleProceedToCheckout = (coupon: string) => {
    setAppliedCoupon(coupon);
    setActiveView('checkout');
  };

  const handleOrderPlaced = (order: Order) => {
    setLatestOrder(order);
    setShowOrderPlacedModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col selection:bg-rose-100 selection:text-rose-900 font-sans">
      {/* Navbar */}
      <Navbar
        onSearch={handleSearch}
        onOpenAIChat={() => handleOpenAIChat()}
        onOpenCart={() => setActiveView('cart')}
        onOpenWishlist={() => setActiveView('wishlist')}
        onOpenOrders={() => setActiveView('orders')}
        onNavigateHome={() => {
          setActiveView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSellerDashboard={() => setActiveView('seller')}
        onOpenAdminDashboard={() => setActiveView('admin')}
        onOpenProfile={() => setActiveView('profile')}
        activeView={activeView}
      />

      {/* Main View Switcher */}
      <div className="flex-1">
        {activeView === 'home' && (
          <HomePage
            products={products}
            categories={categories}
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onOpenAIChat={handleOpenAIChat}
          />
        )}

        {activeView === 'categories' && (
          <HomePage
            products={products}
            categories={categories}
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onOpenAIChat={handleOpenAIChat}
          />
        )}

        {activeView === 'cart' && (
          <CartPage
            onProceedToCheckout={handleProceedToCheckout}
            onNavigateHome={() => setActiveView('home')}
            onSelectProduct={(p) => setSelectedProduct(p)}
          />
        )}

        {activeView === 'checkout' && (
          <CheckoutPage
            appliedCoupon={appliedCoupon}
            onOrderPlaced={handleOrderPlaced}
            onBackToCart={() => setActiveView('cart')}
          />
        )}

        {activeView === 'orders' && (
          <OrdersPage
            onOpenAIChat={(prompt) => handleOpenAIChat(prompt)}
            onNavigateHome={() => setActiveView('home')}
            selectedOrderId={latestOrder?.id}
          />
        )}

        {activeView === 'wishlist' && (
          <WishlistPage
            allProducts={products}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onNavigateHome={() => setActiveView('home')}
          />
        )}

        {activeView === 'seller' && <SellerDashboard />}

        {activeView === 'admin' && <AdminDashboard />}

        {activeView === 'profile' && (
          <ProfilePage
            onOpenOrders={() => setActiveView('orders')}
            onOpenSellerDashboard={() => setActiveView('seller')}
            onOpenAdminDashboard={() => setActiveView('admin')}
          />
        )}
      </div>

      {/* Floating Sathi AI Quick Button (Always Accessible) */}
      <div className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-40">
        <button
          id="floating-ai-button"
          onClick={() => handleOpenAIChat()}
          className="group relative flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-rose-900/25 hover:shadow-2xl transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <span className="hidden sm:inline">Ask Sathi AI</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold">
            Live
          </span>
        </button>
      </div>

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAskAI={(prompt, p) => handleOpenAIChat(prompt)}
        onGoToCart={() => setActiveView('cart')}
      />

      {/* AI Assistant Chat Drawer */}
      <AIChatDrawer
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        onSelectProduct={(p) => {
          setIsAIChatOpen(false);
          setSelectedProduct(p);
        }}
        currentProduct={selectedProduct}
        onViewOrders={() => {
          setIsAIChatOpen(false);
          setActiveView('orders');
        }}
        initialPrompt={aiInitialPrompt}
      />

      {/* Celebratory Order Placed Modal */}
      {showOrderPlacedModal && latestOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border border-gray-100 relative">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              Order Placed Successfully!
            </span>

            <h2 className="text-2xl font-black text-gray-900 mt-3">
              Badhai Ho! Aapka Order Confirm Ho Gaya Hai 🎉
            </h2>

            <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
              Order <strong>#{latestOrder.orderNumber}</strong> has been received by verified manufacturer {latestOrder.items[0]?.sellerName}.
            </p>

            <div className="my-5 p-4 bg-gray-50 rounded-2xl text-left text-xs space-y-2 border border-gray-100">
              <div className="flex justify-between text-gray-600">
                <span>Total Amount to Pay:</span>
                <span className="font-extrabold text-gray-950">₹{latestOrder.totalAmount}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Payment Mode:</span>
                <span className="font-bold text-gray-900">{latestOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Est Delivery:</span>
                <span className="font-bold text-emerald-700">{latestOrder.estimatedDelivery}</span>
              </div>
              {latestOrder.resellTotalMargin > 0 && (
                <div className="pt-2 border-t border-gray-200 flex justify-between text-amber-900 font-bold">
                  <span>Your Reseller Margin:</span>
                  <span>₹{latestOrder.resellTotalMargin}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setShowOrderPlacedModal(false);
                  setActiveView('orders');
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold text-sm shadow-md cursor-pointer hover:opacity-95"
              >
                Track Live Order Timeline
              </button>
              <button
                onClick={() => {
                  setShowOrderPlacedModal(false);
                  setActiveView('home');
                }}
                className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-900 font-semibold cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      <MobileNav
        activeView={activeView}
        onNavigateHome={() => setActiveView('home')}
        onOpenCategories={() => setActiveView('categories')}
        onOpenAIChat={() => handleOpenAIChat()}
        onOpenOrders={() => setActiveView('orders')}
        onOpenProfile={() => setActiveView('profile')}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-4 text-center text-xs text-gray-500 mb-14 sm:mb-0">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="flex items-center justify-center gap-1.5 font-bold text-gray-800">
            <span>Shopzy</span>
            <span className="text-rose-600">•</span>
            <span>हर भारतवासी का शॉपिंग साथी</span>
          </div>
          <p className="max-w-md mx-auto text-gray-400 text-[11px]">
            Social Commerce Marketplace • 0% Commission Wholesale Sourcing • Resell on WhatsApp & Instagram with custom profit margins
          </p>
          <div className="pt-2 text-[11px] text-gray-400">
            Powered by Google Gemini AI & Express + Vite
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <MainApp />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
