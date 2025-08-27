import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '@prisma/client';

export interface JWTPayload extends Omit<User, 'password'> {}

export class JWTUtils {
  /**
   * Generar un token JWT
   * **/
  static generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });
  }

  /**
   * Verificar y decodificar un token WT
   */
  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw new Error('Token verification failed');
    }
  }

  /**
   * Extraer token del header Authorization
   */
  static extractTokenFromHeader(authHeader: string | undefined): string {
    if (!authHeader) {
      throw new Error('Authorization header missing');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid authorization header format. Expected: Bearer <token>');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new Error('Token missing in authorization header');
    }

    return token;
  }

  /**
   * Decodificar token sin verificar (útil para debugging)
   */
  static decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (error) {
      console.log(error instanceof Error && error.message);
      return null;
    }
  }
}
