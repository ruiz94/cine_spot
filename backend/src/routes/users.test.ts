import request from 'supertest';
import express, { NextFunction } from 'express';
import router from './users';

const userMock = {
  username: 'testuser',
  name: 'test user',
  email: 'test@user.com',
  birthdate: '2000-01-01',
  id: 1,
  role: 'ADMIN',
  reward: {
    totalPoints: 1,
    level: 'BRONZE',
  },
};
jest.mock('../middlewares', () => ({
  requireRole: () => (req: Response, res: Request, next: NextFunction) => next(),
}));
//mock the userController
jest.mock('../controllers', () => ({
  userController: {
    getUserByID: jest.fn((_, res) =>
      res.status(200).json({
        success: true,
        user: userMock,
      }),
    ),
    getAllUsers: jest.fn((_, res) =>
      res.status(200).json({
        success: true,
        user: [userMock],
      }),
    ),
    updateUser: jest.fn((_, res) =>
      res.status(200).json({
        success: true,
        user: userMock,
      }),
    ),
  },
}));

describe('User Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/users', router);

  // it('should call userController.createUser on POST /users/register', async () => {
  //   const response = await request(app).post('/users/register').send({
  //     username: 'test',
  //     name: 'Test User',
  //     email: 'test@test.com',
  //     password: 'Test@1234',
  //     birthdate: '1990-01-01',
  //   });

  //   expect(response.status).toBe(200);
  //   expect(response.body).toEqual({
  //     success: true,
  //     message: 'User created successfully',
  //     user: {},
  //   });
  // });

  it('should call userController.getUserByID on GET /users/1', async () => {
    const response = await request(app).get('/users/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      user: userMock,
    });
  });

  it('should call userController.getAllUsers on GET /users', async () => {
    const response = await request(app).get('/users').query({ limit: 10, offset: 0 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      user: [userMock],
    });
  });

  it('should call userController.updateUser on PATCH /users/1', async () => {
    const response = await request(app).patch('/users/1').send({ name: 'test' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      user: userMock,
    });
  });
});
