import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Sparkles,
  Package,
  Store,
  ShieldCheck,
  ChevronDown,
  X,
  Share2,
  LogIn,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface NavbarProps {
  onSearch: (query: string) => void;
  onOpenAIChat: () => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenOrders: () => void;
  onNavigateHome: () => void;
  onOpenSellerDashboard: () => void;
  onOpenAdminDashboard: () => void;
  onOpenProfile: () => void;
  activeView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSearch,
  onOpenAIChat,
  onOpenCart,
  onOpenWishlist,
  onOpenOrders,
  onNavigateHome,
  onOpenSellerDashboard,
  onOpenAdminDashboard,
  onOpenProfile,
  activeView,
}) => {
  const { user, role, switchRole, login, logout } = useAuth();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();

  const [searchInput, setSearchInput] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    onSearch('');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = loginIdentifier.trim();
    if (!identifier) {
      setLoginError('Enter your phone or email.');
      return;
    }

    setIsSigningIn(true);
    setLoginError('');
    const success = await login(identifier);
    setIsSigningIn(false);
    if (success) {
      setLoginIdentifier('');
      setShowRoleDropdown(false);
    } else {
      setLoginError('Could not sign in. Please try again.');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-rose-100/80 shadow-xs backdrop-blur-md">
      {/* Top Banner: Reselling & Value Promise */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-amber-800 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-amber-950 font-bold px-1.5 py-0.5 rounded-sm text-[10px] uppercase tracking-wider">
              Zero Commission
            </span>
            <span className="hidden sm:inline font-medium text-rose-100">
              Direct from Surat, Jaipur & Varanasi Weavers • Wholesale Prices for Everyone
            </span>
            <span className="sm:hidden font-medium text-rose-100">
              Wholesale Prices • 7 Days Easy Return
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              id="nav-quick-ai-btn"
              onClick={onOpenAIChat}
              className="flex items-center gap-1 text-amber-300 hover:text-amber-200 font-semibold cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Sathi AI</span>
            </button>
            <span className="text-rose-400">|</span>
            <button
              id="nav-track-btn"
              onClick={onOpenOrders}
              className="hover:text-rose-200 cursor-pointer hidden md:inline"
            >
              Track Order
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="brand-logo-btn"
              onClick={onNavigateHome}
              className="text-left group cursor-pointer focus:outline-hidden"
            >
              <div className="flex items-center gap-1.5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-rose-200 group-hover:scale-105 transition-transform">
                  S
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-gray-900">
                      Shopzy<span className="text-rose-600"></span>
                    </span>
                    <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-full hidden sm:inline">
                      साथी
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-medium -mt-1 hidden sm:block">
                    हर भारतवासी का शॉपिंग साथी
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-xl mx-1 sm:mx-4"
          >
            <div className="relative flex items-center">
              <input
                id="main-search-input"
                type="text"
                value={searchInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearchInput(e.target.value);
                  onSearch(e.target.value);
                }}
                placeholder="Search kurtis, sarees, jhumkas, bedsheets, under 500..."
                className="w-full pl-10 pr-10 py-2 sm:py-2.5 text-xs sm:text-sm bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200 focus:border-rose-500 rounded-full focus:outline-hidden focus:ring-2 focus:ring-rose-200/50 transition-all placeholder:text-gray-400"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {/* Actions & Role Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* AI Assistant Button */}
            <button
              id="nav-ai-assistant-btn"
              onClick={onOpenAIChat}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200/80 text-rose-700 hover:from-rose-100 hover:to-amber-100 font-semibold text-xs sm:text-sm transition-all shadow-2xs cursor-pointer group"
            >
              <Sparkles className="w-4 h-4 text-rose-600 animate-pulse group-hover:rotate-12 transition-transform" />
              <span className="hidden md:inline">Sathi AI</span>
              <span className="md:hidden">AI</span>
            </button>

            {/* Wishlist */}
            <button
              id="nav-wishlist-btn"
              onClick={onOpenWishlist}
              className={`relative p-2 rounded-full hover:bg-gray-100 text-gray-700 cursor-pointer transition-colors ${
                activeView === 'wishlist' ? 'text-rose-600 bg-rose-50' : ''
              }`}
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              id="nav-cart-btn"
              onClick={onOpenCart}
              className={`relative p-2 rounded-full hover:bg-gray-100 text-gray-700 cursor-pointer transition-colors ${
                activeView === 'cart' ? 'text-rose-600 bg-rose-50' : ''
              }`}
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Orders (Desktop) */}
            <button
              id="nav-orders-desktop-btn"
              onClick={onOpenOrders}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors ${
                activeView === 'orders' ? 'text-rose-600 bg-rose-50' : ''
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Orders</span>
            </button>

            {/* Role Switcher Pill */}
            <div className="relative">
              <button
                id="nav-user-role-menu-btn"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-700 cursor-pointer transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {user?.name.charAt(0) || 'P'}
                </div>
                <div className="hidden sm:block text-left leading-none">
                  <div className="text-[10px] text-gray-500 capitalize">{role} Mode</div>
                  <div className="font-semibold text-gray-900 text-xs truncate max-w-[80px]">
                    {user?.name.split(' ')[0]}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>

              {showRoleDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-50"
                    onClick={() => setShowRoleDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 text-xs">
                    {user ? (
                      <div className="px-3 py-2 border-b border-gray-100">
                        <p className="font-bold text-gray-900">{user.name}</p>
                        <p className="text-[11px] text-gray-500">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800">
                          Active Role: {role}
                        </span>
                      </div>
                    ) : (
                      <form onSubmit={handleSignIn} className="px-3 py-3 border-b border-gray-100">
                        <p className="font-bold text-gray-900 mb-2">Sign in to Shopzy</p>
                        <input
                          id="nav-sign-in-input"
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          placeholder="Phone or email"
                          className="w-full px-2.5 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:border-rose-500"
                          autoComplete="email"
                        />
                        {loginError && <p className="mt-1.5 text-[11px] text-red-600">{loginError}</p>}
                        <button
                          id="nav-sign-in-btn"
                          type="submit"
                          disabled={isSigningIn}
                          className="mt-2 w-full px-3 py-2 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 disabled:opacity-60"
                        >
                          {isSigningIn ? 'Signing in...' : 'Sign in'}
                        </button>
                      </form>
                    )}

                    {user && <div className="px-2 py-1.5 text-[11px] text-gray-400 uppercase font-bold tracking-wider">Switch Demo Role</div>}

                    {user && <button
                      id="role-switch-customer"
                      onClick={() => {
                        switchRole('customer');
                        setShowRoleDropdown(false);
                        onNavigateHome();
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-rose-50 cursor-pointer ${
                        role === 'customer' ? 'font-bold text-rose-700 bg-rose-50/50' : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-rose-600" />
                        <div>
                          <div>Customer Mode</div>
                          <div className="text-[10px] text-gray-500 font-normal">
                            Shop, Wishlist, Orders & Resell
                          </div>
                        </div>
                      </div>
                      {role === 'customer' && <span className="text-rose-600 font-bold">✓</span>}
                    </button>}

                    {user && <button
                      id="role-switch-seller"
                      onClick={() => {
                        switchRole('seller');
                        setShowRoleDropdown(false);
                        onOpenSellerDashboard();
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-rose-50 cursor-pointer ${
                        role === 'seller' ? 'font-bold text-rose-700 bg-rose-50/50' : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-amber-600" />
                        <div>
                          <div>Seller Dashboard</div>
                          <div className="text-[10px] text-gray-500 font-normal">
                            Inventory, Orders & Wholesale
                          </div>
                        </div>
                      </div>
                      {role === 'seller' && <span className="text-rose-600 font-bold">✓</span>}
                    </button>}

                    {user && <button
                      id="role-switch-admin"
                      onClick={() => {
                        switchRole('admin');
                        setShowRoleDropdown(false);
                        onOpenAdminDashboard();
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-rose-50 cursor-pointer ${
                        role === 'admin' ? 'font-bold text-rose-700 bg-rose-50/50' : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <div>
                          <div>Admin Dashboard</div>
                          <div className="text-[10px] text-gray-500 font-normal">
                            Platform GMV, Orders & Catalog
                          </div>
                        </div>
                      </div>
                      {role === 'admin' && <span className="text-rose-600 font-bold">✓</span>}
                    </button>}

                    <div className="border-t border-gray-100 my-1" />

                    {user ? (
                      <>
                        <button
                          onClick={() => {
                            setShowRoleDropdown(false);
                            onOpenProfile();
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2 cursor-pointer"
                        >
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span>My Profile & Addresses</span>
                        </button>
                        <button
                          id="nav-sign-out-btn"
                          onClick={() => {
                            logout();
                            setShowRoleDropdown(false);
                            onNavigateHome();
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-rose-50 text-gray-700 flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-600" />
                          <span>Sign out</span>
                        </button>
                      </>
                    ) : (
                      <div className="px-3 py-2 text-[11px] text-gray-500 flex items-center gap-2">
                        <LogIn className="w-3.5 h-3.5 text-rose-600" />
                        <span>Sign in to access your profile and orders</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
