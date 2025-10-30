import { TicketStatus } from '@prisma/client';
import z from 'zod';

export const TicketSchema = z.object({
  seatNumber: z
    .string()
    .min(1, 'Seat number is required')
    .trim()
    .regex(/^[A-Z]\d+$/, 'Seat number must follow format like A1, B12, etc.'),

  basePrice: z
    .number()
    .positive('Base price must be greater than 0')
    .max(500, 'Base price cannot exceed $500'),

  discountId: z
    .number()
    .int('Discount ID must be an integer')
    .positive('Discount ID must be positive')
    .optional(),

  total: z.number().positive('Total price must be greater than 0'),

  scheduleId: z
    .number()
    .int('Schedule ID must be an integer')
    .positive('Schedule ID must be positive'),
});

export const CreateTicketSchema = TicketSchema;

export type CreateTicket = z.infer<typeof CreateTicketSchema> & {
  status: TicketStatus;
  discountId?: number;
};
