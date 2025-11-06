import type { RewardLevel } from '@prisma/client';

export default class TicketPurchaseUtil {
  static calculatePointsForPurchase(amount: number, level: RewardLevel): number {
    const multipliers = {
      BRONZE: 1, // 1 punto por cada $1
      SILVER: 1.5, // 1.5 puntos por cada $1
      GOLD: 2, // 2 puntos por cada $1
      PLATINUM: 3, // 3 puntos por cada $1
    };

    return Math.floor(amount * multipliers[level]);
  }

  static calculateNewLevel(totalPoints: number): RewardLevel {
    if (totalPoints >= 10000) return 'PLATINUM';
    if (totalPoints >= 5000) return 'GOLD';
    if (totalPoints >= 1000) return 'SILVER';
    return 'BRONZE';
  }
}
