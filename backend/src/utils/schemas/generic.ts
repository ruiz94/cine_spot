import z from 'zod';

export const validateParamID = z.object({
  id: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => Number.isInteger(val) && val > 0, {
      message: 'ID must be a positive integer',
    }),
});

export const validateLimitOffset = z.object({
  limit: z
    .string()
    .default('20')
    .transform((val) => Number(val))
    .refine((val) => Number.isInteger(val) && val > 0, {
      message: 'Limit must be a positive integer',
    })
    .optional(),
  offset: z
    .string()
    .default('0')
    .transform((val) => Number(val))
    .refine((val) => Number.isInteger(val) && val >= 0, {
      message: 'Offset must be a non-negative integer',
    })
    .optional(),
});
