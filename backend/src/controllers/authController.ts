import { Response, Request } from 'express';
import { UserService } from '../services/userService';
import { JWTUtils } from '../utils';
import { JWTPayload } from '../utils/jwt';
import { User } from '@prisma/client';

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .json({ success: false, message: 'Email and password are required' });
    }

    const user: Omit<User, 'password'> = await UserService.authenticateUser(email, password);
    const token = JWTUtils.generateToken(user as JWTPayload);

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      token,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: message,
    });
  }
};

export default { login };
