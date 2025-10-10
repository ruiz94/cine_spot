import pointsTransactionController from './pointsTransactionController';
import { PointsTransactionService } from '../services/pointsTransactionService';
import { Response, Request } from 'express';

jest.mock('../services/pointsTransactionService');

describe('pointsTransactionController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnThis();
    req = {
      body: {},
    };
    res = {
      status: statusMock,
      json: jsonMock,
    } as unknown as Response;
  });

  describe('getUserPointTransactionHistory', () => {
    it('should return status 200 when points transactions are fetched successfully', async () => {
      const mockData = {
        id: 3,
        userId: 2,
        type: 'REDEEMED',
        points: -15,
        description: 'Earned points test 1',
        createdAt: '2025-10-10T03:30:47.011Z',
        user: {
          id: 2,
          username: 'admin',
          name: 'Armando Ruiz',
          email: 'admin_cine_spot@gmail.com',
          birthdate: '1994-12-16T06:00:00.000Z',
          role: 'ADMIN',
          reward: {
            id: 1,
            userId: 2,
            totalPoints: 0,
            level: 'BRONZE',
            createdAt: '2025-08-06T21:57:46.992Z',
            updatedAt: '2025-08-06T21:57:46.992Z',
          },
        },
      };
      (PointsTransactionService.getUserPointHistory as jest.Mock).mockReturnValue([mockData]);
      req.body.params = {
        id: 1,
      };

      await pointsTransactionController.getUserPointTransactionHistory(
        req as Request,
        res as Response,
      );
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: [mockData],
      });
    });

    it('should return status 400 when service fails', async () => {
      (PointsTransactionService.getUserPointHistory as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );
      req.body.params = {
        id: 1,
      };

      await pointsTransactionController.getUserPointTransactionHistory(
        req as Request,
        res as Response,
      );
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: `Fails to get the user points transaction history.`,
      });
    });

    it('should return handle gracefully unknown errors', async () => {
      (PointsTransactionService.getUserPointHistory as jest.Mock).mockRejectedValue('DB error');
      req.body.params = {
        id: 1,
      };

      await pointsTransactionController.getUserPointTransactionHistory(
        req as Request,
        res as Response,
      );
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: `Fails to get the user points transaction history.`,
      });
    });
  });
});
