import express from 'express';
import { pointsTransactionController } from '../controllers';
import { validateWithZod } from '../middlewares/validateWithZod';
import { validateParamID } from '../utils/schemas/generic';

const router = express.Router();

router.get(
  '/userHistory/:id',
  validateWithZod(validateParamID, 'params'),
  pointsTransactionController.getUserPointTransactionHistory,
);

export default router;
