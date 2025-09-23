import { Request, Response } from 'express';
import discountController from './discountController';
import { DiscountService } from '../services/discountService';

jest.mock('../services/discountService');

const mockDiscountData = {
  name: 'Birthday discount',
  type: 'BIRTHDAY',
  description: 'Happy birthday discount',
  discount: 0.3,
  isActive: true,
  discountMethod: 'PERCENTAGE',
};

describe('discountController', () => {
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let res: Partial<Response>;
  let req: Partial<Request>;

  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnThis();
    req = {
      body: {},
    };
    res = {
      status: statusMock,
      json: jsonMock,
    } as unknown as Response;
    jest.clearAllMocks();
  });

  describe('createDiscount', () => {
    it('should return 200 when create a discount successfully', async () => {
      (DiscountService.createDiscount as jest.Mock).mockReturnValue(mockDiscountData);
      req.body = {
        ...mockDiscountData,
      };

      await discountController.createDiscount(req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockDiscountData,
      });
    });

    it('should return 409 when discount already exists', async () => {
      (DiscountService.createDiscount as jest.Mock).mockRejectedValue({
        code: 'P2002',
        message: 'Discount already exists.',
      });
      req.body = {
        ...mockDiscountData,
      };

      await discountController.createDiscount(req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Discount already exists.',
      });
    });

    it('should return 400 when create discount fails', async () => {
      (DiscountService.createDiscount as jest.Mock).mockRejectedValue(new Error('BD Error'));
      req.body = {
        ...mockDiscountData,
      };

      await discountController.createDiscount(req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to create the discount.',
      });
    });
  });

  describe('getAllDiscounts', () => {
    it('should return 200 when fetched discounts successfully', async () => {
      (DiscountService.getAll as jest.Mock).mockReturnValue([mockDiscountData]);
      req.body.query = {
        limit: 10,
        offset: 0,
      };

      await discountController.getAllDiscounts(req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: [mockDiscountData],
      });
    });

    it('should return 400 when get discounts fails', async () => {
      (DiscountService.getAll as jest.Mock).mockRejectedValue(new Error('BD Error'));
      req.body.query = {
        limit: 10,
        offset: 0,
      };

      await discountController.getAllDiscounts(req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to get discounts.',
      });
    });

    it('should handle unknown errors', async () => {
      (DiscountService.getAll as jest.Mock).mockRejectedValue('BD Error');
      req.body.query = {
        limit: 10,
        offset: 0,
      };

      await discountController.getAllDiscounts(req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to get discounts.',
      });
    });
  });

  describe('getDiscountByID', () => {
    it('should return 200 when fetched a discount successfully', async () => {
      (DiscountService.getByID as jest.Mock).mockReturnValue(mockDiscountData);
      req.body.params = {
        id: 1,
      };

      await discountController.getDiscountByID(req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockDiscountData,
      });
    });

    it('should return 404 when the discount does not exists', async () => {
      (DiscountService.getByID as jest.Mock).mockReturnValue(null);
      req.body.params = {
        id: 1,
      };

      await discountController.getDiscountByID(req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Discount not found.',
      });
    });

    it('should return 400 when get discount by id fails', async () => {
      (DiscountService.getByID as jest.Mock).mockRejectedValue(new Error('BD Error'));
      req.body.params = {
        id: 1,
      };

      await discountController.getDiscountByID(req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to get the discount.',
      });
    });

    it('should return handle unknown error', async () => {
      (DiscountService.getByID as jest.Mock).mockRejectedValue('BD Error');
      req.body.params = {
        id: 1,
      };

      await discountController.getDiscountByID(req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to get the discount.',
      });
    });
  });

  describe('updateDiscount', () => {
    it('should return 200 when discount is updated successfully', async () => {
      (DiscountService.updateDiscount as jest.Mock).mockReturnValue(mockDiscountData);
      req.body = {
        params: {
          id: 1,
        },
        ...mockDiscountData,
      };

      await discountController.updateDiscount(req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockDiscountData,
      });
    });

    it('should return 409 when discount already exists', async () => {
      (DiscountService.updateDiscount as jest.Mock).mockRejectedValue({
        code: 'P2002',
        message: 'Discount name already exists.',
      });

      req.body = {
        params: {
          id: 1,
        },
        ...mockDiscountData,
      };

      await discountController.updateDiscount(req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Discount name already exists.',
      });
    });

    it('should return 400 when update discount fails', async () => {
      (DiscountService.updateDiscount as jest.Mock).mockRejectedValue(new Error('BD error'));

      req.body = {
        params: {
          id: 1,
        },
        ...mockDiscountData,
      };

      await discountController.updateDiscount(req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to update the discount.',
      });
    });
  });

  describe('deleteDiscount', () => {
    it('should return 204 when discount is deleted successfully', async () => {
      (DiscountService.deleteDiscount as jest.Mock).mockReturnValue(mockDiscountData);
      req.body.params = {
        id: 1,
      };

      await discountController.deleteDiscount(req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(204);
    });

    it('should return 404 when discount is not found', async () => {
      (DiscountService.deleteDiscount as jest.Mock).mockRejectedValue({
        code: 'P2025',
        message: 'No discount found to delete.',
      });
      req.body.params = {
        id: 1,
      };

      await discountController.deleteDiscount(req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'No discount found to delete.',
      });
    });

    it('should return 400 when delete discount fails', async () => {
      (DiscountService.deleteDiscount as jest.Mock).mockRejectedValue(new Error('BD error'));
      req.body.params = {
        id: 1,
      };

      await discountController.deleteDiscount(req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to delete the discount.',
      });
    });
  });
});
