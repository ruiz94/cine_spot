import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

export function validateWithZod<T>(
  schema: ZodSchema<T>,
  property: 'body' | 'params' | 'query' = 'body',
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
    if (property === 'query') {
      Object.assign(req.query, result.data);
      req.body = { ...req.body, query: result.data };
    } else if (property === 'params') {
      req.body = { ...req.body, params: result.data };
    } else {
      req[property] = { ...req.body, ...result.data };
    }
    next();
  };
}
