import z from 'zod';
export const createUserSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  birthdate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid birthdate',
  }),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(1, 'Name is required').optional(),
    birthdate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid birthdate',
      })
      .optional(),
    email: z.email('Invalid email').optional(),
  })
  .refine((data) => data.name || data.birthdate || data.email, {
    message: 'You must provide at least one field.',
  });
