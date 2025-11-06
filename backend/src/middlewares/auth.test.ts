import express, { Response, Request } from 'express';
import request from 'supertest';
import { authenticateToken, requireRole, optionalAuth } from './auth';
import { JWTUtils } from '../utils';
process.env['NODE_ENV'] = 'test';
//Mock JWTUtils
jest.mock('../utils/jwt');

const app = express();
app.use(express.json());

describe('authenticateToken Middleware', () => {
  //example protected route
  app.get('/protected', authenticateToken, (_: Request, res: Response) => {
    res.status(200).json({ message: 'Access granted' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if Authorization header missing', async () => {
    (JWTUtils.extractTokenFromHeader as jest.Mock).mockImplementation(() => {
      throw new Error('Authorization header missing');
    });
    const res = await request(app).get('/protected');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Unauthorized');
    expect(res.body.error).toBe('Authentication failed');
  });

  it('should return 401 if token is invalid', async () => {
    (JWTUtils.extractTokenFromHeader as jest.Mock).mockImplementation(() => true);
    (JWTUtils.verifyToken as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const res = await request(app).get('/protected').set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Unauthorized');
  });

  it('should handle unknown error gracefully', async () => {
    jest.spyOn(JWTUtils, 'verifyToken').mockImplementation(() => {
      throw 'algo inesperado';
    });

    const res = await request(app).get('/protected').set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Unauthorized');
    expect(res.body.error).toBe('Authentication failed');
  });

  it('should call next and set req.user if token is valid', async () => {
    (JWTUtils.extractTokenFromHeader as jest.Mock).mockReturnValue('validtoken');
    (JWTUtils.verifyToken as jest.Mock).mockReturnValue({
      userId: '1',
      email: 'test@test.com',
      role: 'USER',
    });

    const res = await request(app).get('/protected').set('Authorization', 'Bearer validtoken');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Access granted');
  });
});

describe('requireRole Middleware', () => {
  //example protected route
  app.get(
    '/role-protected',
    authenticateToken,
    requireRole(['admin']),
    (_: Request, res: Response) => {
      res.status(200).json({ message: 'Access granted' });
    },
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if user not authenticated', async () => {
    (JWTUtils.verifyToken as jest.Mock).mockReturnValue(null);
    const res = await request(app).get('/role-protected');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Authentication required');
  });

  it('should return 403 if user not have required role', async () => {
    (JWTUtils.verifyToken as jest.Mock).mockReturnValue({
      userId: '1',
      email: 'test@test.com',
      role: 'USER',
    });
    const res = await request(app).get('/role-protected');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Insufficient permissions');
    expect(res.body.required).toEqual(['admin']);
    expect(res.body.current).toBe('USER');
  });
});

describe('optionalAuth Middleware', () => {
  //example protected route
  app.get('/optional-protected', optionalAuth, (req: Request, res: Response) => {
    res.status(200).json({ message: 'Access granted', user: req.user });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should pass if it has a valid token ', async () => {
    const mockReturnUser = { userId: '1', email: 'test@mail.com', role: 'USER' };
    (JWTUtils.extractTokenFromHeader as jest.Mock).mockReturnValue('validtoken');
    (JWTUtils.verifyToken as jest.Mock).mockReturnValue(mockReturnUser);
    const res = await request(app)
      .get('/optional-protected')
      .set('Authorization', 'Bearer invalidtoken');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Access granted');
    expect(res.body.user).toEqual(mockReturnUser);
  });

  it('should pass if it has not a valid token, but no user ir returned ', async () => {
    const res = await request(app).get('/optional-protected');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Access granted');
    expect(res.body.user).toBeUndefined();
  });
});
