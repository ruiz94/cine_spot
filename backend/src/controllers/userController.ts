import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { createUserSchema, updateUserSchema } from '../utils/schemas/users';
import { validateParamID, validateLimitOffset } from '../utils/schemas/generic';

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
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
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
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
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
    const errorStatusMap: Record<string, number> = {
      'Email already exists': 409,
    };
    const status =
      error instanceof Error && errorStatusMap[error.message] ? errorStatusMap[error.message] : 400;

    return res.status(status || 400).json({
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
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
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};

export default { createUser, updateUser, getUserByID, getAllUsers };
