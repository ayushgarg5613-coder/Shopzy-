export type UserRole = 'customer' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  businessName?: string;
  city?: string;
  state?: string;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
  type: 'home' | 'work' | 'reseller_customer';
}

export interface Category {
  id: string;
  name: string;
  nameHindi: string;
  slug: string;
  icon: string;
  imageUrl: string;
  description?: string;
}

export interface ProductReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  customerCity?: string;
}

export interface Product {
  id: string;
  title: string;
  titleHindi?: string;
  description: string;
  category: string;
  subCategory?: string;
  price: number; // Wholesale selling price in INR
  originalPrice: number; // MRP for discount calculation
  discountPercent: number;
  rating: number;
  ratingCount: number;
  reviewCount: number;
  images: string[];
  stock: number;
  sellerId: string;
  sellerName: string;
  sellerCity: string;
  freeDelivery: boolean;
  colors: string[];
  sizes: string[];
  fabric?: string;
  returnDays: number;
  codAvailable: boolean;
  tags: string[];
  isFeatured?: boolean;
  isTrending?: boolean;
  reviews?: ProductReview[];
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  resellMargin: number; // Additional margin for social reselling (per item)
}

export interface OrderTimelineEvent {
  status: 'ordered' | 'packed' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled';
  title: string;
  description: string;
  timestamp: string;
  location?: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  image: string;
  price: number;
  resellMargin: number;
  finalCustomerPrice: number;
  quantity: number;
  color?: string;
  size?: string;
  sellerName: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  userPhone: string;
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: 'COD' | 'UPI' | 'NET_BANKING' | 'CARD';
  paymentStatus: 'pending' | 'completed';
  subtotal: number;
  discount: number;
  shippingFee: number;
  resellTotalMargin: number;
  totalAmount: number;
  status: 'ordered' | 'packed' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled';
  createdAt: string;
  estimatedDelivery: string;
  courierPartner: string;
  trackingNumber: string;
  timeline: OrderTimelineEvent[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  recommendedProducts?: Product[];
  actionTaken?: {
    type: 'ADD_TO_CART' | 'VIEW_ORDER' | 'APPLY_FILTER';
    data?: any;
    message?: string;
  };
}

export interface FilterState {
  searchQuery: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  sortBy: 'popularity' | 'price_low' | 'price_high' | 'rating' | 'newest';
  onlyFreeDelivery: boolean;
  onlyCod: boolean;
  selectedFabric?: string;
  selectedColor?: string;
}
