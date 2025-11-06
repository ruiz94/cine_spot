import { PasswordUtils } from '../utils';
import { prisma } from '../config';
import { User } from '@prisma/client';

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
        throw new Error('User not found');
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

  /**
   * Obtener todos los usuarios
   */
  static async getAllUser(limit = 20, offset = 0) {
    // Add pagination: default limit 20, offset 0
    try {
      // const limit = 20;
      // const offset = 0;
      const users = await prisma.user.findMany({
        skip: offset,
        take: limit,
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          role: true,
          birthdate: true,
          reward: {
            select: {
              totalPoints: true,
              level: true,
            },
          },
        },
        orderBy: { id: 'asc' },
      });
      return users;
    } catch (error) {
      // Optionally log error here
      throw new Error(error instanceof Error ? error.message : 'Failed to get users');
    }
  }

  /**
   * Obtener usuario por ID (util para rutas protegidas)
   */
  static async getUserById(userId: number) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          role: true,
          birthdate: true,
          reward: {
            select: {
              totalPoints: true,
              level: true,
            },
          },
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get user');
    }
  }

  /**
   * Actualizar datos del usuario
   */
  static async updateUser(userId: number, data: Partial<User>) {
    try {
      const updateData: Partial<Pick<User, 'name' | 'email' | 'birthdate'>> = {};
      if ('name' in data && data.name !== undefined) updateData['name'] = data.name;
      if ('email' in data && data.email !== undefined) updateData['email'] = data.email;
      if ('birthdate' in data && data.birthdate !== undefined) {
        updateData['birthdate'] =
          typeof data.birthdate === 'string' ? new Date(data.birthdate) : data.birthdate;
      }
      if (Object.keys(updateData).length === 0) {
        throw new Error('No valid fields to update');
      }
      const userUpdated = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          role: true,
          birthdate: true,
          reward: {
            select: {
              totalPoints: true,
              level: true,
            },
          },
        },
      });
      return userUpdated;
    } catch (error: unknown) {
      // Handle unique constraint errors (e.g., duplicate email)
      if (typeof error === 'object' && error !== null && 'code' in error) {
        if (error.code === 'P2002') {
          throw new Error('Email already exists');
        }
      }
      throw new Error(error instanceof Error ? error.message : 'Failed to update user');
    }
  }
}
