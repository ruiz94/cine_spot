import { JWTUtils } from './jwt';
import jwt from 'jsonwebtoken';

describe('JWTUtils', () => {
  test('should generate and verify a token successfully', () => {
    const payload = { id: '123', username: 'admin', role: 'user' };
    const token = JWTUtils.generateToken(payload);
    expect(typeof token).toBe('string');

    const decoded = JWTUtils.verifyToken(token);
    expect(decoded.id).toBe(payload.id);
    expect(decoded.role).toBe(payload.role);
    expect(decoded.username).toBe(payload.username);
  });

  describe('verifyToken', () => {
    test('should throw error for expired token', () => {
      const payload = { id: '123', username: 'admin', role: 'user' };
      const token = JWTUtils.generateToken(payload);
      jest.useFakeTimers();
      jest.advanceTimersByTime(24 * 3600 * 1000 + 1000); // Avanzar el tiempo más allá del tiempo de expiración
      expect(() => JWTUtils.verifyToken(token)).toThrow('Token has expired');
    });

    test('should throw error for invalid token', () => {
      const token = 'invalid.token.here';
      expect(() => JWTUtils.verifyToken(token)).toThrow('Invalid token');
    });
    test('should throw error Token verification failed', () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('failed');
      });
      const token = 'invalid.token.here';
      expect(() => JWTUtils.verifyToken(token)).toThrow('Token verification failed');
    });
  });

  describe('extractTokenFromHeader', () => {
    test('should extract token from header', () => {
      const authHeader = 'Bearer sometoken123';
      const token = JWTUtils.extractTokenFromHeader(authHeader);
      expect(token).toBe('sometoken123');
    });

    test('should throw error for missing authorization header', () => {
      expect(() => JWTUtils.extractTokenFromHeader(undefined)).toThrow(
        'Authorization header missing',
      );
    });

    test('should throw error for invalid authorization header format', () => {
      expect(() => JWTUtils.extractTokenFromHeader('InvalidHeader sometoken123')).toThrow(
        'Invalid authorization header format. Expected: Bearer <token>',
      );
    });

    test('should throw error for missing token in authorization header', () => {
      expect(() => JWTUtils.extractTokenFromHeader('Bearer ')).toThrow(
        'Token missing in authorization header',
      );
    });
  });

  describe('decodeToken', () => {
    test('should decode token without verifying', () => {
      const payload = { id: '123', username: 'admin', role: 'user' };
      const token = JWTUtils.generateToken(payload);
      const decoded = JWTUtils.decodeToken(token);
      expect(decoded?.['id']).toBe(payload.id);
      expect(decoded?.['role']).toBe(payload.role);
      expect(decoded?.['username']).toBe(payload.username);
    });

    test('should decode token without verifying', () => {
      const token = 'invalid';
      const decoded = JWTUtils.decodeToken(token);
      expect(decoded).toBe(null);
    });

    test('should return null when an error with jwt decode function', () => {
      jest.spyOn(jwt, 'decode').mockImplementation(() => {
        throw new Error('Decode error');
      });
      const token = 'invalid';
      const decoded = JWTUtils.decodeToken(token);
      expect(decoded).toBe(null);
    });
  });
});
