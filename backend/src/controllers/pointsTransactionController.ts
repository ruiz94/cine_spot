import PointsTransactionService from '../services/pointsTransactionService';
import logger from '../utils/logger';
import { Request, Response } from 'express';

const getUserPointTransactionHistory = async (req: Request, res: Response) => {
  try {
    const paramUserId = req.body.params.id;
    const userId = req.user?.role === 'ADMIN' ? paramUserId : req.user?.id;

    const data = await PointsTransactionService.getUserPointHistory(userId);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error.';
    logger.error(`Fails to get user points transaction history: ${message}`);
    return res.status(400).json({
      success: false,
      error: `Fails to get the user points transaction history.`,
    });
  }
};

export default { getUserPointTransactionHistory };
