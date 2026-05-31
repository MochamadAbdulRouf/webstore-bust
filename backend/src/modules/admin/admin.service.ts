import prisma from '../../config/database';
import { createSlug } from '../../utils/helpers';
import path from 'path';
import fs from 'fs';

interface CreateGameData {
  title: string;
  description: string;
  longDesc?: string;
  price: number;
  category: string;
  tags?: string[];
  publisher: string;
  developer?: string;
  featured?: boolean;
  releaseDate?: string;
}

export const createGame = async (data: CreateGameData, imageFile?: Express.Multer.File) => {
  const slug = createSlug(data.title);
  const existing = await prisma.game.findUnique({ where: { slug } });
  if (existing) throw new Error('A game with this title already exists');

  const imageUrl = imageFile ? `/uploads/images/${imageFile.filename}` : null;

  let parsedTags: string[] = [];
  if (data.tags) {
    if (Array.isArray(data.tags)) {
      parsedTags = data.tags;
    } else if (typeof data.tags === 'string') {
      parsedTags = (data.tags as string)
        .split(',')
        .map((t: string) => t.trim())
        .filter(Boolean);
    }
  }

  const isFeatured = data.featured === true || String(data.featured) === 'true';

  return prisma.game.create({
    data: {
      title: data.title,
      description: data.description,
      longDesc: data.longDesc || null,
      category: data.category,
      publisher: data.publisher,
      developer: data.developer || data.publisher,
      slug,
      price: parseFloat(String(data.price)),
      imageUrl,
      tags: parsedTags,
      featured: isFeatured,
      releaseDate: data.releaseDate ? new Date(data.releaseDate) : null,
    },
  });
};

export const updateGame = async (
  gameId: string,
  data: Partial<CreateGameData>,
  imageFile?: Express.Multer.File
) => {
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) throw new Error('Game not found');

  const updateData: Record<string, any> = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.longDesc !== undefined) updateData.longDesc = data.longDesc;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.publisher !== undefined) updateData.publisher = data.publisher;
  if (data.developer !== undefined) {
    updateData.developer = data.developer;
  } else if (data.publisher !== undefined) {
    updateData.developer = data.publisher;
  }

  if (data.price !== undefined) {
    updateData.price = parseFloat(String(data.price));
  }

  if (imageFile) {
    updateData.imageUrl = `/uploads/images/${imageFile.filename}`;
  }

  if (data.tags !== undefined) {
    if (Array.isArray(data.tags)) {
      updateData.tags = data.tags;
    } else if (typeof data.tags === 'string') {
      updateData.tags = (data.tags as string)
        .split(',')
        .map((t: string) => t.trim())
        .filter(Boolean);
    }
  }

  if (data.featured !== undefined) {
    updateData.featured = data.featured === true || String(data.featured) === 'true';
  }

  if (data.releaseDate !== undefined) {
    updateData.releaseDate = data.releaseDate ? new Date(data.releaseDate) : null;
  }

  return prisma.game.update({ where: { id: gameId }, data: updateData });
};

export const deleteGame = async (gameId: string) => {
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) throw new Error('Game not found');

  // Soft delete by setting isActive to false
  return prisma.game.update({ where: { id: gameId }, data: { isActive: false } });
};

export const uploadGameFile = async (gameId: string, file: Express.Multer.File) => {
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) throw new Error('Game not found');

  // Remove old file if exists
  if (game.fileUrl) {
    const oldPath = path.join(process.env.UPLOAD_DIR || 'uploads', game.fileUrl);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

  return prisma.game.update({
    where: { id: gameId },
    data: {
      fileUrl: `games/${file.filename}`,
      fileSize: fileSizeMB,
    },
  });
};

export const getSalesData = async () => {
  const [totalRevenue, totalOrders, totalUsers, totalGames, recentOrders, topGames] =
    await Promise.all([
      prisma.order.aggregate({ _sum: { total: true }, where: { status: 'COMPLETED' } }),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
      prisma.user.count({ where: { isAdmin: false } }),
      prisma.game.count({ where: { isActive: true } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { username: true, email: true } },
          items: { include: { game: { select: { title: true } } } },
        },
      }),
      prisma.orderItem.groupBy({
        by: ['gameId'],
        _count: { gameId: true },
        _sum: { price: true },
        orderBy: { _count: { gameId: 'desc' } },
        take: 5,
      }),
    ]);

  const topGamesWithDetails = await Promise.all(
    topGames.map(async (g) => {
      const game = await prisma.game.findUnique({
        where: { id: g.gameId },
        select: { title: true, imageUrl: true },
      });
      return { ...g, game };
    })
  );

  return {
    totalRevenue: totalRevenue._sum.total || 0,
    totalOrders,
    totalUsers,
    totalGames,
    recentOrders,
    topGames: topGamesWithDetails,
  };
};

export const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true, email: true, username: true, balance: true,
      isAdmin: true, createdAt: true,
      _count: { select: { library: true, orders: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getAllGames = async () => {
  return prisma.game.findMany({
    select: {
      id: true, title: true, slug: true, price: true, category: true,
      featured: true, isActive: true, rating: true, reviewCount: true,
      imageUrl: true, fileUrl: true, createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};
