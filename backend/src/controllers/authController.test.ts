import { Request, Response } from 'express';
import authController from './authController';
import { UserService } from '../services/userService';
import { JWTUtils } from '../utils';

jest.mock('../services/userService');
jest.mock('../utils');

describe('authController.login', () => {
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

  it('should return 400 if email or password is missing', async () => {
    req.body = {
      // email: '', email missing
      password: 'password123',
    };
    await authController.login(req as Request, res as Response);
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: 'Email and password are required',
    });
  });

  it('should return 200 when authenticate a user successfully', async () => {
    const userMock = {
      id: 1,
      username: 'testuser',
      name: 'Test User',
      email: 'test@example.com',
      birthdate: new Date('2000-01-01'),
    };
    const token = 'mocked-jwt-token';
    (UserService.authenticateUser as jest.Mock).mockResolvedValue(userMock);

    (JWTUtils.generateToken as jest.Mock).mockReturnValue(token);

    req.body = {
      email: 'test@gmail.com',
      password: 'password123',
    };

    await authController.login(req as Request, res as Response);
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: 'Authentication successful',
      token,
    });
  });

  it('should return 401 when authenticate fails', async () => {
    (UserService.authenticateUser as jest.Mock).mockImplementation(() => {
      throw new Error('User not found');
    });

    req.body = {
      email: 'test@gmail.com',
      password: 'password123',
    };

    await authController.login(req as Request, res as Response);
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: 'Authentication failed',
      error: 'User not found',
    });
  });

  it('should handle unknown errors gracefully', async () => {
    (UserService.authenticateUser as jest.Mock).mockRejectedValue('User not found');

    req.body = {
      email: 'test@gmail.com',
      password: 'password123',
    };

    await authController.login(req as Request, res as Response);
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: 'Authentication failed',
      error: 'An unknown error occurred',
    });
  });
});
