import request from 'supertest';
import express from 'express';
import router from './users';

//mock the userController
jest.mock('../controllers', () => ({
  userController: {
    createUser: jest.fn((_, res) =>
      res.status(200).json({
        success: true,
        message: 'User created successfully',
        user: {},
      }),
    ),
  },
}));

describe('User Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/users', router);

  it('should call userController.createUser on POST /users/register', async () => {
    const response = await request(app)
      .post('/users/register')
      .send({
        username: 'test',
        name: 'Test User',
        email: 'test@test.com',
        password: 'Test@1234',
        birthdate: '1990-01-01',
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'User created successfully',
      user: {},
    });
  });
});
