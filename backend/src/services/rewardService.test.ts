import RewardService from './rewardService';
import { prisma } from '../config';
import { Prisma, Reward } from '@prisma/client';

const rewardMock: Reward = {
  id: 1,
  userId: 3,
  totalPoints: 100,
  level: 'BRONZE',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTx = {
  reward: {
    update: jest.fn(),
  },
} as unknown as Prisma.TransactionClient;

jest.mock('../config', () => ({
  prisma: {
    reward: {
      update: jest.fn(),
    },
  },
}));

describe('RewardService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('update', () => {
    it('should update successfully the reward when INCREMENT', async () => {
      (prisma.reward.update as jest.Mock).mockReturnValue(rewardMock);

      const response = await RewardService.update(1, 100, 'BRONZE', 'INCREMENT');

      expect(prisma.reward.update).toHaveBeenCalledWith({
        where: { userId: 1 },
        data: {
          totalPoints: { increment: 100 },
          level: 'BRONZE',
        },
      });
      expect(response).toBe(rewardMock);
    });

    it('should update successfully the reward when DECREMENT', async () => {
      (prisma.reward.update as jest.Mock).mockReturnValue(rewardMock);

      const response = await RewardService.update(1, 100, 'BRONZE', 'DECREMENT');

      expect(prisma.reward.update).toHaveBeenCalledWith({
        where: { userId: 1 },
        data: {
          totalPoints: { decrement: 100 },
          level: 'BRONZE',
        },
      });
      expect(response).toBe(rewardMock);
    });

    it('should throw an error if the service fail', async () => {
      (prisma.reward.update as jest.Mock).mockRejectedValue(new Error('DB error'));

      const response = await RewardService.update(1, 100, 'BRONZE', 'INCREMENT');
      expect(response).toEqual({
        success: false,
        message: 'DB error',
      });
    });
  });

  describe('updateWithTransaction', () => {
    it('should update successfully the reward when INCREMENT', async () => {
      (mockTx.reward.update as jest.Mock).mockReturnValue(rewardMock);

      const response = await RewardService.updateWithTransaction(
        mockTx,
        1,
        100,
        'BRONZE',
        'INCREMENT',
      );
      expect(response).toBe(rewardMock);
    });

    it('should update successfully the reward when DECREMENT', async () => {
      (mockTx.reward.update as jest.Mock).mockReturnValue(rewardMock);

      const response = await RewardService.updateWithTransaction(
        mockTx,
        1,
        100,
        'BRONZE',
        'DECREMENT',
      );
      expect(response).toBe(rewardMock);
    });
  });
});
