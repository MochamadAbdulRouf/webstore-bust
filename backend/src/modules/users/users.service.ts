import prisma from '../../config/database';
import bcrypt from 'bcryptjs';
import { omitPassword } from '../../utils/helpers';

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, username: true, avatar: true,
      balance: true, isAdmin: true, createdAt: true,
      _count: { select: { library: true, orders: true, reviews: true } },
    },
  });
  if (!user) throw new Error('User not found');
  return user;
};

export const updateProfile = async (
  userId: string,
  data: { username?: string; avatar?: string }
) => {
  if (data.username) {
    const existing = await prisma.user.findFirst({
      where: { username: data.username, NOT: { id: userId } },
    });
    if (existing) throw new Error('Username already taken');
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });
  return omitPassword(user);
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) throw new Error('Current password is incorrect');

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
};

export const addBalance = async (userId: string, amount: number) => {
  if (amount <= 0 || amount > 1000) throw new Error('Amount must be between $1 and $1,000');

  const user = await prisma.user.update({
    where: { id: userId },
    data: { balance: { increment: amount } },
    select: { balance: true },
  });

  return { balance: user.balance };
};

export const getWishlist = async (userId: string) => {
  return prisma.wishlist.findMany({
    where: { userId },
    include: {
      game: {
        select: {
          id: true, title: true, slug: true, price: true,
          imageUrl: true, category: true, rating: true,
        },
      },
    },
    orderBy: { addedAt: 'desc' },
  });
};

export const toggleWishlist = async (userId: string, gameId: string) => {
  const existing = await prisma.wishlist.findUnique({
    where: { userId_gameId: { userId, gameId } },
  });

  if (existing) {
    await prisma.wishlist.delete({ where: { userId_gameId: { userId, gameId } } });
    return { wishlisted: false };
  } else {
    await prisma.wishlist.create({ data: { userId, gameId } });
    return { wishlisted: true };
  }
};
