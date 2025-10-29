import { prisma } from '../config';
import { RewardLevel, Prisma } from '@prisma/client';

type updateType = 'INCREMENT' | 'DECREMENT';

export default class RewardService {
  static async update(
    userId: number,
    pointsEarned: number,
    level: RewardLevel,
    increment: updateType,
  ) {
    try {
      const totalPoints =
        increment === 'INCREMENT' ? { increment: pointsEarned } : { decrement: pointsEarned };
      const data = await prisma.reward.update({
        where: { userId },
        data: {
          totalPoints,
          level,
        },
      });

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: message,
      };
    }
  }

  static async updateWithTransaction(
    tx: Prisma.TransactionClient,
    userId: number,
    pointsEarned: number,
    level: RewardLevel,
    increment: updateType,
  ) {
    const totalPoints =
      increment === 'INCREMENT' ? { increment: pointsEarned } : { decrement: pointsEarned };
    const data = await tx.reward.update({
      where: { userId },
      data: {
        totalPoints,
        level,
      },
    });

    return data;
  }
}
