import prisma from '../../config/database';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../config/jwt';
import { omitPassword } from '../../utils/helpers';

export const register = async (email: string, username: string, password: string) => {
  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existingUser) {
    if (existingUser.email === email) throw new Error('Email already registered');
    throw new Error('Username already taken');
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, username, password: hashedPassword },
  });

  const payload = { userId: user.id, email: user.email, isAdmin: user.isAdmin };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return { user: omitPassword(user), accessToken, refreshToken };
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid credentials');

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error('Invalid credentials');

  const payload = { userId: user.id, email: user.email, isAdmin: user.isAdmin };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return { user: omitPassword(user), accessToken, refreshToken };
};

export const refreshTokens = async (token: string) => {
  const payload = verifyRefreshToken(token);
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) throw new Error('User not found');

  const newPayload = { userId: user.id, email: user.email, isAdmin: user.isAdmin };
  const accessToken = generateAccessToken(newPayload);
  const refreshToken = generateRefreshToken(newPayload);

  return { accessToken, refreshToken };
};

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      avatar: true,
      balance: true,
      isAdmin: true,
      createdAt: true,
      _count: { select: { library: true, orders: true, reviews: true } },
    },
  });

  if (!user) throw new Error('User not found');
  return user;
};
