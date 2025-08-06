import { PasswordUtils } from '../utils/password';
import { prisma } from '../config';

/**
 * User Service - Manejo de usuarios con contraseñas seguras
 */
export class UserService {
  /**
   * Crear un nuevo usuario con contraseña cifrada
   */
  static async createUser(userData: {
    username: string;
    name: string;
    email: string;
    password: string;
    birthdate: Date;
  }) {
    try {
      // 1. Validar fortaleza de la contraseña
      const passwordValidation = PasswordUtils.validatePasswordStrength(userData.password);

      if (!passwordValidation.isValid) {
        throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
      }

      // 2. Cifrar la contraseña
      const hashedPassword = await PasswordUtils.hashPassword(userData.password);

      // 3. Crear el usuario en la base de datos
      const user = await prisma.user.create({
        data: {
          username: userData.username,
          name: userData.name,
          email: userData.email,
          password: hashedPassword, // ← Guardamos la contraseña cifrada
          birthdate: userData.birthdate,
          // Crear reward automáticamente
          reward: {
            create: {
              totalPoints: 0,
              level: 'BRONZE',
            },
          },
        },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          reward: true,
          // ❌ NO devolvemos la contraseña hasheada
        },
      });

      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create user: ${errorMessage}`);
    }
  }

  /**
   * Autenticar usuario (login)
   */
  static async authenticateUser(email: string, password: string) {
    try {
      // 1. Buscar usuario por email
      const user = await prisma.user.findUnique({
        where: { email },
        include: { reward: true },
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // 2. Verificar contraseña
      const isPasswordValid = await PasswordUtils.verifyPassword(password, user.password);

      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // 3. Devolver usuario sin contraseña
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Authentication failed: ${errorMessage}`);
    }
  }

  /**
   * Cambiar contraseña
   */
  static async changePassword(userId: number, currentPassword: string, newPassword: string) {
    try {
      // 1. Obtener usuario actual
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // 2. Verificar contraseña actual
      const isCurrentPasswordValid = await PasswordUtils.verifyPassword(
        currentPassword,
        user.password,
      );

      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // 3. Validar nueva contraseña
      const passwordValidation = PasswordUtils.validatePasswordStrength(newPassword);

      if (!passwordValidation.isValid) {
        throw new Error(`New password validation failed: ${passwordValidation.errors.join(', ')}`);
      }

      // 4. Cifrar nueva contraseña
      const hashedNewPassword = await PasswordUtils.hashPassword(newPassword);

      // 5. Actualizar en base de datos
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to change password: ${errorMessage}`);
    }
  }
}
