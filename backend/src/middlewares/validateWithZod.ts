import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

export function validateWithZod<T>(
  schema: ZodSchema<T>,
  property: 'body' | 'params' | 'query' = 'body'
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[property]);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: result.error.issues,
      });
    }
    // Opcional: asignar los datos parseados de vuelta a la request
    if (property === 'query') {
      Object.assign(req.query, result.data);
      req.body = { ...req.body, query: result.data }
    } else {
      req[property] = result.data;
    }
    next();
  };
}