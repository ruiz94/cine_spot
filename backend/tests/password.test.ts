import { PasswordUtils } from '@/utils/password';

/**
 * Tests para Password Utils
 */
describe('PasswordUtils', () => {
  describe('hashPassword', () => {
    test('should hash a valid password', async () => {
      const plainPassword = 'MySecurePassword123!';
      const hashedPassword = await PasswordUtils.hashPassword(plainPassword);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword.length).toBeGreaterThan(50); // bcrypt hashes are long
    });

    test('should throw error for empty password', async () => {
      await expect(PasswordUtils.hashPassword('')).rejects.toThrow('Password cannot be empty');
    });

    test('should throw error for short password', async () => {
      await expect(PasswordUtils.hashPassword('short')).rejects.toThrow(
        'Password must be at least 8 characters long',
      );
    });
  });

  describe('verifyPassword', () => {
    test('should verify correct password', async () => {
      const plainPassword = 'MySecurePassword123!';
      const hashedPassword = await PasswordUtils.hashPassword(plainPassword);

      const isValid = await PasswordUtils.verifyPassword(plainPassword, hashedPassword);
      expect(isValid).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const plainPassword = 'MySecurePassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hashedPassword = await PasswordUtils.hashPassword(plainPassword);

      const isValid = await PasswordUtils.verifyPassword(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });

    test('should handle empty passwords', async () => {
      const isValid = await PasswordUtils.verifyPassword('', 'somehash');
      expect(isValid).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    test('should validate strong password', () => {
      const strongPassword = 'ReallySecurePa1!';
      const result = PasswordUtils.validatePasswordStrength(strongPassword);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.score).toBeGreaterThan(70);
    });

    test('should reject weak password', () => {
      const weakPassword = 'password';
      const result = PasswordUtils.validatePasswordStrength(weakPassword);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.score).toBeLessThan(50);
    });

    test('should detect common patterns', () => {
      const commonPassword = 'password123';
      const result = PasswordUtils.validatePasswordStrength(commonPassword);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password contains common patterns');
    });
  });
});
