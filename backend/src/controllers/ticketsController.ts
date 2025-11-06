import ScheduleService from '../services/scheduleService';
import { prisma } from '../config';
import PointsTransactionService from '../services/pointsTransactionService';
import RewardService from '../services/rewardService';
import TicketService from '../services/ticketService';
import logger from '../utils/logger';
import { CreateTicket } from '../utils/schemas/ticket';
import TicketPurchaseUtil from '../utils/ticketPurchase';
import { Request, Response } from 'express';

const createTicket = async (req: Request, res: Response) => {
  try {
    const userID = req.user?.id;
    const userReward = req.user?.reward;

    if (!userID || !userReward) {
      throw new Error('User ID is required.');
    }

    const { seatNumber, basePrice, discountId, scheduleId, total } = req.body;

    const payload: CreateTicket = {
      seatNumber,
      basePrice,
      discountId,
      scheduleId,
      status: 'SOLD',
      total,
    };

    const result = await prisma.$transaction(async (tx) => {
      const ticket = await TicketService.createWithTransaction(tx, payload, userID);

      if (!discountId) {
        const pointsEarned = TicketPurchaseUtil.calculatePointsForPurchase(total, userReward.level);

        // Crear transacción
        await PointsTransactionService.createWithTransaction(
          tx,
          userID,
          pointsEarned,
          'EARNED',
          `Compra de $${total}`,
        );

        // Actualizar total de puntos
        const newLevel = TicketPurchaseUtil.calculateNewLevel(
          userReward.totalPoints + pointsEarned,
        );
        await RewardService.updateWithTransaction(tx, userID, pointsEarned, newLevel, 'INCREMENT');
      }

      const updatedSchedule = await ScheduleService.updateSoldAmountWithTransaction(
        tx,
        scheduleId,
        1,
      );
      return {
        ...ticket,
        schedule: updatedSchedule,
      };
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      [
        'Invalid ticket data provided.',
        'Schedule not found.',
        'Seat is already taken for this schedule.',
        'Schedule is sold out.',
        'There is not enough capacity.',
        'User ID is required.',
      ].some((message) => error.message.includes(message))
    ) {
      logger.error(`TicketController:createTicket: ${error.message}`);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`TicketController:createTicket: ${message}`);
    return res.status(400).json({
      success: false,
      error: 'Failed to create the ticket',
    });
  }
};

const getTicketsByUserID = async (req: Request, res: Response) => {
  try {
    const userID = req.user?.id;

    if (!userID) {
      throw new Error('User ID is required');
    }

    const tickets = await TicketService.getTicketsByUserId(userID);
    return res.status(200).json({
      success: true,
      total: tickets.length,
      data: tickets,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`TicketController:getTicketsByUserID: ${message}`);
    return res.status(400).json({
      success: false,
      error: 'Failed to get the tickets',
    });
  }
};

const getTicketByID = async (req: Request, res: Response) => {
  try {
    const ticketID = req.body.params?.id;

    if (!ticketID) {
      throw new Error('Ticket ID is required');
    }

    const ticket = await TicketService.getByID(ticketID);
    return res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`TicketController:getTicketByID: ${message}`);
    return res.status(400).json({
      success: false,
      error: 'Failed to get the ticket',
    });
  }
};

const redeemTicket = async (req: Request, res: Response) => {
  try {
    const { id: ticketID } = req.body.params;
    if (!ticketID) {
      throw new Error('Ticket ID is required.');
    }
    const ticket = await TicketService.updateStatus(ticketID, 'REDEEMED');
    return res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`TicketController:redeemTicket: ${message}`);
    return res.status(400).json({
      success: false,
      error: 'Failed to redeem the ticket',
    });
  }
};

export default {
  createTicket,
  getTicketsByUserID,
  getTicketByID,
  redeemTicket,
};
