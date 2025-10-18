import { prisma } from '../config';

export default class ScheduleService {
  static async create(time: string, roomId: number, movieId: number) {
    try {
      const existingSchedule = await prisma.schedule.findFirst({
        where: {
          startTime: time,
          roomId,
          movieId,
        },
      });

      if (existingSchedule) {
        throw { code: 'P2002' };
      }

      const response = await prisma.schedule.create({
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
      return response;
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error) {
        throw { code: error.code };
      }
      const message = error instanceof Error ? error.message : 'ScheduleService: Unknown error';
      throw new Error(`Failed to create the schedule: ${message}`);
    }
  }

  static async update(scheduleId: number, time: string, roomId: number, movieId: number) {
    try {
      const currentSchedule = await prisma.schedule.findUnique({
        where: { id: scheduleId },
        include: { tickets: true },
      });

      if (!currentSchedule) {
        throw new Error('Schedule not found.');
      }

      if (currentSchedule.tickets.length > 0) {
        throw new Error('Cannot modify schedule with sold tickets.');
      }

      const existingSchedule = await prisma.schedule.findFirst({
        where: {
          startTime: time,
          roomId,
          movieId,
          NOT: { id: scheduleId },
        },
      });

      if (existingSchedule) {
        throw new Error('Schedule already exists for this room, movie and time.');
      }

      const response = await prisma.schedule.update({
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
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ScheduleService: Unknown error';
      throw new Error(`Failed to update the schedule: ${message}`);
    }
  }

  static async delete(scheduleId: number) {
    try {
      const currentSchedule = await prisma.schedule.findUnique({
        where: { id: scheduleId },
        include: { tickets: true },
      });

      if (!currentSchedule) {
        throw new Error('Schedule not found.');
      }

      if (currentSchedule.tickets.length > 0) {
        throw new Error('Cannot delete schedule with sold tickets.');
      }

      const response = await prisma.schedule.delete({
        where: { id: scheduleId },
      });
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ScheduleService: Unknown error';
      throw new Error(`Failed to delete the schedule: ${message}`);
    }
  }
}
