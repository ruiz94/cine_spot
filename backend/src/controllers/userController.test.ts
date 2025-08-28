import { Request, Response } from 'express';
import userController from './userController';
import { UserService } from '../services/userService';

jest.mock('../services/userService');

describe('userController.createUser', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnThis();
    req = {
      body: {},
    };
    res = {
      status: statusMock,
      json: jsonMock,
    } as unknown as Response;
    jest.clearAllMocks();
  });

  it('should return 400 if any required field is missing', async () => {
    req.body = {
      username: 'testuser',
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      // birthdate missing
    };
    await userController.createUser(req as Request, res as Response);
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: 'All fields are required',
    });
  });

  it('should create a user and return 201 with user data', async () => {
    const userMock = {
      id: 1,
      username: 'testuser',
      name: 'Test User',
      email: 'test@example.com',
      birthdate: new Date('2000-01-01'),
    };
    (UserService.createUser as jest.Mock).mockResolvedValue(userMock);

    req.body = {
      username: 'testuser',
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      birthdate: '2000-01-01',
    };

    await userController.createUser(req as Request, res as Response);

    expect(UserService.createUser).toHaveBeenCalledWith({
      username: 'testuser',
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      birthdate: new Date('2000-01-01'),
    });
    expect(statusMock).toHaveBeenCalledWith(201);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: 'User created successfully',
      user: userMock,
    });
  });

  it('should handle errors from UserService and return 400', async () => {
    (UserService.createUser as jest.Mock).mockRejectedValue(new Error('User already exists'));

    req.body = {
      username: 'testuser',
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      birthdate: '2000-01-01',
    };

    await userController.createUser(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: 'User already exists',
    });
  });

  it('should handle unknown errors gracefully', async () => {
    (UserService.createUser as jest.Mock).mockRejectedValue('Some unknown error');

    req.body = {
      username: 'testuser',
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      birthdate: '2000-01-01',
    };

    await userController.createUser(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: 'An unknown error occurred',
    });
  });
});
