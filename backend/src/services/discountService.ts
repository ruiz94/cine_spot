import type { createDiscount } from '../utils/schemas/discount';
import { prisma } from '../config';
import { Discount } from '@prisma/client';

const selectDiscountObject = {
  id: true,
  name: true,
  type: true,
  description: true,
  discount: true,
  isActive: true,
  discountMethod: true,
};

export class DiscountService {
  static async createDiscount(data: createDiscount) {
    try {
      const response = await prisma.discount.create({
        data: { ...data, isActive: true },
        select: selectDiscountObject,
      });
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
        throw { code: error.code, message: error.message };
      }
      throw new Error(`Failed to create the discount: ${message}`);
    }
  }

  static async getAll(limit: number, offset: number) {
    try {
      const discounts = await prisma.discount.findMany({
        skip: offset,
        take: limit,
        select: selectDiscountObject,
      });
      return discounts;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get discounts: ${message}`);
    }
  }

  static async getByID(discountID: number) {
    try {
      const discount = await prisma.discount.findUnique({
        where: {
          id: discountID,
        },
        select: selectDiscountObject,
      });
      return discount;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get the discount: ${message}`);
    }
  }

  static async updateDiscount(discountID: number, data: Partial<Discount>) {
    try {
      const discount = await prisma.discount.update({
        where: {
          id: discountID,
        },
        data: data,
        select: selectDiscountObject,
      });
      return discount;
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
        throw { code: error.code, message: error.message };
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update the discount: ${message}`);
    }
  }

  static async deleteDiscount(discountID: number) {
    try {
      const discount = await prisma.discount.delete({
        where: { id: discountID },
      });
      return discount;
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
        throw { code: error.code, message: error.message };
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to delete the discount: ${message}`);
    }
  }
}
