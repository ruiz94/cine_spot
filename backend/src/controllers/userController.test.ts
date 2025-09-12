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
        message: 'Failed to create the user.',
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
        message: 'Failed to create the user.',
      });
    });
  });

  describe('getUserByID', () => {
    it('should return error when user is not found', async () => {
      (UserService.getUserById as jest.Mock).mockResolvedValue(undefined);

      req.body.params = {
        id: 1,
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

      req.body.params = {
        id: 1,
      };

      await userController.getUserByID(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to get the user.',
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

      req.body.params = {
        id: 1,
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
    it('should return 404 if user is not found', async () => {
      (UserService.getUserById as jest.Mock).mockResolvedValue(undefined);

      req.body = {
        birthdate: new Date('2000-01-01').toDateString(),
        name: 'Test User',
        email: 'test@email.com',
        params: {
          id: 1,
        },
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

      req.body = {
        birthdate: new Date().toDateString(),
        name: 'Test User',
        email: 'test@mail.com',
        params: {
          id: 1,
        },
      };

      await userController.updateUser(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to update the user.',
      });
    });

    it('should return 200 when user is updated successfully', async () => {
      req.body = {
        name: 'Test User',
        params: {
          id: 1,
        },
      };
      const userMock = {
        username: 'testuser',
        name: 'Test User',
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
    it('should handle unknown errors gracefully', async () => {
      (UserService.getAllUser as jest.Mock).mockRejectedValue('Some unknown error');
      req.body.query = { limit: '10', offset: '0' };
      await userController.getAllUsers(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to get users.',
      });
    });

    it('should return 400 when fails', async () => {
      (UserService.getAllUser as jest.Mock).mockRejectedValue(new Error('Some unknown error'));
      req.body.query = { limit: '10', offset: '0' };
      await userController.getAllUsers(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to get users.',
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

      req.body.query = { limit: '10', offset: '0' };
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
