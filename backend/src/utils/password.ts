import bcrypt from 'bcrypt';

/**
 * Utilities for password hashing and verification
 */
export class PasswordUtils {
  private static readonly SALT_ROUNDS = 12; // Número de rondas de salt (más alto = más seguro pero más lento)

  /**
   * Cifra una contraseña usando bcrypt
   * @param plainPassword - Contraseña en texto plano
   * @returns Promise<string> - Contraseña hasheada
   */
  static async hashPassword(plainPassword: string): Promise<string> {
    try {
      // Validar que la contraseña no esté vacía
      if (!plainPassword || plainPassword.trim().length === 0) {
        throw new Error('Password cannot be empty');
      }

      // Validar longitud mínima
      if (plainPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Generar salt y hashear la contraseña
      const hashedPassword = await bcrypt.hash(plainPassword, this.SALT_ROUNDS);
      return hashedPassword;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Error hashing password: ${errorMessage}`);
    }
  }

  /**
   * Verifica si una contraseña coincide con el hash almacenado
   * @param plainPassword - Contraseña en texto plano
   * @param hashedPassword - Hash almacenado en la base de datos
   * @returns Promise<boolean> - true si coinciden, false si no
   */
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      if (!plainPassword || !hashedPassword) {
        return false;
      }

      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      return isMatch;
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }

  /**
   * Valida que una contraseña cumpla con los requisitos de seguridad
   * @param password - Contraseña a validar
   * @returns Object con resultado de validación
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
    score: number; // 0-100
  } {
    const errors: string[] = [];
    let score = 0;

    // Longitud mínima
    if (!password || password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else {
      score += 20;
    }

    // Contiene al menos una letra minúscula
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else {
      score += 15;
    }

    // Contiene al menos una letra mayúscula
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else {
      score += 15;
    }

    // Contiene al menos un número
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    } else {
      score += 15;
    }

    // Contiene al menos un carácter especial
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    } else {
      score += 15;
    }

    // Bonus por longitud extra
    if (password && password.length >= 12) {
      score += 10;
    }

    // Penalty por patrones comunes
    const commonPatterns = ['123', 'abc', 'password', 'qwerty'];
    if (commonPatterns.some((pattern) => password.toLowerCase().includes(pattern))) {
      score -= 20;
      errors.push('Password contains common patterns');
    }

    return {
      isValid: errors.length === 0,
      errors,
      score: Math.max(0, Math.min(100, score)),
    };
  }
}
