import { prisma } from '../config';
import ScheduleService from './scheduleService';

jest.mock('../config', () => ({
  prisma: {
    schedule: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

const mockSchedule = {
  id: 1,
  startTime: '2:00 PM',
  roomId: 1,
  soldAmount: 0,
  movieId: 10,
  tickets: [{}],
};

describe('ScheduleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const time = '2:00 PM';
  const roomId = 1;
  const movieId = 3;
  const scheduleId = 5;
  describe('create', () => {
    it('should return code P2002 when a schedule already exists', async () => {
      (prisma.schedule.findFirst as jest.Mock).mockReturnValue(mockSchedule);

      await expect(ScheduleService.create(time, roomId, movieId)).rejects.toMatchObject({
        code: 'P2002',
      });
      expect(prisma.schedule.findFirst).toHaveBeenCalledWith({
        where: {
          startTime: time,
          roomId,
          movieId,
        },
      });
      expect(prisma.schedule.create).not.toHaveBeenCalled();
    });

    it('should throw error when service fails', async () => {
      (prisma.schedule.findFirst as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(ScheduleService.create(time, roomId, movieId)).rejects.toThrow(
        /Failed to create the schedule: DB error/,
      );
    });

    it('should handle gracefully unknown errors', async () => {
      (prisma.schedule.findFirst as jest.Mock).mockRejectedValue('DB error');

      await expect(ScheduleService.create(time, roomId, movieId)).rejects.toThrow(
        /Failed to create the schedule: ScheduleService: Unknown error/,
      );
    });

    it('should create the schedule successfully', async () => {
      (prisma.schedule.findFirst as jest.Mock).mockReturnValue(null);
      (prisma.schedule.create as jest.Mock).mockReturnValue(mockSchedule);

      const response = await ScheduleService.create(time, roomId, movieId);
      expect(response).toBe(mockSchedule);
      expect(prisma.schedule.create).toHaveBeenCalledWith({
        data: {
          startTime: time,
          roomId,
          movieId,
        },
        select: {
          id: true,
          startTime: true,
          roomId: true,
          soldAmount: true,
          movieId: true,
        },
      });
    });
  });

  describe('update', () => {
    it('should throw an error when schedule is not found', async () => {
      (prisma.schedule.findUnique as jest.Mock).mockReturnValue(null);

      await expect(ScheduleService.update(scheduleId, time, roomId, movieId)).rejects.toThrow(
        /Failed to update the schedule: Schedule not found./,
      );
      expect(prisma.schedule.findUnique).toHaveBeenCalledWith({
        where: { id: scheduleId },
        include: { tickets: true },
      });
      expect(prisma.schedule.findFirst).not.toHaveBeenCalled();
      expect(prisma.schedule.update).not.toHaveBeenCalled();
    });

    it('should throw an error when  the schedules has sold tickets', async () => {
      (prisma.schedule.findUnique as jest.Mock).mockReturnValue(mockSchedule);

      await expect(ScheduleService.update(scheduleId, time, roomId, movieId)).rejects.toThrow(
        /Failed to update the schedule: Cannot modify schedule with sold tickets./,
      );
      expect(prisma.schedule.findFirst).not.toHaveBeenCalled();
      expect(prisma.schedule.update).not.toHaveBeenCalled();
    });

    it('should throw an error when the schedules already exists', async () => {
      mockSchedule.tickets = [];
      (prisma.schedule.findUnique as jest.Mock).mockReturnValue(mockSchedule);
      (prisma.schedule.findFirst as jest.Mock).mockReturnValue(mockSchedule);

      await expect(ScheduleService.update(scheduleId, time, roomId, movieId)).rejects.toThrow(
        /Failed to update the schedule: Schedule already exists for this room, movie and time./,
      );
      expect(prisma.schedule.findFirst).toHaveBeenCalledWith({
        where: {
          startTime: time,
          roomId,
          movieId,
          NOT: { id: scheduleId },
        },
      });
      expect(prisma.schedule.update).not.toHaveBeenCalled();
    });

    it('should throw error when service fails', async () => {
      (prisma.schedule.findFirst as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(ScheduleService.update(scheduleId, time, roomId, movieId)).rejects.toThrow(
        /Failed to update the schedule: DB error/,
      );
    });

    it('should handle gracefully unknown errors', async () => {
      (prisma.schedule.findFirst as jest.Mock).mockRejectedValue('DB error');

      await expect(ScheduleService.update(scheduleId, time, roomId, movieId)).rejects.toThrow(
        /Failed to update the schedule: ScheduleService: Unknown error/,
      );
    });

    it('should update the schedule successfully', async () => {
      mockSchedule.tickets = [];
      (prisma.schedule.findUnique as jest.Mock).mockReturnValue(mockSchedule);
      (prisma.schedule.findFirst as jest.Mock).mockReturnValue(null);
      (prisma.schedule.update as jest.Mock).mockReturnValue(mockSchedule);

      const response = await ScheduleService.update(scheduleId, time, roomId, movieId);
      expect(response).toBe(mockSchedule);
      expect(prisma.schedule.update).toHaveBeenCalledWith({
        where: { id: scheduleId },
        data: {
          startTime: time,
          roomId,
          movieId,
        },
        select: {
          id: true,
          startTime: true,
          roomId: true,
          soldAmount: true,
          movieId: true,
        },
      });
    });
  });

  describe('delete', () => {
    it('should throw an error when schedule is not found', async () => {
      (prisma.schedule.findUnique as jest.Mock).mockReturnValue(null);

      await expect(ScheduleService.delete(scheduleId)).rejects.toThrow(
        /Failed to delete the schedule: Schedule not found./,
      );
      expect(prisma.schedule.findUnique).toHaveBeenCalledWith({
        where: { id: scheduleId },
        include: { tickets: true },
      });
      expect(prisma.schedule.delete).not.toHaveBeenCalled();
    });

    it('should throw an error when the schedules has sold tickets', async () => {
      mockSchedule.tickets = [{}];
      (prisma.schedule.findUnique as jest.Mock).mockReturnValue(mockSchedule);

      await expect(ScheduleService.delete(scheduleId)).rejects.toThrow(
        /Failed to delete the schedule: Cannot delete schedule with sold tickets./,
      );
      expect(prisma.schedule.delete).not.toHaveBeenCalled();
    });

    it('should throw error when service fails', async () => {
      (prisma.schedule.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(ScheduleService.delete(scheduleId)).rejects.toThrow(
        /Failed to delete the schedule: DB error/,
      );
    });

    it('should handle gracefully unknown errors', async () => {
      (prisma.schedule.findUnique as jest.Mock).mockRejectedValue('DB error');

      await expect(ScheduleService.delete(scheduleId)).rejects.toThrow(
        /Failed to delete the schedule: ScheduleService: Unknown error/,
      );
    });

    it('should delete the schedule successfully', async () => {
      mockSchedule.tickets = [];
      (prisma.schedule.findUnique as jest.Mock).mockReturnValue(mockSchedule);
      (prisma.schedule.delete as jest.Mock).mockReturnValue(mockSchedule);

      const response = await ScheduleService.delete(scheduleId);
      expect(response).toBe(mockSchedule);
      expect(prisma.schedule.delete).toHaveBeenCalledWith({
        where: { id: scheduleId },
      });
    });
  });
});
