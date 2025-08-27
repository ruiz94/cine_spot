import { Request, Response } from 'express';
import { UserService } from '../services/userService';

const testUserController = (_: Request, res: Response) => {
  res.send('User controller is working...');
};

const createUser = async (req: Request, res: Response) => {
  try {
    const { username, name, email, password, birthdate } = req.body;
    if (!username || !name || !email || !password || !birthdate) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const user = await UserService.createUser({
      username,
      name,
      email,
      password, // Password in plain text
      birthdate: new Date(birthdate),
    });
    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      user, // Do not include hashed password
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};

export default { testUserController, createUser };
