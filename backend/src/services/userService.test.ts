import { UserService } from './userService';
import { PasswordUtils } from '../utils';
import { prisma } from '../config';

jest.mock('../utils');
jest.mock('../config', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

const mockUserData = {
  username: 'testuser',
  name: 'Test User',
  email: 'test@example.com',
  password: 'StrongPassw0rd!',
  birthdate: new Date('2000-01-01'),
};

const mockUserReturn = {
  id: 1,
  username: 'testuser',
  name: 'Test User',
  email: 'test@example.com',
  role: 'USER',
  createdAt: new Date(),
  reward: {
    totalPoints: 0,
    level: 'BRONZE',
  },
};

describe('UserService.createUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a user with valid data', async () => {
    (PasswordUtils.validatePasswordStrength as jest.Mock).mockReturnValue({
      isValid: true,
      errors: [],
    });
    (PasswordUtils.hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
    (prisma.user.create as jest.Mock).mockResolvedValue(mockUserReturn);

    const result = await UserService.createUser(mockUserData);

    expect(PasswordUtils.validatePasswordStrength).toHaveBeenCalledWith(mockUserData.password);
    expect(PasswordUtils.hashPassword).toHaveBeenCalledWith(mockUserData.password);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        username: mockUserData.username,
        name: mockUserData.name,
        email: mockUserData.email,
        password: 'hashedPassword',
        birthdate: mockUserData.birthdate,
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
      },
    });
    expect(result).toEqual(mockUserReturn);
  });

  it('should throw an error if password is not strong', async () => {
    (PasswordUtils.validatePasswordStrength as jest.Mock).mockReturnValue({
      isValid: false,
      errors: ['Too short'],
    });

    await expect(UserService.createUser(mockUserData)).rejects.toThrow(
      /Password validation failed: Too short/,
    );
    expect(PasswordUtils.hashPassword).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('should throw an error if prisma.user.create fails', async () => {
    (PasswordUtils.validatePasswordStrength as jest.Mock).mockReturnValue({
      isValid: true,
      errors: [],
    });
    (PasswordUtils.hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
    (prisma.user.create as jest.Mock).mockRejectedValue(new Error('DB error'));

    await expect(UserService.createUser(mockUserData)).rejects.toThrow(
      /Failed to create user: DB error/,
    );
  });

  it('should throw a generic error if an unknown error occurs', async () => {
    (PasswordUtils.validatePasswordStrength as jest.Mock).mockImplementation(() => {
      throw 'unexpected';
    });

    await expect(UserService.createUser(mockUserData)).rejects.toThrow(
      /Failed to create user: Unknown error/,
    );
  });
});

describe('UserService.authenticateUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('should authenticate user with correct credentials', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      ...mockUserReturn,
      password: 'hashedPassword',
    });
    (PasswordUtils.verifyPassword as jest.Mock).mockResolvedValue(true);

    const result = await UserService.authenticateUser(mockUserData.email, mockUserData.password);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: mockUserData.email },
      include: { reward: true },
    });
    expect(PasswordUtils.verifyPassword).toHaveBeenCalledWith(
      mockUserData.password,
      'hashedPassword',
    );
    expect(result).toEqual(mockUserReturn);
  });

  test('should return User not found if user is not found', async () => {
    (PasswordUtils.verifyPassword as jest.Mock).mockReturnValue(false);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(false);

    await expect(UserService.authenticateUser('', '')).rejects.toThrow(/User not found/);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: '' },
      include: { reward: true },
    });
    expect(PasswordUtils.verifyPassword).not.toHaveBeenCalled();
  });

  test('should return Authentication failed: Unknown error if an error with prisma has occurred', async () => {
    (prisma.user.findUnique as jest.Mock).mockImplementation(() => {
      throw 'unexpected';
    });

    await expect(
      UserService.authenticateUser(mockUserData.email, mockUserData.password),
    ).rejects.toThrow(/Authentication failed: Unknown error/);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: mockUserData.email },
      include: { reward: true },
    });
  });

  test('should return Invalid credentials if password is incorrect', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      ...mockUserReturn,
      password: 'hashedPassword',
    });
    (PasswordUtils.verifyPassword as jest.Mock).mockResolvedValue(false);

    // const result = await UserService.authenticateUser(mockUserData.email, 'WrongPassword');
    await expect(UserService.authenticateUser(mockUserData.email, 'WrongPassword')).rejects.toThrow(
      /Invalid credentials/,
    );
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: mockUserData.email },
      include: { reward: true },
    });
    expect(PasswordUtils.verifyPassword).toHaveBeenCalledWith('WrongPassword', 'hashedPassword');
  });

  test('should throw a generic error if an unknown error occurs', async () => {
    (prisma.user.findUnique as jest.Mock).mockImplementation(() => {
      throw 'unexpected';
    });

    await expect(
      UserService.authenticateUser(mockUserData.email, mockUserData.password),
    ).rejects.toThrow(/Authentication failed: Unknown error/);
  });
});

