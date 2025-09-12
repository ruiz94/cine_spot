import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { createUserSchema, updateUserSchema } from '../utils/schemas/users';
import { validateParamID, validateLimitOffset } from '../utils/schemas/generic';
import logger from '../utils/logger';

const createUser = async (req: Request, res: Response) => {
  const parseResult = createUserSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: parseResult.error.issues,
    });
  }
  const { username, name, email, password, birthdate } = parseResult.data;
  try {
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
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(message);
    return res.status(400).json({
      success: false,
      message: 'Failed to create the user.',
    });
  }
};

const getUserByID = async (req: Request, res: Response) => {
  const parseResult = validateParamID.safeParse(req.params);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user id',
      errors: parseResult.error.issues,
    });
  }
  const userID = parseResult.data.id;

  try {
    const userResponse = await UserService.getUserById(userID);
    if (!userResponse) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      user: userResponse,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(message);
    return res.status(400).json({
      success: false,
      message: 'Failed to get the user.',
    });
  }
};

const updateUser = async (req: Request, res: Response) => {
  const parseParamsResult = validateParamID.safeParse(req.params);
  if (!parseParamsResult.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user id',
      errors: parseParamsResult.error.issues,
    });
  }
  const userID = parseParamsResult.data.id;

  const parseResult = updateUserSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: parseResult.error.issues,
    });
  }

  try {
    const userResponse = await UserService.getUserById(userID);

    if (!userResponse) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { email, birthdate, name } = req.body;

    const userUpdated = await UserService.updateUser(Number(userID), {
      email,
      name,
      birthdate: new Date(birthdate),
    });

    return res.status(200).json({
      success: true,
      user: userUpdated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(message);
    return res.status(400).json({
      success: false,
      message: 'Failed to update the user.',
    });
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  const parseResult = validateLimitOffset.safeParse(req.query);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: parseResult.error.issues,
    });
  }

  try {
    const limit = parseResult.data.limit;
    const offset = parseResult.data.offset;
    const users = await UserService.getAllUser(limit, offset);

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(message);
    return res.status(400).json({
      success: false,
      message: 'Failed to get users.',
    });
  }
};

export default { createUser, updateUser, getUserByID, getAllUsers };
