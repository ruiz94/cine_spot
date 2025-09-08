import request from 'supertest';
import express from 'express';
import router from './users';

const userMock = {
  username: 'testuser',
  name: 'test user',
  email: 'test@user.com',
  birthdate: '2000-01-01',
  id: 1,
  role: 'USER',
  reward: {
    totalPoints: 1,
    level: 'BRONZE',
  },
};
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

  it('should call userController.getUserByID on GET /users/find/1', async () => {
    const response = await request(app).get('/users/find/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      user: userMock,
    });
  });

  it('should call userController.getAllUsers on GET /users/getAll', async () => {
    const response = await request(app).get('/users/getAll');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      user: [userMock],
    });
  });

  it('should call userController.updateUser on PUT /users/update/1', async () => {
    const response = await request(app).put('/users/update/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      user: userMock,
    });
  });
});
