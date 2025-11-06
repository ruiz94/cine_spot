import z from 'zod';

export const scheduleSchema = z.object({
  startTime: z.string().min(1, 'Start Time is required'),
  roomId: z.number(),
  movieId: z.number(),
});

export const updateScheduleSchema = scheduleSchema.partial();
