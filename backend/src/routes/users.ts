import express from 'express';

//Import controller modules
import { userController } from '../controllers';

const router = express.Router();

// Create a new user
router.post('/register', userController.createUser);

export default router;
