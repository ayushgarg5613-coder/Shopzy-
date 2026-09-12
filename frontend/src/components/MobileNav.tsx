import React from 'react';
import { Home, Grid, Sparkles, Package, User } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface MobileNavProps {
  activeView: string;
  onNavigateHome: () => void;
  onOpenCategories: () => void;
  onOpenAIChat: () => void;
  onOpenOrders: () => void;
  onOpenProfile: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeView,
  onNavigateHome,
  onOpenCategories,
  onOpenAIChat,
  onOpenOrders,
  onOpenProfile,
}) => {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 py-1.5 px-2 flex justify-around items-center shadow-lg">
      <button
        id="mobile-nav-home"
        onClick={onNavigateHome}
        className={`flex flex-col items-center justify-center p-1 w-14 cursor-pointer transition-colors ${
          activeView === 'home' ? 'text-rose-600 font-bold' : 'text-gray-500'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Home</span>
      </button>

      <button
        id="mobile-nav-categories"
        onClick={onOpenCategories}
        className={`flex flex-col items-center justify-center p-1 w-14 cursor-pointer transition-colors ${
          activeView === 'categories' ? 'text-rose-600 font-bold' : 'text-gray-500'
        }`}
      >
        <Grid className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Categories</span>
      </button>

      <button
        id="mobile-nav-ai"
        onClick={onOpenAIChat}
        className="flex flex-col items-center justify-center -mt-4 cursor-pointer group"
      >
        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-300 group-hover:scale-110 transition-transform">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <span className="text-[10px] font-bold text-rose-700 mt-0.5">Sathi AI</span>
      </button>

      <button
        id="mobile-nav-orders"
        onClick={onOpenOrders}
        className={`flex flex-col items-center justify-center p-1 w-14 cursor-pointer transition-colors ${
          activeView === 'orders' ? 'text-rose-600 font-bold' : 'text-gray-500'
        }`}
      >
        <Package className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Orders</span>
      </button>

      <button
        id="mobile-nav-profile"
        onClick={onOpenProfile}
        className={`flex flex-col items-center justify-center p-1 w-14 cursor-pointer transition-colors ${
          activeView === 'profile' || activeView === 'seller' || activeView === 'admin'
            ? 'text-rose-600 font-bold'
            : 'text-gray-500'
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Account</span>
      </button>
    </nav>
  );
};
