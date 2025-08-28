import * as routes from './index';
const usersModule = require('./users');
const authModule = require('./auth');

describe('Routes index exports', () => {
  it('should export userRoutes from ./users', () => {
    expect(routes.userRoutes).toBe(usersModule.default);
  });

  it('should export authRoutes from ./auth', () => {
    expect(routes.authRoutes).toBe(authModule.default);
  });
});
