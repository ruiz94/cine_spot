import { Response, Request } from 'express';
import scheduleController from './scheduleController';
import ScheduleService from '../services/scheduleService';

jest.mock('../services/scheduleService');

const mockSchedule = {
  id: 1,
  startTime: '2:00 PM',
  roomId: 1,
  soldAmount: 0,
  movieId: 10,
  tickets: [{}],
};

describe('scheduleController', () => {
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;
  let res: Partial<Response>;
  let req: Partial<Request>;

  beforeEach(() => {
    mockStatus = jest.fn().mockReturnThis();
    mockJson = jest.fn().mockReturnThis();

    req = {
      body: {},
    };
    res = {
      status: mockStatus,
      json: mockJson,
    } as unknown as Response;
  });

  describe('createSchedule', () => {
    it('should return 409 when schedule already exists', async () => {
      (ScheduleService.create as jest.Mock).mockRejectedValue({ code: 'P2002' });

      req.body = {
        startTime: '2:00',
        roomId: 1,
        movieId: 2,
      };

      await scheduleController.createSchedule(req as Request, res as Response);
      expect(ScheduleService.create).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(409);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Schedule already exists for this room, movie and time.',
      });
    });

    it('should return 400 status when service fails', async () => {
      (ScheduleService.create as jest.Mock).mockRejectedValue(new Error('DB error'));

      req.body = {
        startTime: '2:00',
        roomId: 1,
        movieId: 2,
      };

      await scheduleController.createSchedule(req as Request, res as Response);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to create the schedule',
      });
    });

    it('should handle unknown error gracefully', async () => {
      (ScheduleService.create as jest.Mock).mockRejectedValue('DB error');

      req.body = {
        startTime: '2:00',
        roomId: 1,
        movieId: 2,
      };

      await scheduleController.createSchedule(req as Request, res as Response);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to create the schedule',
      });
    });

    it('should return 200 when create schedule success', async () => {
      (ScheduleService.create as jest.Mock).mockResolvedValue(mockSchedule);

      req.body = {
        startTime: '2:00',
        roomId: 1,
        movieId: 2,
      };

      await scheduleController.createSchedule(req as Request, res as Response);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockSchedule,
      });
    });
  });

  describe('updateSchedule', () => {
    it('should return 404 when schedule is not found', async () => {
      (ScheduleService.update as jest.Mock).mockRejectedValue(new Error('not found'));

      req.body = {
        startTime: '2:00',
        roomId: 1,
        movieId: 2,
        params: {
          id: 1,
        },
      };

      await scheduleController.updateSchedule(req as Request, res as Response);
      expect(ScheduleService.update).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'not found',
      });
    });

    it('should return 400 status when a schedule with sold tickets cannot be modified', async () => {
      (ScheduleService.update as jest.Mock).mockRejectedValue(
        new Error('Cannot modify schedule with sold tickets'),
      );

      req.body = {
        startTime: '2:00',
        roomId: 1,
        movieId: 2,
        params: {
          id: 1,
        },
      };

      await scheduleController.updateSchedule(req as Request, res as Response);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Cannot modify schedule with sold tickets',
      });
    });

    it('should return 409 when schedule already exists', async () => {
      (ScheduleService.update as jest.Mock).mockRejectedValue(
        new Error('Schedule already exists for this room, movie and time'),
      );

      req.body = {
        startTime: '2:00',
        roomId: 1,
        movieId: 2,
        params: {
          id: 1,
        },
      };

      await scheduleController.updateSchedule(req as Request, res as Response);
      expect(ScheduleService.update).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(409);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Schedule already exists for this room, movie and time',
      });
    });

    it('should return 400 status when service fails', async () => {
      (ScheduleService.update as jest.Mock).mockRejectedValue(new Error('DB error'));

      req.body = {
        startTime: '2:00',
        roomId: 1,
        movieId: 2,
      };

      await scheduleController.updateSchedule(req as Request, res as Response);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to update the schedule',
      });
    });

    it('should return 200 when update schedule success', async () => {
      (ScheduleService.update as jest.Mock).mockResolvedValue(mockSchedule);

      req.body = {
        startTime: '2:00',
        roomId: 1,
        movieId: 2,
        params: {
          id: 1,
        },
      };

      await scheduleController.updateSchedule(req as Request, res as Response);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockSchedule,
      });
    });
  });

  describe('deleteSchedule', () => {
    it('should return 404 when schedule is not found', async () => {
      (ScheduleService.delete as jest.Mock).mockRejectedValue(new Error('not found'));

      req.body.params = {
        id: 1,
      };

      await scheduleController.deleteSchedule(req as Request, res as Response);
      expect(ScheduleService.delete).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'not found',
      });
    });

    it('should return 400 when schedule with sold ticket cannot be deleted', async () => {
      (ScheduleService.delete as jest.Mock).mockRejectedValue(
        new Error('Cannot delete schedule with sold tickets'),
      );

      req.body.params = {
        id: 1,
      };

      await scheduleController.deleteSchedule(req as Request, res as Response);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Cannot delete schedule with sold tickets',
      });
    });

    it('should return 400 status when service fails', async () => {
      (ScheduleService.delete as jest.Mock).mockRejectedValue(new Error('DB error'));

      req.body.params = {
        id: 1,
      };

      await scheduleController.deleteSchedule(req as Request, res as Response);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to delete the schedule',
      });
    });

    it('should return 200 when delete schedule success', async () => {
      (ScheduleService.delete as jest.Mock).mockResolvedValue(mockSchedule);

      req.body.params = {
        id: 1,
      };

      await scheduleController.deleteSchedule(req as Request, res as Response);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockSchedule,
      });
    });
  });
});
