import { Prisma } from '@prisma/client';
import { prisma } from '../config';
import PointsTransactionService from './pointsTransactionService';

jest.mock('../config', () => ({
  prisma: {
    pointTransaction: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

const mockTx = {
  pointTransaction: {
    create: jest.fn(),
  },
} as unknown as Prisma.TransactionClient;

describe('PointsTransactionService', () => {
  const mockData = {
    id: 3,
    userId: 2,
    type: 'REDEEMED',
    points: -15,
    description: 'Earned points test 1',
    createdAt: '2025-10-10T03:30:47.011Z',
  };
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a points transaction successfully', async () => {
      (prisma.pointTransaction.create as jest.Mock).mockResolvedValue(mockData);

      const response = await PointsTransactionService.create(1, 10, 'EARNED', 'Test data');

      expect(response).toBe(mockData);
      expect(prisma.pointTransaction.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          type: 'EARNED',
          points: 10,
          description: 'Test data',
        },
      });
    });

    it('should throw an error when params are not passed', async () => {
      (prisma.pointTransaction.create as jest.Mock).mockResolvedValue(mockData);

      await expect(PointsTransactionService.create(1, 0, 'EARNED', '')).rejects.toThrow(
        /Invalid point transaction data/,
      );
      expect(prisma.pointTransaction.create).not.toHaveBeenCalled();
    });

    it('should handle gracefully unknown errors', async () => {
      (prisma.pointTransaction.create as jest.Mock).mockRejectedValue('DB error');

      await expect(PointsTransactionService.create(1, 10, 'EARNED', 'Test data')).rejects.toThrow(
        'Failed to create the transaction: Unknown error',
      );
    });
  });

  describe('getUserPointHistory', () => {
    it('should return an array of points transaction', async () => {
      (prisma.pointTransaction.findMany as jest.Mock).mockReturnValue([mockData]);
      const response = await PointsTransactionService.getUserPointHistory(1);

      expect(response).toStrictEqual([mockData]);
      expect(prisma.pointTransaction.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
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
    });

    it('should throw an error when service fails', async () => {
      (prisma.pointTransaction.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(PointsTransactionService.getUserPointHistory(1)).rejects.toThrow(
        'Failed to get the transactions: DB error',
      );
    });

    it('should handle gracefully unknown errors', async () => {
      (prisma.pointTransaction.findMany as jest.Mock).mockRejectedValue('DB error');

      await expect(PointsTransactionService.getUserPointHistory(1)).rejects.toThrow(
        'Failed to get the transactions: Unknown error',
      );
    });
  });

  describe('createWithTransaction', () => {
    it('should create a points transaction successfully', async () => {
      (mockTx.pointTransaction.create as jest.Mock).mockResolvedValue(mockData);

      const response = await PointsTransactionService.createWithTransaction(
        mockTx,
        1,
        10,
        'EARNED',
        'Test data',
      );

      expect(response).toBe(mockData);
      expect(mockTx.pointTransaction.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          type: 'EARNED',
          points: 10,
          description: 'Test data',
        },
      });
    });

    it('should throw an error when params are not passed', async () => {
      (mockTx.pointTransaction.create as jest.Mock).mockResolvedValue(mockData);

      await expect(
        PointsTransactionService.createWithTransaction(mockTx, 1, 0, 'EARNED', ''),
      ).rejects.toThrow(/Invalid point transaction data/);
      expect(mockTx.pointTransaction.create).not.toHaveBeenCalled();
    });
  });
});
