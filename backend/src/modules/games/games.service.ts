import prisma from '../../config/database';
import { parsePagination } from '../../utils/helpers';

interface GameFilters {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  featured?: string;
  sortBy?: string;
  page?: string;
  limit?: string;
}

export const getGames = async (filters: GameFilters) => {
  const { page, limit, skip } = parsePagination(filters as Record<string, string | undefined>);

  const where: Record<string, unknown> = { isActive: true };

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { publisher: { contains: filters.search, mode: 'insensitive' } },
      { tags: { has: filters.search.toLowerCase() } },
    ];
  }

  if (filters.category) {
    where.category = { equals: filters.category, mode: 'insensitive' };
  }

  if (filters.minPrice || filters.maxPrice) {
    where.price = {
      ...(filters.minPrice && { gte: parseFloat(filters.minPrice) }),
      ...(filters.maxPrice && { lte: parseFloat(filters.maxPrice) }),
    };
  }

  if (filters.featured === 'true') {
    where.featured = true;
  }

  const orderBy: Record<string, string> = {};
  switch (filters.sortBy) {
    case 'price_asc': orderBy.price = 'asc'; break;
    case 'price_desc': orderBy.price = 'desc'; break;
    case 'rating': orderBy.rating = 'desc'; break;
    case 'newest': orderBy.createdAt = 'desc'; break;
    default: orderBy.featured = 'desc';
  }

  const [games, total] = await Promise.all([
    prisma.game.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        price: true,
        imageUrl: true,
        category: true,
        tags: true,
        publisher: true,
        featured: true,
        rating: true,
        reviewCount: true,
        createdAt: true,
      },
    }),
    prisma.game.count({ where }),
  ]);

  return { games, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

export const getGameById = async (id: string, userId?: string) => {
  const game = await prisma.game.findUnique({
    where: { id },
    include: {
      reviews: {
        include: {
          user: { select: { id: true, username: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!game || !game.isActive) throw new Error('Game not found');

  let isOwned = false;
  let isInCart = false;
  let isWishlisted = false;

  if (userId) {
    const [library, cart, wishlist] = await Promise.all([
      prisma.library.findUnique({ where: { userId_gameId: { userId, gameId: id } } }),
      prisma.cartItem.findUnique({ where: { userId_gameId: { userId, gameId: id } } }),
      prisma.wishlist.findUnique({ where: { userId_gameId: { userId, gameId: id } } }),
    ]);
    isOwned = !!library;
    isInCart = !!cart;
    isWishlisted = !!wishlist;
  }

  return { ...game, isOwned, isInCart, isWishlisted };
};

export const getGameBySlug = async (slug: string, userId?: string) => {
  const game = await prisma.game.findUnique({ where: { slug } });
  if (!game) throw new Error('Game not found');
  return getGameById(game.id, userId);
};

export const getFeaturedGames = async () => {
  return prisma.game.findMany({
    where: { featured: true, isActive: true },
    select: {
      id: true, title: true, slug: true, description: true, price: true,
      imageUrl: true, bannerUrl: true, category: true, rating: true,
    },
    take: 6,
  });
};

export const getCategories = async () => {
  const games = await prisma.game.findMany({
    where: { isActive: true },
    select: { category: true },
    distinct: ['category'],
  });
  return games.map((g) => g.category).sort();
};
