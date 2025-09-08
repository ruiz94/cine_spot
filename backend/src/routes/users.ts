import express from 'express';

//Import controller modules
import { userController } from '../controllers';

const router = express.Router();

// Get user by Id
router.get('/find/:id', userController.getUserByID);
// Get all users
router.get('/getAll', userController.getAllUsers);
// Update a user
router.put('/update/:id', userController.updateUser);

export default router;
