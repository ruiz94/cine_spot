import { Response, Request } from 'express';
import ticketsController from './ticketsController';
import { mockUser } from '../mock/user';
import { mockTicketList, mockTicket, mockCreateTicketPayload } from '../mock/ticket';
import TicketService from '../services/ticketService';
import { Prisma } from '@prisma/client';
import RewardService from '../services/rewardService';
import { prisma } from '../config';
import TicketPurchaseUtil from '../utils/ticketPurchase';
import PointsTransactionService from '../services/pointsTransactionService';
import ScheduleService from '../services/scheduleService';

jest.mock('../services/ticketService');
jest.mock('../services/rewardService');
jest.mock('../services/pointsTransactionService');
jest.mock('../services/scheduleService');
jest.mock('../utils/ticketPurchase');
jest.mock('../config', () => ({
  prisma: {
    $transaction: jest.fn(),
  },
}));

const mockTX = {
  ticket: {
    create: jest.fn(),
    findFirst: jest.fn(),
  },
  schedule: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  reward: {
    update: jest.fn(),
  },
  pointTransaction: {
    create: jest.fn(),
  },
} as unknown as Prisma.TransactionClient;

describe('ticketsController', () => {
  let res: Partial<Response>;
  let req: Partial<Request>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnThis();
    req = {
      body: {},
    };
    res = {
      status: mockStatus,
      json: mockJson,
    };
    jest.clearAllMocks();
  });

  describe('createTicket', () => {
    it('should throw an error if userID or userReward is invalid', async () => {
      req.body = {};
      await ticketsController.createTicket(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(TicketService.createWithTransaction).not.toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'User ID is required.',
      });
    });

    it('should create the ticket successfully without discount (with points)', async () => {
      req = {
        user: mockUser,
        body: mockCreateTicketPayload,
      };

      // Mock the transaction function
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(mockTX);
      });

      // Mock service methods
      (TicketService.createWithTransaction as jest.Mock).mockResolvedValue(mockTicket);
      (TicketPurchaseUtil.calculatePointsForPurchase as jest.Mock).mockReturnValue(25);
      (TicketPurchaseUtil.calculateNewLevel as jest.Mock).mockReturnValue('SILVER');
      (PointsTransactionService.createWithTransaction as jest.Mock).mockResolvedValue({});
      (RewardService.updateWithTransaction as jest.Mock).mockResolvedValue({});
      (ScheduleService.updateSoldAmountWithTransaction as jest.Mock).mockReturnValue(
        mockTicket.schedule,
      );

      await ticketsController.createTicket(req as Request, res as Response);

      //Verify transaction was called
      expect(prisma.$transaction).toHaveBeenCalled();

      //Verify services were called within transaction
      expect(TicketService.createWithTransaction).toHaveBeenCalledWith(
        mockTX,
        expect.objectContaining({
          seatNumber: mockCreateTicketPayload.seatNumber,
          basePrice: mockCreateTicketPayload.basePrice,
          total: mockCreateTicketPayload.total,
          scheduleId: mockCreateTicketPayload.scheduleId,
          status: 'SOLD',
        }),
        mockUser.id,
      );

      //since no discount, points should be processed
      expect(TicketPurchaseUtil.calculatePointsForPurchase).toHaveBeenCalledWith(
        mockCreateTicketPayload.total,
        mockUser.reward.level,
      );
      expect(PointsTransactionService.createWithTransaction).toHaveBeenCalledWith(
        mockTX,
        mockUser.id,
        25,
        'EARNED',
        `Compra de $${mockCreateTicketPayload.total}`,
      );
      expect(RewardService.updateWithTransaction).toHaveBeenCalledWith(
        mockTX,
        mockUser.id,
        25,
        'SILVER',
        'INCREMENT',
      );

      // Schedule sold amount should be updated
      expect(ScheduleService.updateSoldAmountWithTransaction).toHaveBeenCalledWith(
        mockTX,
        mockCreateTicketPayload.scheduleId,
        1,
      );

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockTicket,
      });
    });

    it('should create ticket successfully with discount (no points)', async () => {
      const payloadWithDiscount = {
        ...mockCreateTicketPayload,
        discountId: 1,
      };

      req = {
        user: mockUser,
        body: payloadWithDiscount,
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(mockTX);
      });

      (TicketService.createWithTransaction as jest.Mock).mockResolvedValue(mockTicket);
      (ScheduleService.updateSoldAmountWithTransaction as jest.Mock).mockResolvedValue(
        mockTicket.schedule,
      );

      await ticketsController.createTicket(req as Request, res as Response);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(TicketService.createWithTransaction).toHaveBeenCalledWith(
        mockTX,
        expect.any(Object),
        mockUser.id,
      );
      expect(ScheduleService.updateSoldAmountWithTransaction).toHaveBeenCalledWith(
        mockTX,
        payloadWithDiscount.scheduleId,
        1,
      );

      // Points services should NOT be called when discount is present
      expect(PointsTransactionService.createWithTransaction).not.toHaveBeenCalled();
      expect(RewardService.updateWithTransaction).not.toHaveBeenCalled();

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockTicket,
      });
    });

    it('should handle transaction failure and rollback', async () => {
      req = {
        user: mockUser,
        body: mockCreateTicketPayload,
      };

      // Mock transaction to throw an error
      (prisma.$transaction as jest.Mock).mockRejectedValue(new Error('Transaction failed'));

      await ticketsController.createTicket(req as Request, res as Response);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to create the ticket',
      });
    });

    it('should handle specific validation errors', async () => {
      req = {
        user: mockUser,
        body: mockCreateTicketPayload,
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(mockTX);
      });

      (TicketService.createWithTransaction as jest.Mock).mockRejectedValue(
        new Error('Seat is already taken for this schedule.'),
      );

      await ticketsController.createTicket(req as Request, res as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Seat is already taken for this schedule.',
      });
    });
  });

  describe('getTicketsByUserID', () => {
    it('should throw an error if userID is invalid', async () => {
      await ticketsController.getTicketsByUserID(req as Request, res as Response);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(TicketService.getTicketsByUserId).not.toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to get the tickets',
      });
    });

    it('should get the tickets', async () => {
      req = {
        user: mockUser,
      };
      (TicketService.getTicketsByUserId as jest.Mock).mockResolvedValue(mockTicketList);
      await ticketsController.getTicketsByUserID(req as Request, res as Response);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        total: mockTicketList.length,
        data: mockTicketList,
      });
    });
  });

  describe('getTicketByID', () => {
    it('should throw an error if ticketID is invalid', async () => {
      await ticketsController.getTicketByID(req as Request, res as Response);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(TicketService.getByID).not.toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to get the ticket',
      });
    });

    it('should get the tickets', async () => {
      req.body.params = {
        id: 1,
      };
      (TicketService.getByID as jest.Mock).mockResolvedValue(mockTicket);
      await ticketsController.getTicketByID(req as Request, res as Response);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockTicket,
      });
    });
  });

  describe('redeemTicket', () => {
    it('should throw an error if ticketID is invalid', async () => {
      req.body.params = {};
      await ticketsController.redeemTicket(req as Request, res as Response);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(TicketService.updateStatus).not.toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to redeem the ticket',
      });
    });

    it('should get the tickets', async () => {
      req.body.params = {
        id: 1,
      };
      (TicketService.updateStatus as jest.Mock).mockResolvedValue(mockTicket);
      await ticketsController.redeemTicket(req as Request, res as Response);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockTicket,
      });
    });
  });
});
