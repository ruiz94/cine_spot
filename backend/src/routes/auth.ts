import express from 'express';

//Import controller modules
import { authController } from '../controllers';

const router = express.Router();

router.post('/login', authController.login);

export default router;
