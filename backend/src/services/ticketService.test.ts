import { Prisma } from '@prisma/client';
import { prisma } from '../config';
import TicketService from './ticketService';
import {
  mockRedeemedTicket,
  mockTicket,
  mockTicketList,
  mockCreateTicketWithDiscountPayload,
} from '@/mock/ticket';

jest.mock('../config', () => ({
  prisma: {
    ticket: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockTX = {
  ticket: {
    create: jest.fn(),
    findFirst: jest.fn(),
  },
  schedule: {
    findUnique: jest.fn(),
  },
} as unknown as Prisma.TransactionClient;

const mockSchedule = {
  id: 1,
  startTime: '2:00 PM',
  roomId: 1,
  soldAmount: 0,
  movieId: 10,
  tickets: [{}],
  room: {
    capacity: 20,
  },
};

describe('TicketService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('createWithTransaction', () => {
    it('should return error if data is invalid', async () => {
      const mockInvalidTicketData = {
        ...mockCreateTicketWithDiscountPayload,
        basePrice: 0,
      };
      await expect(
        TicketService.createWithTransaction(mockTX, mockInvalidTicketData, 1),
      ).rejects.toThrow('Invalid ticket data provided.');
      expect(mockTX.schedule.findUnique).not.toHaveBeenCalled();
      expect(mockTX.ticket.findFirst).not.toHaveBeenCalled();
      expect(mockTX.ticket.create).not.toHaveBeenCalled();
    });

    it('should return error if schedule is not found', async () => {
      (mockTX.schedule.findUnique as jest.Mock).mockReturnValue(null);
      await expect(
        TicketService.createWithTransaction(mockTX, mockCreateTicketWithDiscountPayload, 1),
      ).rejects.toThrow('Schedule not found.');
      expect(mockTX.schedule.findUnique).toHaveBeenCalledWith({
        where: { id: mockCreateTicketWithDiscountPayload.scheduleId },
        include: {
          room: true,
          tickets: { where: { status: { not: 'CANCELLED' } } },
        },
      });
      expect(mockTX.ticket.findFirst).not.toHaveBeenCalled();
      expect(mockTX.ticket.create).not.toHaveBeenCalled();
    });

    it('should return error if Seat is already taken for this schedule.', async () => {
      (mockTX.schedule.findUnique as jest.Mock).mockReturnValue(mockSchedule);
      (mockTX.ticket.findFirst as jest.Mock).mockReturnValue(mockTicket);
      await expect(
        TicketService.createWithTransaction(mockTX, mockCreateTicketWithDiscountPayload, 1),
      ).rejects.toThrow('Seat is already taken for this schedule.');
      expect(mockTX.schedule.findUnique).toHaveBeenCalled();
      expect(mockTX.ticket.findFirst).toHaveBeenCalledWith({
        where: {
          seatNumber: mockCreateTicketWithDiscountPayload.seatNumber,
          scheduleId: mockCreateTicketWithDiscountPayload.scheduleId,
          status: { not: 'CANCELLED' },
        },
      });
      expect(mockTX.ticket.create).not.toHaveBeenCalled();
    });

    it('should return error if Schedule is sold out', async () => {
      (mockTX.schedule.findUnique as jest.Mock).mockReturnValue({
        ...mockSchedule,
        room: { capacity: 1 },
      });
      (mockTX.ticket.findFirst as jest.Mock).mockReturnValue(null);
      await expect(
        TicketService.createWithTransaction(mockTX, mockCreateTicketWithDiscountPayload, 1),
      ).rejects.toThrow('Schedule is sold out');
      expect(mockTX.schedule.findUnique).toHaveBeenCalled();
      expect(mockTX.ticket.findFirst).toHaveBeenCalledWith({
        where: {
          seatNumber: mockCreateTicketWithDiscountPayload.seatNumber,
          scheduleId: mockCreateTicketWithDiscountPayload.scheduleId,
          status: { not: 'CANCELLED' },
        },
      });
      expect(mockTX.ticket.create).not.toHaveBeenCalled();
    });

    it('should create the ticket successfully', async () => {
      (mockTX.schedule.findUnique as jest.Mock).mockReturnValue(mockSchedule);
      (mockTX.ticket.findFirst as jest.Mock).mockReturnValue(null);
      await TicketService.createWithTransaction(mockTX, mockCreateTicketWithDiscountPayload, 1);
      expect(mockTX.schedule.findUnique).toHaveBeenCalled();
      expect(mockTX.ticket.findFirst).toHaveBeenCalled();
      expect(mockTX.ticket.create).toHaveBeenCalledWith({
        data: {
          ...mockCreateTicketWithDiscountPayload,
          userId: 1,
        },
        select: {
          id: true,
          status: true,
          seatNumber: true,
          basePrice: true,
          discountId: true,
          total: true,
        },
      });
    });
  });

  describe('getTicketsByUserId', () => {
    it('should find tickets by user id', async () => {
      (prisma.ticket.findMany as jest.Mock).mockReturnValue(mockTicketList);

      const response = await TicketService.getTicketsByUserId(1);

      expect(response).toStrictEqual(mockTicketList);
      expect(prisma.ticket.findMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
        },
        select: {
          id: true,
          status: true,
          seatNumber: true,
          basePrice: true,
          discountId: true,
          total: true,
          schedule: {
            include: { movie: true, room: true },
          },
        },
      });
    });

    it('should throw error if service fails', async () => {
      (prisma.ticket.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(TicketService.getTicketsByUserId(1)).rejects.toThrow(
        /Failed to get the tickets: DB error/,
      );
    });
  });

  describe('getByID', () => {
    it('should find a ticket by id', async () => {
      (prisma.ticket.findFirst as jest.Mock).mockReturnValue(mockTicket);

      const response = await TicketService.getByID(1);

      expect(response).toEqual(mockTicket);
      expect(prisma.ticket.findFirst).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        select: {
          id: true,
          status: true,
          seatNumber: true,
          basePrice: true,
          discountId: true,
          total: true,
          schedule: {
            include: { movie: true, room: true },
          },
        },
      });
    });

    it('should throw error if service fails', async () => {
      (prisma.ticket.findFirst as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(TicketService.getByID(1)).rejects.toThrow(/Failed to get the ticket: DB error/);
    });
  });

  describe('updateStatus', () => {
    it('should update the ticket successfully', async () => {
      (prisma.ticket.findFirst as jest.Mock).mockResolvedValue(mockTicket);
      (prisma.ticket.update as jest.Mock).mockReturnValue(mockRedeemedTicket);

      const response = await TicketService.updateStatus(1, 'REDEEMED');

      expect(response).toEqual(mockRedeemedTicket);
      expect(response.status).toEqual('REDEEMED');
      expect(prisma.ticket.update).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        data: {
          status: 'REDEEMED',
        },
        select: {
          id: true,
          status: true,
          seatNumber: true,
          basePrice: true,
          discountId: true,
          total: true,
        },
      });
    });

    it('should throw error if ticket is not found', async () => {
      (prisma.ticket.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(TicketService.updateStatus(1, 'REDEEMED')).rejects.toThrow(
        /Failed to update the ticket: Ticket not found./,
      );
      expect(prisma.ticket.update).not.toHaveBeenCalled();
    });

    it('should throw error if service fails', async () => {
      (prisma.ticket.findFirst as jest.Mock).mockResolvedValue(mockTicket);
      (prisma.ticket.update as jest.Mock).mockRejectedValue(new Error('DB Error.'));

      await expect(TicketService.updateStatus(1, 'REDEEMED')).rejects.toThrow(
        /Failed to update the ticket: DB Error./,
      );
    });
  });
});
