import express from 'express';

//Import controller modules
import { authController } from '../controllers';

const router = express.Router();

router.post('/login', authController.login);
// Create a new user
// router.post('/register', (_, res, next) => {
//   console.log("process.env['NODE_ENV']", process.env['NODE_ENV'], !isRegisterEnabled)
//   if (!isRegisterEnabled) {
//     res.status(503).json({ success: false, message: 'This route is temporarily disabled.' });
//   }
//   next();
// }, userController.createUser);

export default router;
