import prisma from '../../config/database';

export const checkout = async (userId: string) => {
  // Get cart items with game details
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { game: true },
  });

  if (!cartItems.length) throw new Error('Cart is empty');

  // Check for already-owned games
  const gameIds = cartItems.map((item) => item.gameId);
  const alreadyOwned = await prisma.library.findMany({
    where: { userId, gameId: { in: gameIds } },
  });

  if (alreadyOwned.length > 0) {
    const ownedIds = new Set(alreadyOwned.map((l) => l.gameId));
    const ownedGames = cartItems
      .filter((item) => ownedIds.has(item.gameId))
      .map((item) => item.game.title);
    throw new Error(`You already own: ${ownedGames.join(', ')}`);
  }

  const total = cartItems.reduce((acc, item) => acc + item.game.price, 0);

  // Check balance
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  if (user.balance < total) {
    throw new Error(`Insufficient balance. Need $${total.toFixed(2)}, have $${user.balance.toFixed(2)}`);
  }

  // Process transaction
  const order = await prisma.$transaction(async (tx) => {
    // Deduct balance
    await tx.user.update({
      where: { id: userId },
      data: { balance: { decrement: total } },
    });

    // Create order
    const newOrder = await tx.order.create({
      data: {
        userId,
        total,
        status: 'COMPLETED',
        items: {
          create: cartItems.map((item) => ({
            gameId: item.gameId,
            price: item.game.price,
          })),
        },
      },
      include: { items: { include: { game: { select: { id: true, title: true, imageUrl: true } } } } },
    });

    // Add to library
    await tx.library.createMany({
      data: cartItems.map((item) => ({ userId, gameId: item.gameId })),
      skipDuplicates: true,
    });

    // Clear cart
    await tx.cartItem.deleteMany({ where: { userId } });

    return newOrder;
  });

  return order;
};

export const getOrders = async (userId: string) => {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          game: { select: { id: true, title: true, imageUrl: true, slug: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getOrderById = async (orderId: string, userId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          game: { select: { id: true, title: true, imageUrl: true, slug: true, category: true } },
        },
      },
    },
  });

  if (!order) throw new Error('Order not found');
  if (order.userId !== userId) throw new Error('Unauthorized');

  return order;
};
