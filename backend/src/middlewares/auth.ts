import { Request, Response, NextFunction } from 'express';
import { JWTUtils, JWTPayload } from '../utils/jwt';

//Extender el tipo Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware para verificar autenticación JWT
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    //1. Extraer token del header
    const token = JWTUtils.extractTokenFromHeader(req.headers.authorization);

    //2. verificar y decodificar el token
    const payload = JWTUtils.verifyToken(token);

    //3. Agregar información del usuario al request
    req.user = payload;

    //4. continuar con el siguiente middleware
    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed';
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
      error: message,
    });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      //verificar que el usuario esté autenticado

      console.log('🚀 ~ requireRole ~ req.user:', req.user);
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      //Verificar que el usuario tenga el rol necesario
      if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required: allowedRoles,
          current: req.user.role,
        });
      }

      next();
    } catch (error) {
      console.log(error instanceof Error && error.message);
      res.status(500).json({
        success: false,
        message: 'Authorization check failed',
      });
    }
  };
};

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
export const opcionalAuth = (req: Request, _: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = JWTUtils.extractTokenFromHeader(authHeader);
      const payload = JWTUtils.verifyToken(token);
      req.user = payload;
    }

    //Siempre continua, con o sin autenticación
    next();
  } catch (error) {
    //si hay error, simplemente continúa sin usuario autenticado
    console.log(error instanceof Error && error.message);
    next();
  }
};
