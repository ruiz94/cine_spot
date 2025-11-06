import request from 'supertest';
import express from 'express';
import router from './auth';

// Mock the authController
jest.mock('../controllers', () => ({
  authController: {
    login: jest.fn((_, res) => res.status(200).json({ message: 'login called' })),
  },
}));

describe.only('Auth Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/auth', router);

  it('should call authController.login on POST /auth/login', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ username: 'test', password: 'test' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'login called' });
  });
});
