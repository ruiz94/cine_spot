import express from 'express';
import ticketsController from '../controllers/ticketsController';
import { CreateTicketSchema } from '../utils/schemas/ticket';
import { validateWithZod } from '../middlewares/validateWithZod';
import { validateParamID } from '../utils/schemas/generic';

const router = express.Router();

router.post('/', validateWithZod(CreateTicketSchema, 'body'), ticketsController.createTicket);
router.get('/', ticketsController.getTicketsByUserID);
router.get('/:id', validateWithZod(validateParamID, 'params'), ticketsController.getTicketByID);
router.put(
  '/redeem/:id',
  validateWithZod(validateParamID, 'params'),
  ticketsController.redeemTicket,
);

export default router;
