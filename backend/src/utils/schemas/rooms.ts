import z from "zod";

export const createRoomSchema = z.object({
  name: z.string()
  .regex(/^[A-Z][1-9][0-9]*$/, 'Name must start with a capital letter followed by a positive number'),
  capacity: z.number().refine(val => Number.isInteger(val) && val > 0, { 
    message: 'Capacity must be greater than 0'
  })
})

export const updateRoomSchema = createRoomSchema.pick({ capacity: true });