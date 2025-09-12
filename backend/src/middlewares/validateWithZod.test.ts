import express, { Request, Response } from 'express';
import request from 'supertest';
import { validateWithZod } from './validateWithZod';
import { validateParamID, validateLimitOffset } from '../utils/schemas/generic';
import { createRoomSchema } from '../utils/schemas/rooms';

const app = express();
app.use(express.json());

describe('validateWithZod', () => {
  describe('error', () => {
    app.get(
      '/protected',
      validateWithZod(validateParamID, 'params'),
      (req: Request, res: Response) => {
        res.status(200).json({ message: 'Access granted' });
      },
    );

    test('return 400 if validations failed', async () => {
      const res = await request(app).get('/protected');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body.errors).toEqual([
        {
          path: ['id'],
          code: 'invalid_type',
          expected: 'string',
          message: 'Invalid input: expected string, received undefined',
        },
      ]);
    });
  });

  describe('success:params', () => {
    app.get(
      '/protected/:id',
      validateWithZod(validateParamID, 'params'),
      (req: Request, res: Response) => {
        res.status(200).json({ success: true, message: 'Access granted', id: req.body.params.id });
      },
    );

    test('return id in the params', async () => {
      const res = await request(app).get('/protected/1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.id).toBe(1);
    });
  });

  describe('success:query', () => {
    app.get(
      '/rooms',
      validateWithZod(validateLimitOffset, 'query'),
      (req: Request, res: Response) => {
        res.status(200).json({
          success: true,
          message: 'Access granted',
          query: {
            limit: req.body.query.limit,
            offset: req.body.query.offset,
          },
        });
      },
    );

    test('return limit and offset in the query params', async () => {
      const res = await request(app).get('/rooms?limit=10&offset=0');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.query.limit).toBe(10);
      expect(res.body.query.offset).toBe(0);
    });
  });

  describe('success:body', () => {
    app.post('/rooms', validateWithZod(createRoomSchema, 'body'), (req: Request, res: Response) => {
      res
        .status(200)
        .json({
          success: true,
          message: 'Access granted',
          name: req.body.name,
          capacity: req.body.capacity,
        });
    });

    test('return name and capacity in the body', async () => {
      const res = await request(app).post('/rooms').send({ name: 'A1', capacity: 10 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.name).toBe('A1');
      expect(res.body.capacity).toBe(10);
    });
  });
});
