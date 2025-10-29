import { Role, RewardLevel } from '@prisma/client';

export const mockUser = {
  id: 1,
  name: 'John Doe',
  username: 'johndoe123',
  email: 'john.doe@example.com',
  password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456789', // hashed password
  birthdate: new Date('1990-05-15'),
  role: Role.USER,
  createdAt: new Date('2024-01-15T10:30:00Z'),
  reward: {
    id: 1,
    userId: 1,
    totalPoints: 250,
    level: RewardLevel.SILVER,
    createdAt: new Date('2024-01-15T10:35:00Z'),
    updatedAt: new Date('2024-10-20T14:22:00Z'),
  },
};

export const mockAdminUser = {
  id: 2,
  name: 'Jane Smith',
  username: 'janeadmin',
  email: 'jane.admin@cinespot.com',
  password: '$2b$10$zyxwvutsrqponmlkjihgfedcba987654321',
  birthdate: new Date('1985-03-22'),
  role: Role.ADMIN,
  createdAt: new Date('2024-01-01T08:00:00Z'),
  reward: {
    id: 2,
    userId: 2,
    totalPoints: 1500,
    level: RewardLevel.PLATINUM,
    createdAt: new Date('2024-01-01T08:05:00Z'),
    updatedAt: new Date('2024-10-25T16:45:00Z'),
  },
};

export const mockNewUser = {
  id: 3,
  name: 'Alice Johnson',
  username: 'alicej',
  email: 'alice.johnson@gmail.com',
  password: '$2b$10$newuserhashedpassword123456789',
  birthdate: new Date('1995-12-08'),
  role: Role.USER,
  createdAt: new Date('2024-10-20T12:00:00Z'),
  reward: {
    id: 3,
    userId: 3,
    totalPoints: 0,
    level: RewardLevel.BRONZE,
    createdAt: new Date('2024-10-20T12:01:00Z'),
    updatedAt: new Date('2024-10-20T12:01:00Z'),
  },
};
