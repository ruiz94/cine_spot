import express from 'express';

import { discountController } from '../controllers';
import { requireRole } from '../middlewares';
import { validateWithZod } from '../middlewares/validateWithZod';
import { createDiscountSchema, updateDiscountSchema } from '../utils/schemas/discount';
import { validateLimitOffset, validateParamID } from '../utils/schemas/generic';

const router = express.Router();

//Create the discount
router.post(
  '/',
  requireRole(['ADMIN']),
  validateWithZod(createDiscountSchema, 'body'),
  discountController.createDiscount,
);

//get all discounts
router.get('/', validateWithZod(validateLimitOffset, 'query'), discountController.getAllDiscounts);

//get discount by id
router.get('/:id', validateWithZod(validateParamID, 'params'), discountController.getDiscountByID);

//update discount
router.patch(
  '/:id',
  requireRole(['ADMIN']),
  validateWithZod(updateDiscountSchema, 'body'),
  validateWithZod(validateParamID, 'params'),
  discountController.updateDiscount,
);

//delete discount
router.delete(
  '/:id',
  requireRole(['ADMIN']),
  validateWithZod(validateParamID, 'params'),
  discountController.deleteDiscount,
);

export default router;
