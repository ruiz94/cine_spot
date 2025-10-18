import logger from '../utils/logger';
import { Response, Request } from 'express';
import ScheduleService from '../services/scheduleService';

const createSchedule = async (req: Request, res: Response) => {
  try {
    const { startTime, roomId, movieId } = req.body;

    const response = await ScheduleService.create(startTime, roomId, movieId);
    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      const message = 'Schedule already exists for this room, movie and time.';
      logger.error({ message, code: error.code });
      return res.status(409).json({ success: false, message });
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`createSchedule: ${message}`);
    return res.status(400).json({
      success: false,
      error: 'Failed to create the schedule',
    });
  }
};

const updateSchedule = async (req: Request, res: Response) => {
  try {
    const scheduleID = req.body.params.id;
    const { startTime, roomId, movieId } = req.body;
    const response = await ScheduleService.update(scheduleID, startTime, roomId, movieId);
    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    let message = 'Unknown error';
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('Cannot modify schedule with sold tickets')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('Schedule already exists for this room, movie and time')) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }
      message = error.message;
    }
    logger.error(`updateSchedule: ${message}`);
    return res.status(400).json({
      success: false,
      error: 'Failed to update the schedule',
    });
  }
};
const deleteSchedule = async (req: Request, res: Response) => {
  try {
    const scheduleID = req.body.params.id;
    const response = await ScheduleService.delete(scheduleID);
    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    let message = 'Unknown error';
    let messageUser = 'Failed to delete the schedule';
    let status = 400;
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        status = 404;
        messageUser = error.message;
      }
      if (error.message.includes('Cannot delete schedule with sold tickets')) {
        messageUser = error.message;
      }
      message = error.message;
    }
    logger.error(`deleteSchedule: ${message}`);
    return res.status(status).json({
      success: false,
      error: messageUser,
    });
  }
};

export default { createSchedule, updateSchedule, deleteSchedule };
