import { Response, Request } from 'express';
import { DiscountService } from '../services/discountService';
import logger from '../utils/logger';

const createDiscount = async (req: Request, res: Response) => {
  try {
    const { name, type, description, discount, discountMethod } = req.body;
    const discountResponse = await DiscountService.createDiscount({
      name,
      type,
      description,
      discount,
      discountMethod,
    });
    return res.status(200).json({
      success: true,
      data: discountResponse,
    });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Discount already exists.',
      });
    }
    const message = error instanceof Error ? error.message : 'createDiscount: Unknown error.';
    logger.error(message);
    return res.status(400).json({
      success: false,
      message: 'Failed to create the discount.',
    });
  }
};

const getAllDiscounts = async (req: Request, res: Response) => {
  try {
    const { limit, offset } = req.body.query;
    const discounts = await DiscountService.getAll(limit, offset);

    return res.status(200).json({
      success: true,
      data: discounts,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'getAllDiscounts: Unknown error.';
    logger.error(message);
    return res.status(400).json({
      success: false,
      message: 'Failed to get discounts.',
    });
  }
};

const getDiscountByID = async (req: Request, res: Response) => {
  try {
    const discountID = req.body.params.id;
    const discount = await DiscountService.getByID(discountID);

    if (!discount) {
      return res.status(404).json({ success: false, message: 'Discount not found.' });
    }

    return res.status(200).json({
      success: true,
      data: discount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'getDiscountByID: Unknown error';
    logger.error(message);
    return res.status(400).json({
      success: false,
      message: 'Failed to get the discount.',
    });
  }
};

const updateDiscount = async (req: Request, res: Response) => {
  try {
    const discountID = req.body.params.id;
    const { name, description, discount, isActive, discountMethod } = req.body;
    const discountUpdated = await DiscountService.updateDiscount(discountID, {
      name,
      description,
      discount,
      isActive,
      discountMethod,
    });

    return res.status(200).json({
      success: true,
      data: discountUpdated,
    });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      logger.error({ message: 'Discount name already exists', code: error.code });
      return res.status(409).json({ success: false, message: 'Discount name already exists.' });
    }
    const message = error instanceof Error ? error.message : 'updateDiscount: Unknown error';
    logger.error(message);
    return res.status(400).json({
      success: false,
      message: 'Failed to update the discount.',
    });
  }
};

const deleteDiscount = async (req: Request, res: Response) => {
  try {
    const discountID = req.body.params.id;

    await DiscountService.deleteDiscount(discountID);

    return res.status(204).send();
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
      logger.error({ message: 'No discount found to delete.', code: error.code });
      return res.status(404).json({ success: false, message: 'No discount found to delete.' });
    }

    const message = error instanceof Error ? error.message : 'deleteDiscount: Unknown error';
    logger.error(message);
    return res.status(400).json({
      success: false,
      message: 'Failed to delete the discount.',
    });
  }
};

export default { createDiscount, getAllDiscounts, getDiscountByID, updateDiscount, deleteDiscount };
