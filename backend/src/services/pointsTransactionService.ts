import { TransactionType } from '@prisma/client';
import { prisma } from '../config';

export class PointsTransactionService {
  static async create(userId: number, points: number, type: TransactionType, description: string) {
    try {
      if (!userId || !points || !type || !description) {
        throw new Error('Invalid point transaction data.');
      }

      const response = await prisma.pointTransaction.create({
        data: {
          userId,
          type,
          points,
          description,
        },
      });
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create the transaction: ${message}`);
    }
  }

  static async getUserPointHistory(userId: number) {
    try {
      return await prisma.pointTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          userId: true,
          type: true,
          points: true,
          description: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              email: true,
              birthdate: true,
              role: true,
              reward: true,
            },
          },
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get the transactions: ${message}`);
    }
  }
}