describe('UserService.changePassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Should throw user not fund error if user is not found', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(UserService.changePassword(1, 'oldPass', 'newPass')).rejects.toThrow(
      /User not found/,
    );
    expect(PasswordUtils.verifyPassword).not.toHaveBeenCalled();
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  test('should return Current password is incorrect if current password does not match', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      ...mockUserReturn,
      password: 'hashedPassword',
    });
    (PasswordUtils.verifyPassword as jest.Mock).mockResolvedValue(false);

    await expect(UserService.changePassword(1, 'oldPass', 'newPass')).rejects.toThrow(
      /Current password is incorrect/,
    );
    expect(PasswordUtils.verifyPassword).toHaveBeenCalledWith('oldPass', 'hashedPassword');
  });

  test('should return New password validation failed: Too weak if new password is too week', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      ...mockUserReturn,
      password: 'hashedPassword',
    });
    (PasswordUtils.validatePasswordStrength as jest.Mock).mockReturnValue({
      isValid: false,
      errors: ['Too weak'],
    });
    (PasswordUtils.verifyPassword as jest.Mock).mockResolvedValue(true);

    await expect(UserService.changePassword(1, 'hashedPassword', 'newPass')).rejects.toThrow(
      /New password validation failed: Too weak/,
    );
    expect(PasswordUtils.validatePasswordStrength).toHaveBeenCalledWith('newPass');
  });

  test('should change password successfully', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      ...mockUserReturn,
      password: 'hashedPassword',
    });
    (prisma.user.update as jest.Mock).mockResolvedValue(true);
    (PasswordUtils.validatePasswordStrength as jest.Mock).mockReturnValue({
      isValid: true,
      errors: [],
    });
    (PasswordUtils.verifyPassword as jest.Mock).mockResolvedValue(true);
    (PasswordUtils.hashPassword as jest.Mock).mockResolvedValue('newHashedPassword');

    await expect(UserService.changePassword(1, 'currentPassword', 'newPass')).resolves.toEqual({
      success: true,
      message: 'Password updated successfully',
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(PasswordUtils.verifyPassword).toHaveBeenCalledWith('currentPassword', 'hashedPassword');
    expect(PasswordUtils.hashPassword).toHaveBeenCalledWith('newPass');
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { password: 'newHashedPassword' },
    });
    expect(PasswordUtils.validatePasswordStrength).toHaveBeenCalledWith('newPass');
  });
});

describe('UserService.getUserById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return User not found if user does not exist', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(UserService.getUserById(1)).rejects.toThrow(/User not found/);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
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
  });

  test('should return Failed to get user', async () => {
    (prisma.user.findUnique as jest.Mock).mockImplementation(() => {
      throw 'unexpected';
    });

    await expect(UserService.getUserById(1)).rejects.toThrow(/Failed to get user/);
  });

  test('should return a user', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserReturn);

    await expect(UserService.getUserById(1)).resolves.toEqual(mockUserReturn);
  });
});

describe('UserService.getAllUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return all Users', async () => {
    (prisma.user.findMany as jest.Mock).mockResolvedValue([mockUserReturn]);

    await expect(UserService.getAllUser()).resolves.toEqual([mockUserReturn]);
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 20,
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
  });

  test('should return Failed to get user', async () => {
    (prisma.user.findMany as jest.Mock).mockImplementation(() => {
      throw 'unexpected';
    });

    await expect(UserService.getAllUser()).rejects.toThrow(/Failed to get users/);
  });
});

describe('UserService.updateUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should update a user successfully', async () => {
    (prisma.user.update as jest.Mock).mockResolvedValue(mockUserReturn);
    const mockData = {
      name: 'Test name',
      email: 'test@email.com',
      birthdate: new Date('12/12/2000'),
    };
    await expect(UserService.updateUser(1, mockData)).resolves.toEqual(mockUserReturn);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: mockData,
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
  });

  test('should return Failed when no fields are passed', async () => {
    await expect(UserService.updateUser(1, {})).rejects.toThrow(/No valid fields to update/);
  });

  test('should return Email already exists', async () => {
    (prisma.user.update as jest.Mock).mockRejectedValue({
      code: 'P2002',
    });
    const mockData = {
      name: 'Test name',
      email: 'test@email.com',
      birthdate: new Date('12/12/2000'),
    };
    await expect(UserService.updateUser(1, mockData)).rejects.toThrow(/Email already exists/);
  });
});
