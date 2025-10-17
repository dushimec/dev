import prisma from '../../../../src/config/database';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

const REFRESH_TTL_DAYS = Number(process.env.REFRESH_TOKEN_DAYS || 30);

export const createRefreshToken = async (userId: string) => {
  const token = uuidv4();
  const expiresAt = dayjs().add(REFRESH_TTL_DAYS, 'day').toDate();
  const dbToken = await prisma.refreshToken.create({
    data: { userId, token, expiresAt }
  });
  return dbToken;
};

export const revokeRefreshToken = async (token: string) => {
  return prisma.refreshToken.updateMany({ where: { token }, data: { status: 'REVOKED' } });
};

export const findRefreshToken = async (token: string) => {
  return prisma.refreshToken.findUnique({ where: { token } });
};