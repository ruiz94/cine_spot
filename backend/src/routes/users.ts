const express = require('express');

//Import controller modules
import { userController } from '../controllers';

const router = express.Router();

// GET users listing
// router.get('/test', userController.testUserController);
// Create a new user
router.post('/register', userController.createUser);

export default router;
