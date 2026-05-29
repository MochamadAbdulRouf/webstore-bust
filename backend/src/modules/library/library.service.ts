import prisma from '../../config/database';
import path from 'path';
import fs from 'fs';

export const getLibrary = async (userId: string) => {
  return prisma.library.findMany({
    where: { userId },
    include: {
      game: {
        select: {
          id: true, title: true, slug: true, imageUrl: true,
          category: true, fileUrl: true, fileSize: true, publisher: true,
        },
      },
    },
    orderBy: { addedAt: 'desc' },
  });
};

export const downloadGame = async (userId: string, gameId: string) => {
  // Verify ownership
  const entry = await prisma.library.findUnique({
    where: { userId_gameId: { userId, gameId } },
    include: { game: { select: { title: true, fileUrl: true, fileSize: true } } },
  });

  if (!entry) throw new Error('You do not own this game');
  if (!entry.game.fileUrl) throw new Error('Game file not available yet');

  const filePath = path.join(process.env.UPLOAD_DIR || 'uploads', entry.game.fileUrl);

  if (!fs.existsSync(filePath)) {
    // In development, generate a mock download
    throw new Error('Game file not found on server');
  }

  return { filePath, fileName: entry.game.title, fileSize: entry.game.fileSize };
};

export const checkOwnership = async (userId: string, gameId: string): Promise<boolean> => {
  const entry = await prisma.library.findUnique({
    where: { userId_gameId: { userId, gameId } },
  });
  return !!entry;
};
