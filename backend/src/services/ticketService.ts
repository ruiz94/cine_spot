import type { CreateTicket } from '../utils/schemas/ticket';
import { TicketStatus, Prisma } from '@prisma/client';
import { prisma } from '../config';

const selectTicketProps = {
  id: true,
  status: true,
  seatNumber: true,
  basePrice: true,
  discountId: true,
  total: true,
};
const selectTicketPropsWithSchedule = {
  ...selectTicketProps,
  schedule: {
    include: { movie: true, room: true },
  },
};

export default class TicketService {
  static async createWithTransaction(
    tx: Prisma.TransactionClient,
    ticket: CreateTicket,
    userID: number,
  ) {
    if (
      !ticket.seatNumber?.trim() ||
      ticket.basePrice <= 0 ||
      !ticket.scheduleId ||
      !ticket.total ||
      ticket.total <= 0 ||
      !userID
    ) {
      throw new Error('Invalid ticket data provided.');
    }

    // Validate schedule exists and has capacity
    const schedule = await tx.schedule.findUnique({
      where: { id: ticket.scheduleId },
      include: {
        room: true,
        tickets: { where: { status: { not: 'CANCELLED' } } },
      },
    });

    if (!schedule) {
      throw new Error('Schedule not found.');
    }

    const seatTaken = await tx.ticket.findFirst({
      where: {
        seatNumber: ticket.seatNumber,
        scheduleId: ticket.scheduleId,
        status: { not: 'CANCELLED' }, // Don't count cancelled tickets
      },
    });

    if (seatTaken) {
      throw new Error('Seat is already taken for this schedule.');
    }

    // Check room capacity
    if (schedule.tickets.length >= schedule.room.capacity) {
      throw new Error('Schedule is sold out.');
    }

    const response = await tx.ticket.create({
      data: { ...ticket, userId: userID },
      select: selectTicketProps,
    });
    return response;
  }

  static async getTicketsByUserId(userID: number) {
    try {
      const response = await prisma.ticket.findMany({
        where: {
          userId: userID,
        },
        select: selectTicketPropsWithSchedule,
      });
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'TicketService: Unknown error';
      throw new Error(`Failed to get the tickets: ${message}`);
    }
  }

  static async getByID(ticketID: number) {
    try {
      const response = await prisma.ticket.findFirst({
        where: {
          id: ticketID,
        },
        select: selectTicketPropsWithSchedule,
      });
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'TicketService: Unknown error';
      throw new Error(`Failed to get the ticket: ${message}`);
    }
  }

  static async updateStatus(ticketID: number, status: TicketStatus) {
    try {
      const ticket = await prisma.ticket.findFirst({
        where: {
          id: ticketID,
        },
      });

      if (!ticket) {
        throw new Error('Ticket not found.');
      }

      const response = await prisma.ticket.update({
        where: {
          id: ticketID,
        },
        data: {
          status,
        },
        select: selectTicketProps,
      });
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'TicketService: Unknown error';
      throw new Error(`Failed to update the ticket: ${message}`);
    }
  }
}
