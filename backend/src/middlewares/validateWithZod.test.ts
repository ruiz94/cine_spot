import express, { Request, Response } from 'express';
import request from 'supertest';
import { validateWithZod } from "./validateWithZod";
import { validateParamID } from "@/utils/schemas/generic";

const app = express();
app.use(express.json());

describe('validateWithZod', () => {

  describe('error', () => {
    app.get('/protected', validateWithZod(validateParamID, 'params'), (req: Request, res: Response) => {
      res.status(200).json({ message: 'Access granted' });
    });

    test('return 400 if validations failed', async () => {
      const res = await request(app).get('/protected');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body.errors).toEqual([{
              path: ['id'],
              code: 'invalid_type',
              expected: "string",
              message: 'Invalid input: expected string, received undefined',
            }])
    })
  })

  describe('success', () => {
    app.get('/protected/:id', validateWithZod(validateParamID, 'params'), (req: Request, res: Response) => {
      res.status(200).json({ success: true, message: 'Access granted', id: req.params["id"] });
    });

    test('return id in the params', async () => {
      const res = await request(app).get('/protected/1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.id).toBe(1);
    })
  })
})