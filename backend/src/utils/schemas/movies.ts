import z from 'zod';

const movieSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  minutes: z.number(),
  category: z.string().min(1, 'Category is required'),
});

export const createMovieSchema = movieSchema;

export const updateMovieSchema = movieSchema
  .partial()
  .refine((data) => data.name || data.minutes || data.category, {
    message: 'You must provide at least one field.',
  });
