import { TicketStatus } from '@prisma/client';

export const mockTicket = {
  id: 1,
  userId: 1,
  status: TicketStatus.SOLD,
  seatNumber: 'A5',
  basePrice: 12.5,
  discountId: null,
  total: 12.5,
  scheduleId: 1,
  createdAt: new Date('2024-10-25T19:30:00Z'),
  schedule: {
    id: 1,
    startTime: '2024-10-26T20:00:00',
    roomId: 1,
    soldAmount: 15,
    movieId: 1,
    createdAt: new Date('2024-10-20T10:00:00Z'),
    updatedAt: new Date('2024-10-25T19:30:00Z'),
    movie: {
      id: 1,
      name: 'The Dark Knight',
      minutes: 152,
      category: 'Action',
      createdAt: new Date('2024-09-15T08:00:00Z'),
      updatedAt: new Date('2024-09-15T08:00:00Z'),
    },
    room: {
      id: 1,
      name: 'Room A',
      capacity: 50,
      createdAt: new Date('2024-01-10T12:00:00Z'),
      updatedAt: new Date('2024-01-10T12:00:00Z'),
    },
  },
  user: {
    id: 1,
    username: 'johndoe123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    birthdate: new Date('1990-05-15'),
    role: 'USER' as const,
    createdAt: new Date('2024-01-15T10:30:00Z'),
  },
};

export const mockTicketWithDiscount = {
  id: 2,
  userId: 2,
  status: TicketStatus.SOLD,
  seatNumber: 'B12',
  basePrice: 15.0,
  discountId: 1,
  total: 12.0, // 20% discount applied
  scheduleId: 2,
  createdAt: new Date('2024-10-25T14:15:00Z'),
  schedule: {
    id: 2,
    startTime: '2024-10-27T18:30:00',
    roomId: 2,
    soldAmount: 8,
    movieId: 2,
    createdAt: new Date('2024-10-22T09:00:00Z'),
    updatedAt: new Date('2024-10-25T14:15:00Z'),
    movie: {
      id: 2,
      name: 'Inception',
      minutes: 148,
      category: 'Sci-Fi',
      createdAt: new Date('2024-09-10T10:30:00Z'),
      updatedAt: new Date('2024-09-10T10:30:00Z'),
    },
    room: {
      id: 2,
      name: 'Room B',
      capacity: 75,
      createdAt: new Date('2024-01-10T12:00:00Z'),
      updatedAt: new Date('2024-01-10T12:00:00Z'),
    },
  },
  user: {
    id: 2,
    username: 'janesmith',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    birthdate: new Date('1988-03-22'),
    role: 'USER' as const,
    createdAt: new Date('2024-02-01T08:00:00Z'),
  },
};

export const mockRedeemedTicket = {
  id: 3,
  userId: 1,
  status: TicketStatus.REDEEMED,
  seatNumber: 'C8',
  basePrice: 18.0,
  discountId: null,
  total: 18.0,
  scheduleId: 3,
  createdAt: new Date('2024-10-20T16:45:00Z'),
  schedule: {
    id: 3,
    startTime: '2024-10-21T21:15:00',
    roomId: 1,
    soldAmount: 22,
    movieId: 3,
    createdAt: new Date('2024-10-18T11:00:00Z'),
    updatedAt: new Date('2024-10-20T16:45:00Z'),
    movie: {
      id: 3,
      name: 'Avengers: Endgame',
      minutes: 181,
      category: 'Action',
      createdAt: new Date('2024-09-05T14:20:00Z'),
      updatedAt: new Date('2024-09-05T14:20:00Z'),
    },
    room: {
      id: 1,
      name: 'Room A',
      capacity: 50,
      createdAt: new Date('2024-01-10T12:00:00Z'),
      updatedAt: new Date('2024-01-10T12:00:00Z'),
    },
  },
  user: {
    id: 1,
    username: 'johndoe123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    birthdate: new Date('1990-05-15'),
    role: 'USER' as const,
    createdAt: new Date('2024-01-15T10:30:00Z'),
  },
};

export const mockCancelledTicket = {
  id: 4,
  userId: 3,
  status: TicketStatus.CANCELLED,
  seatNumber: 'D15',
  basePrice: 14.0,
  discountId: 2,
  total: 11.2, // 20% discount applied
  scheduleId: 4,
  createdAt: new Date('2024-10-18T13:20:00Z'),
  schedule: {
    id: 4,
    startTime: '2024-10-19T16:00:00',
    roomId: 3,
    soldAmount: 5,
    movieId: 4,
    createdAt: new Date('2024-10-15T15:30:00Z'),
    updatedAt: new Date('2024-10-18T13:20:00Z'),
    movie: {
      id: 4,
      name: 'The Matrix',
      minutes: 136,
      category: 'Sci-Fi',
      createdAt: new Date('2024-08-30T09:15:00Z'),
      updatedAt: new Date('2024-08-30T09:15:00Z'),
    },
    room: {
      id: 3,
      name: 'Room C',
      capacity: 30,
      createdAt: new Date('2024-01-10T12:00:00Z'),
      updatedAt: new Date('2024-01-10T12:00:00Z'),
    },
  },
  user: {
    id: 3,
    username: 'alicej',
    name: 'Alice Johnson',
    email: 'alice.johnson@gmail.com',
    birthdate: new Date('1995-12-08'),
    role: 'USER' as const,
    createdAt: new Date('2024-10-20T12:00:00Z'),
  },
};

// For CreateTicket payload (what gets sent to create a ticket)
export const mockCreateTicketPayload = {
  seatNumber: 'F10',
  basePrice: 16.5,
  discountId: undefined,
  total: 16.5,
  scheduleId: 5,
  status: TicketStatus.SOLD,
};

export const mockCreateTicketWithDiscountPayload = {
  seatNumber: 'G7',
  basePrice: 20.0,
  discountId: 1,
  total: 16.0, // 20% discount
  scheduleId: 6,
  status: TicketStatus.SOLD,
};

// Array of tickets for testing list operations
export const mockTicketList = [mockTicket, mockTicketWithDiscount, mockRedeemedTicket];
