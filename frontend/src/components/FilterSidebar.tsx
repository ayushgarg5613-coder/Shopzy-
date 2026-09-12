import React from 'react';
import { Filter, RotateCcw, Check, Star } from 'lucide-react';
import { FilterState, Category } from '../types';

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (updated: Partial<FilterState>) => void;
  onReset: () => void;
  categories: Category[];
  isMobileDrawer?: boolean;
  onCloseMobile?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onChange,
  onReset,
  categories,
  isMobileDrawer = false,
  onCloseMobile,
}) => {
  const priceRanges = [
    { label: 'All Prices', min: 0, max: 10000 },
    { label: 'Under ₹300', min: 0, max: 300 },
    { label: 'Under ₹500', min: 0, max: 500 },
    { label: 'Under ₹800', min: 0, max: 800 },
    { label: 'Under ₹1,200', min: 0, max: 1200 },
  ];

  const fabrics = ['Cotton', 'Silk', 'Georgette', 'Rayon'];
  const colors = ['Black', 'Maroon', 'Blue', 'Yellow', 'Silver', 'Green'];

  return (
    <div className="bg-white rounded-xl border border-gray-200/90 p-4 space-y-5 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-1.5 font-bold text-sm text-gray-900">
          <Filter className="w-4 h-4 text-rose-600" />
          <span>Filters & Sort</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
          Sort By
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => onChange({ sortBy: e.target.value as FilterState['sortBy'] })}
          className="w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg p-2 focus:bg-white focus:outline-hidden focus:border-rose-500 cursor-pointer"
        >
          <option value="popularity">Popularity (Rating & Orders)</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="rating">Customer Rating (4★+)</option>
          <option value="newest">New Arrivals</option>
        </select>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
          Category
        </label>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => onChange({ category: 'all' })}
            className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md font-medium cursor-pointer transition-colors ${
              filters.category === 'all'
                ? 'bg-rose-50 text-rose-700 font-bold'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onChange({ category: cat.name })}
              className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md font-medium cursor-pointer transition-colors ${
                filters.category === cat.name
                  ? 'bg-rose-50 text-rose-700 font-bold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat.name} <span className="text-[10px] text-gray-400">({cat.nameHindi})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Presets */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
          Budget / Price
        </label>
        <div className="flex flex-wrap gap-1.5">
          {priceRanges.map((range, i) => (
            <button
              key={i}
              onClick={() => onChange({ minPrice: range.min, maxPrice: range.max })}
              className={`text-xs px-2.5 py-1 rounded-md font-medium border cursor-pointer transition-colors ${
                filters.maxPrice === range.max
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Rating */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
          Min Rating
        </label>
        <div className="flex items-center gap-1.5">
          {[0, 3, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => onChange({ minRating: r })}
              className={`flex-1 text-xs py-1 px-1.5 rounded-md font-bold border flex items-center justify-center gap-0.5 cursor-pointer transition-colors ${
                filters.minRating === r
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span>{r === 0 ? 'Any' : `${r}★`}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Toggles: Free Delivery & COD */}
      <div className="pt-2 border-t border-gray-100 space-y-2">
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.onlyFreeDelivery}
            onChange={(e) => onChange({ onlyFreeDelivery: e.target.checked })}
            className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
          />
          <span>Free Delivery Only</span>
        </label>

        <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.onlyCod}
            onChange={(e) => onChange({ onlyCod: e.target.checked })}
            className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
          />
          <span>Cash on Delivery (COD)</span>
        </label>
      </div>

      {/* Fabric */}
      <div className="pt-2 border-t border-gray-100">
        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
          Fabric
        </label>
        <div className="flex flex-wrap gap-1.5">
          {fabrics.map((fab) => (
            <button
              key={fab}
              onClick={() =>
                onChange({ selectedFabric: filters.selectedFabric === fab ? undefined : fab })
              }
              className={`text-xs px-2.5 py-1 rounded-md border cursor-pointer transition-colors ${
                filters.selectedFabric === fab
                  ? 'bg-rose-50 border-rose-600 text-rose-700 font-bold'
                  : 'bg-white border-gray-200 text-gray-600'
              }`}
            >
              {fab}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="pt-2 border-t border-gray-100">
        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
          Color
        </label>
        <div className="flex flex-wrap gap-1.5">
          {colors.map((col) => (
            <button
              key={col}
              onClick={() =>
                onChange({ selectedColor: filters.selectedColor === col ? undefined : col })
              }
              className={`text-xs px-2.5 py-1 rounded-md border cursor-pointer transition-colors ${
                filters.selectedColor === col
                  ? 'bg-rose-50 border-rose-600 text-rose-700 font-bold'
                  : 'bg-white border-gray-200 text-gray-600'
              }`}
            >
              {col}
            </button>
          ))}
        </div>
      </div>

      {isMobileDrawer && (
        <button
          onClick={onCloseMobile}
          className="w-full py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
        >
          Apply Filters
        </button>
      )}
    </div>
  );
};
