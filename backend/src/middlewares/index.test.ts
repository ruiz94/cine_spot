import * as middleware from './index';
const authMiddleware = require('./auth');

describe('Routes index exports', () => {
  it('should export authenticateToken from ./auth', () => {
    expect(middleware.authenticateToken).toBe(authMiddleware.authenticateToken);
  });
  it('should export opcionalAuth from ./auth', () => {
    expect(middleware.opcionalAuth).toBe(authMiddleware.opcionalAuth);
  });
  it('should export requireRole from ./auth', () => {
    expect(middleware.requireRole).toBe(authMiddleware.requireRole);
  });
});
