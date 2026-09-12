import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ShoppingBag,
  TrendingUp,
  Tag,
  Truck,
  ArrowRight,
  Filter as FilterIcon,
  Search,
} from 'lucide-react';
import { Product, Category, FilterState } from '../types';
import { ProductCard } from '../components/ProductCard';
import { FilterSidebar } from '../components/FilterSidebar';

interface HomePageProps {
  products: Product[];
  categories: Category[];
  filters: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  onResetFilters: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenAIChat: (initialPrompt?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  categories,
  filters,
  onFilterChange,
  onResetFilters,
  onSelectProduct,
  onOpenAIChat,
}) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Quick category selection
  const handleCategoryClick = (catName: string) => {
    if (filters.category === catName) {
      onFilterChange({ category: 'all' });
    } else {
      onFilterChange({ category: catName });
    }
  };

  const activeCategoryTitle = filters.category === 'all' ? 'All Products' : filters.category;

  return (
    <div className="min-h-screen pb-20">
      {/* Category Pills Bar (Top Scroller) */}
      <div className="bg-white border-b border-gray-200/80 sticky top-16 sm:top-18 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 overflow-x-auto no-scrollbar flex items-center gap-2 sm:gap-3">
          <button
            id="cat-pill-all"
            onClick={() => onFilterChange({ category: 'all' })}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
              filters.category === 'all'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              id={`cat-pill-${cat.slug}`}
              onClick={() => handleCategoryClick(cat.name)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                filters.category === cat.name
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-[10px] opacity-75 hidden sm:inline">({cat.nameHindi})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Festive / Social Commerce Hero Banner */}
        <div className="relative rounded-2xl bg-gradient-to-r from-rose-900 via-rose-800 to-amber-800 p-5 sm:p-8 text-white overflow-hidden shadow-lg mb-6 sm:mb-8">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-amber-950 font-black text-[11px] uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Shopzy Mahabachat • Direct from Weavers</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Lowest Wholesale Prices. <br className="hidden sm:inline" />
              <span className="text-amber-300">Resell & Earn from Home.</span>
            </h1>
            <p className="text-rose-100 text-xs sm:text-sm mt-2 sm:mt-3 leading-relaxed">
              Zero commission marketplace directly connecting artisans & manufacturers of Surat, Jaipur & Varanasi with customers across India.
            </p>

            <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-3">
              <button
                id="hero-ask-ai-btn"
                onClick={() => onOpenAIChat('Mujhe wedding ke liye kurti chahiye under 800')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ask Sathi AI to Shop</span>
              </button>
              <button
                onClick={() => onFilterChange({ minPrice: 0, maxPrice: 499 })}
                className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold text-xs sm:text-sm cursor-pointer transition-all"
              >
                Under ₹499 Deals
              </button>
            </div>
          </div>

          {/* Decorative Badge */}
          <div className="hidden lg:flex flex-col items-center justify-center absolute right-8 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-4 border-amber-300/30 bg-white/10 backdrop-blur-md p-4 text-center">
            <span className="text-xs text-amber-200 uppercase font-bold tracking-widest">
              Zero Commission
            </span>
            <span className="text-3xl font-black text-amber-300 my-1">₹0</span>
            <span className="text-[11px] text-rose-100 font-medium">
              Direct Weaver Pricing + Free COD Delivery
            </span>
          </div>
        </div>

        {/* Popular Category Cards Showcase */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Explore Categories
              </h2>
              <p className="text-xs text-gray-500">
                Top picks direct from India's biggest manufacturing hubs
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => onFilterChange({ category: cat.name })}
                className="group bg-white rounded-xl border border-gray-200/80 p-2.5 text-center cursor-pointer hover:border-rose-300 hover:shadow-xs transition-all flex flex-col items-center"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden mb-2 bg-gray-100 border border-gray-100 group-hover:scale-105 transition-transform">
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-xs font-bold text-gray-800 line-clamp-1 group-hover:text-rose-600">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-gray-400 mt-0.5">{cat.nameHindi}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Layout: Sidebar + Product Grid */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <FilterSidebar
              filters={filters}
              onChange={onFilterChange}
              onReset={onResetFilters}
              categories={categories}
            />
          </aside>

          {/* Mobile Filter Button */}
          <div className="lg:hidden flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200">
            <div>
              <span className="font-bold text-xs text-gray-800">{activeCategoryTitle}</span>
              <span className="text-xs text-gray-400 ml-1">({products.length} items)</span>
            </div>
            <button
              onClick={() => setShowMobileFilters(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-xs rounded-lg cursor-pointer"
            >
              <FilterIcon className="w-3.5 h-3.5" />
              <span>Filters & Sort</span>
            </button>
          </div>

          {/* Product Grid Area */}
          <main className="flex-1">
            {/* Header / Counter & Sort */}
            <div className="hidden sm:flex items-center justify-between mb-4 pb-2 border-b border-gray-200/80">
              <div>
                <h2 className="font-extrabold text-gray-900 text-lg sm:text-xl">
                  {activeCategoryTitle}
                </h2>
                <p className="text-xs text-gray-500">
                  Showing {products.length} wholesale priced items with Free Delivery & COD
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 font-medium">Sort by:</span>
                <select
                  value={filters.sortBy}
                  onChange={(e) => onFilterChange({ sortBy: e.target.value as FilterState['sortBy'] })}
                  className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 font-semibold text-gray-800 focus:outline-hidden focus:border-rose-500 cursor-pointer"
                >
                  <option value="popularity">Popularity</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">New Arrivals</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={onSelectProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 text-center my-6">
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-gray-900">
                  No products match your current filters
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mt-1 mb-5">
                  Aap filters reset kar sakte hain ya humari smart Sathi AI se pooch sakte hain!
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={onResetFilters}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                  <button
                    onClick={() => onOpenAIChat(filters.searchQuery || 'Show me trending sarees and kurtis under 800')}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask Sathi AI</span>
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xs bg-white h-full p-4 overflow-y-auto">
            <FilterSidebar
              filters={filters}
              onChange={onFilterChange}
              onReset={onResetFilters}
              categories={categories}
              isMobileDrawer
              onCloseMobile={() => setShowMobileFilters(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
