import { Request, Response } from 'express';
import userController from './userController';
import { UserService } from '../services/userService';

jest.mock('../services/userService');

describe('userController', () => {
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

  describe('createUser', () => {
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
        message: 'Validation failed',
        errors: expect.arrayContaining([
          expect.objectContaining({
            path: ['birthdate'],
            code: 'invalid_type',
          }),
        ]),
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

  describe('getUserByID', () => {
    it('should return 400 if id is not number', async () => {
      req.params = {
        id: 'testid',
      };
      await userController.getUserByID(req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid user id',
        errors: expect.arrayContaining([
          expect.objectContaining({
            path: ['id'],
            code: 'custom',
            message: 'ID must be a positive integer',
          }),
        ]),
      });
    });

    it('should return error when user is not found', async () => {
      (UserService.getUserById as jest.Mock).mockResolvedValue(undefined)

      req.params = {
        id: '1',
      };

      await userController.getUserByID(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'User not found.',
      });
    });

    it('should handle unknown errors gracefully', async () => {
      (UserService.getUserById as jest.Mock).mockRejectedValue('Some unknown error');

      req.params = {
        id: '1',
      };

      await userController.getUserByID(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'An unknown error occurred',
      });
    });

    it('should get a user and return 201 with user data', async () => {
      const userMock = {
        username: 'testuser',
        name: 'test user',
        email: 'test@user.com',
        birthdate: new Date('2000-01-01'),
        id: 1,
        role: 'USER',
        reward: {
          totalPoints: 1,
          level: 'BRONZE',
        },
      };

      (UserService.getUserById as jest.Mock).mockResolvedValue(userMock);

      req.params = {
        id: '1',
      };

      await userController.getUserByID(req as Request, res as Response);

      expect(UserService.getUserById).toHaveBeenCalledWith(1);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        user: userMock,
      });
    });
  });

  describe('updateUser', () => {
    it('should return 400 if id is not number', async () => {
      req.params = {
        id: 'testid',
      };
      await userController.updateUser(req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid user id',
        errors: expect.arrayContaining([
          expect.objectContaining({
            path: ['id'],
            code: 'custom',
            message: 'ID must be a positive integer',
          }),
        ]),
      });
    });

    it('should return 400 if validation fails', async () => {
      req.params = {
        id: '1',
      };
      req.body = {
        birthdate: 'testuser',
        name: 'Test User',
        email: 'test',
      };
      await userController.updateUser(req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: expect.arrayContaining([
          expect.objectContaining({
            path: ['birthdate'],
            code: 'custom',
            message: 'Invalid birthdate',
          }),
          expect.objectContaining({
            path: ['email'],
            code: 'invalid_format',
            message: 'Invalid email',
          }),
        ]),
      });
    });

    it('should return 404 if user is not found', async () => {
      (UserService.getUserById as jest.Mock).mockResolvedValue(undefined);
      req.params = {
        id: '1',
      };
      req.body = {
        birthdate: new Date('2000-01-01').toDateString(),
        name: 'Test User',
        email: 'test@email.com',
      };
      await userController.updateUser(req as Request, res as Response);
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'User not found.',
      });
    });

    it('should handle unknown errors gracefully', async () => {
      (UserService.getUserById as jest.Mock).mockRejectedValue('Some unknown error');

      req.params = {
        id: '1',
      };
      req.body = {
        birthdate: new Date().toDateString(),
        name: 'Test User',
        email: 'test@mail.com',
      };

      await userController.updateUser(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'An unknown error occurred',
      });
    });

    it('should return 200 when user is updated successfully', async () => {
      req.params = {
        id: '1',
      };
      req.body = {
        name: 'Test User',
      };
      const userMock = {
        username: 'testuser',
        name: 'test user',
        email: 'test@user.com',
        birthdate: new Date('2000-01-01'),
        id: 1,
        role: 'USER',
        reward: {
          totalPoints: 1,
          level: 'BRONZE',
        },
      };
      (UserService.getUserById as jest.Mock).mockResolvedValue(userMock);
      (UserService.updateUser as jest.Mock).mockResolvedValue(userMock);

      await userController.updateUser(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        user: userMock,
      });
    });
  });

  describe('getAllUsers', () => {
    it('should return 400 if limit or offset are not numbers', async () => {
      // (UserService.getAllUser as jest.Mock).mockRejectedValue('Some unknown error');
      req.query = { limit: 'limit' };
      await userController.getAllUsers(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: expect.arrayContaining([
          expect.objectContaining({
            path: ['limit'],
            code: 'custom',
            message: 'Limit must be a positive integer',
          }),
        ]),
      });
    });

    it('should handle unknown errors gracefully', async () => {
      (UserService.getAllUser as jest.Mock).mockRejectedValue('Some unknown error');
      req.query = {};
      await userController.getAllUsers(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'An unknown error occurred',
      });
    });

    it('should return 200 and the users founded', async () => {
      const userMock = {
        username: 'testuser',
        name: 'test user',
        email: 'test@user.com',
        birthdate: new Date('2000-01-01'),
        id: 1,
        role: 'USER',
        reward: {
          totalPoints: 1,
          level: 'BRONZE',
        },
      };

      req.query = {};
      (UserService.getAllUser as jest.Mock).mockResolvedValue([userMock]);
      await userController.getAllUsers(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: [userMock],
      });
    });
  });
});
