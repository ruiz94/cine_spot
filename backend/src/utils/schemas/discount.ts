import z from 'zod';

//Enums
const DiscountTypeEnum = z.enum(['BIRTHDAY', 'SEASONAL', 'POINTS']);
const DiscountMethodEnum = z.enum(['PERCENTAGE', 'FIXED', 'POINTS']);

const validDiscountPercentage = <T extends { discount: number; discountMethod: string }>(
  data: T,
  ctx: z.RefinementCtx,
) => {
  //Valida rango solo si es porcentaje

  if (data.discountMethod === 'PERCENTAGE' && (data.discount < 0 || data.discount > 1)) {
    ctx.addIssue({
      path: ['discount'],
      code: 'custom',
      message: 'For percentage discount, value must be between 0 and 1.',
    });
  }
};

//Schema
export const discountSchema = z
  .object({
    name: z.string().min(5, 'Name is required.'),
    type: DiscountTypeEnum,
    description: z.string().min(5, 'Description is required.'),
    discount: z.number(),
    isActive: z.boolean(),
    discountMethod: DiscountMethodEnum,
  })
  .superRefine(validDiscountPercentage);

export type createDiscount = z.infer<typeof createDiscountSchema>;
export const createDiscountSchema = discountSchema
  .omit({ isActive: true })
  .superRefine(validDiscountPercentage);
export const updateDiscountSchema = discountSchema
  .omit({ type: true })
  .partial()
  .superRefine((data, ctx) => {
    // Solo valida si ambos campos están presentes
    if (data.discountMethod === 'PERCENTAGE') {
      if (typeof data.discount !== 'number' || data.discount < 0 || data.discount > 1) {
        ctx.addIssue({
          path: ['discount'],
          code: 'custom',
          message: 'For percentage discount, value must be between 0 and 1.',
        });
      }
    }
    // Si uno está presente y el otro no, error
    if (
      (data.discount !== undefined && data.discountMethod === undefined) ||
      (data.discount === undefined && data.discountMethod !== undefined)
    ) {
      ctx.addIssue({
        path: ['discountMethod'],
        code: 'custom',
        message:
          "Both 'discount' and 'discountMethod' fields are required together when updating the discount.",
      });
    }
    // Al menos un campo debe estar presente
    if (
      data.name === undefined &&
      data.description === undefined &&
      data.isActive === undefined &&
      data.discount === undefined &&
      data.discountMethod === undefined
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'You must provide at least one field.',
      });
    }
  });
