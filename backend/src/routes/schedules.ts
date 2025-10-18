import express from 'express';
import scheduleController from '../controllers/scheduleController';
import { requireRole } from '../middlewares';
import { scheduleSchema, updateScheduleSchema } from '../utils/schemas/schedule';
import { validateWithZod } from '../middlewares/validateWithZod';
import { validateParamID } from '../utils/schemas/generic';

const router = express.Router();

router.post(
  '/',
  requireRole(['ADMIN']),
  validateWithZod(scheduleSchema, 'body'),
  scheduleController.createSchedule,
);
router.patch(
  '/:id',
  requireRole(['ADMIN']),
  validateWithZod(validateParamID, 'params'),
  validateWithZod(updateScheduleSchema, 'body'),
  scheduleController.updateSchedule,
);
router.delete(
  '/:id',
  requireRole(['ADMIN']),
  validateWithZod(validateParamID, 'params'),
  scheduleController.deleteSchedule,
);

export default router;
