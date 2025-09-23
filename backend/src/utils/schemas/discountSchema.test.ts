// tests/discountSchema.test.ts
import { updateDiscountSchema, createDiscountSchema } from './discount';

describe('createDiscountSchema', () => {
  it('should fails if there is no fields', () => {
    const result = createDiscountSchema.safeParse({});
    expect(result.success).toBe(false);
  });
  it('should fail if discountMethod is PERCENTAGE and discount is off range', () => {
    const result = createDiscountSchema.safeParse({
      discount: 2,
      discountMethod: 'PERCENTAGE',
      name: 'test large',
      type: 'BIRTHDAY',
      description: 'description test',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toMatch(/between 0 and 1/);
  });
});

describe('updateDiscountSchema', () => {
  it('should fail if discountMethod is PERCENTAGE and discount is off range', () => {
    const result = updateDiscountSchema.safeParse({ discount: 2, discountMethod: 'PERCENTAGE' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toMatch(/between 0 and 1/);
  });

  it('should fail if just one of discount or discountMethod is presented', () => {
    let result = updateDiscountSchema.safeParse({ discount: 0.5 });
    expect(result.success).toBe(false);

    result = updateDiscountSchema.safeParse({ discountMethod: 'PERCENTAGE' });
    expect(result.success).toBe(false);
  });

  it('should fail if there is no fields', () => {
    const result = updateDiscountSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should pass if both fields are presented and correct', () => {
    const result = updateDiscountSchema.safeParse({ discount: 0.5, discountMethod: 'PERCENTAGE' });
    expect(result.success).toBe(true);
  });
});
