export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string | null;
  balance: number;
  isAdmin: boolean;
  createdAt: string;
  _count?: {
    library: number;
    orders: number;
    reviews: number;
  };
}

export interface Game {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDesc?: string | null;
  price: number;
  imageUrl?: string | null;
  bannerUrl?: string | null;
  fileUrl?: string | null;
  fileSize?: string | null;
  category: string;
  tags: string[];
  publisher: string;
  developer?: string;
  featured: boolean;
  isActive?: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt?: string;
  isOwned?: boolean;
  isInCart?: boolean;
  isWishlisted?: boolean;
  reviews?: Review[];
}

export interface CartItem {
  userId: string;
  gameId: string;
  addedAt: string;
  game: Pick<Game, 'id' | 'title' | 'slug' | 'price' | 'imageUrl' | 'category'>;
}

export interface Cart {
  items: CartItem[];
  total: number;
  count: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  gameId: string;
  price: number;
  game: Pick<Game, 'id' | 'title' | 'imageUrl' | 'slug'>;
}

export interface Order {
  id: string;
  userId: string;
  total: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  createdAt: string;
  items: OrderItem[];
}

export interface LibraryItem {
  userId: string;
  gameId: string;
  addedAt: string;
  game: Pick<Game, 'id' | 'title' | 'slug' | 'imageUrl' | 'category' | 'fileUrl' | 'fileSize' | 'publisher'>;
}

export interface Review {
  id: string;
  userId: string;
  gameId: string;
  rating: number;
  comment: string;
  helpful: number;
  createdAt: string;
  user: Pick<User, 'id' | 'username' | 'avatar'>;
}

export interface ReviewsData {
  reviews: Review[];
  avgRating: number;
  total: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
}

export interface SalesData {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalGames: number;
  recentOrders: Order[];
  topGames: Array<{ gameId: string; _count: { gameId: number }; _sum: { price: number }; game: { title: string; imageUrl: string } }>;
}

export interface GameFilters {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  featured?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}
