import express from 'express';
import { validateWithZod } from '../middlewares/validateWithZod';
import { validateLimitOffset, validateParamID } from '../utils/schemas/generic';

//Import controller modules
import { userController } from '../controllers';
import { requireRole } from '../middlewares';
import { updateUserSchema } from '../utils/schemas/users';

const router = express.Router();

// Get user by Id
router.get('/:id', validateWithZod(validateParamID, 'params'), userController.getUserByID);

// Get all users
router.get(
  '/',
  requireRole(['ADMIN']),
  validateWithZod(validateLimitOffset, 'query'),
  userController.getAllUsers,
);

// Update a user
router.patch(
  '/:id',
  validateWithZod(validateParamID, 'params'),
  validateWithZod(updateUserSchema, 'body'),
  userController.updateUser,
);

export default router;
