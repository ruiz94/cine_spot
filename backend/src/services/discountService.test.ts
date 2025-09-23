import { DiscountService } from './discountService';
import { prisma } from '../config';
import type { createDiscount } from '@/utils/schemas/discount';

jest.mock('../config', () => ({
  prisma: {
    discount: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockDiscountData: createDiscount = {
  name: 'Birthday discount',
  type: 'BIRTHDAY',
  description: 'Happy birthday discount',
  discount: 0.3,
  // isActive: true,
  discountMethod: 'PERCENTAGE',
};

const selectDiscountObject = {
  id: true,
  name: true,
  type: true,
  description: true,
  discount: true,
  isActive: true,
  discountMethod: true,
};

describe('DiscountService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createDiscount', () => {
    it('should create a discount successfully', async () => {
      (prisma.discount.create as jest.Mock).mockReturnValue(mockDiscountData);

      const res = await DiscountService.createDiscount(mockDiscountData);

      expect(res).toEqual(mockDiscountData);
      expect(prisma.discount.create).toHaveBeenCalledWith({
        data: { ...mockDiscountData, isActive: true },
        select: selectDiscountObject,
      });
    });

    it('should return error discount already exists', async () => {
      (prisma.discount.create as jest.Mock).mockRejectedValue({
        code: 'P2002',
        message: 'Discount already exists',
      });

      await expect(DiscountService.createDiscount(mockDiscountData)).rejects.toMatchObject({
        code: 'P2002',
        message: 'Discount already exists',
      });
      expect(prisma.discount.create).toHaveBeenCalledWith({
        data: { ...mockDiscountData, isActive: true },
        select: selectDiscountObject,
      });
    });

    it('should throw error when create discount service fails', async () => {
      (prisma.discount.create as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(DiscountService.createDiscount(mockDiscountData)).rejects.toThrow(
        /Failed to create the discount: DB error/,
      );
    });
  });

  describe('getAll', () => {
    it('should fetch discounts successfully', async () => {
      (prisma.discount.findMany as jest.Mock).mockReturnValue([mockDiscountData]);

      const res = await DiscountService.getAll(10, 0);

      expect(res).toEqual([mockDiscountData]);
      expect(prisma.discount.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        select: selectDiscountObject,
      });
    });

    it('should throw error when findMany discounts service fails', async () => {
      (prisma.discount.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(DiscountService.getAll(10, 0)).rejects.toThrow(
        /Failed to get discounts: DB error/,
      );
    });
  });

  describe('getByID', () => {
    it('should fetch discounts successfully', async () => {
      (prisma.discount.findUnique as jest.Mock).mockReturnValue(mockDiscountData);

      const res = await DiscountService.getByID(10);

      expect(res).toEqual(mockDiscountData);
      expect(prisma.discount.findUnique).toHaveBeenCalledWith({
        where: { id: 10 },
        select: selectDiscountObject,
      });
    });

    it('should throw error when findMany discounts service fails', async () => {
      (prisma.discount.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(DiscountService.getByID(10)).rejects.toThrow(
        /Failed to get the discount: DB error/,
      );
    });
  });

  describe('updateDiscount', () => {
    it('should update discount successfully', async () => {
      (prisma.discount.update as jest.Mock).mockReturnValue(mockDiscountData);

      const res = await DiscountService.updateDiscount(10, mockDiscountData);

      expect(res).toEqual(mockDiscountData);
      expect(prisma.discount.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: mockDiscountData,
        select: selectDiscountObject,
      });
    });

    it('should throw error when discount already exists', async () => {
      (prisma.discount.update as jest.Mock).mockRejectedValue({
        code: 'P2002',
        message: 'Discount already exists.',
      });

      await expect(DiscountService.updateDiscount(10, mockDiscountData)).rejects.toMatchObject({
        code: 'P2002',
        message: 'Discount already exists.',
      });
    });

    it('should throw error when update discount service fails', async () => {
      (prisma.discount.update as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(DiscountService.updateDiscount(10, mockDiscountData)).rejects.toThrow(
        /Failed to update the discount: DB error/,
      );
    });
  });

  describe('deleteDiscount', () => {
    it('should delete discount successfully', async () => {
      (prisma.discount.delete as jest.Mock).mockReturnValue(mockDiscountData);

      const res = await DiscountService.deleteDiscount(10);

      expect(res).toEqual(mockDiscountData);
      expect(prisma.discount.delete).toHaveBeenCalledWith({
        where: { id: 10 },
      });
    });

    it('should throw error when discount is not found', async () => {
      (prisma.discount.delete as jest.Mock).mockRejectedValue({
        code: 'P2025',
        message: 'No discount found to delete.',
      });

      await expect(DiscountService.deleteDiscount(10)).rejects.toMatchObject({
        code: 'P2025',
        message: 'No discount found to delete.',
      });
    });

    it('should throw error when delete discount service fails', async () => {
      (prisma.discount.delete as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(DiscountService.deleteDiscount(10)).rejects.toThrow(
        /Failed to delete the discount: DB error/,
      );
    });
  });
});
