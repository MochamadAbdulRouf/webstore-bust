import prisma from '../../config/database';

export const getCart = async (userId: string) => {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      game: {
        select: {
          id: true, title: true, slug: true, price: true,
          imageUrl: true, category: true,
        },
      },
    },
    orderBy: { addedAt: 'desc' },
  });

  const total = items.reduce((acc, item) => acc + item.game.price, 0);
  return { items, total, count: items.length };
};

export const addToCart = async (userId: string, gameId: string) => {
  const game = await prisma.game.findUnique({ where: { id: gameId, isActive: true } });
  if (!game) throw new Error('Game not found');

  const alreadyOwned = await prisma.library.findUnique({
    where: { userId_gameId: { userId, gameId } },
  });
  if (alreadyOwned) throw new Error('You already own this game');

  const existing = await prisma.cartItem.findUnique({
    where: { userId_gameId: { userId, gameId } },
  });
  if (existing) throw new Error('Game already in cart');

  await prisma.cartItem.create({ data: { userId, gameId } });
  return getCart(userId);
};

export const removeFromCart = async (userId: string, gameId: string) => {
  await prisma.cartItem.deleteMany({ where: { userId, gameId } });
  return getCart(userId);
};

export const clearCart = async (userId: string) => {
  await prisma.cartItem.deleteMany({ where: { userId } });
};
