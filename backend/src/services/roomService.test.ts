import { RoomService } from './roomService';
import { prisma } from '../config';

jest.mock('../config', () => ({
  prisma: {
    room: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

const mockRoomData = {
  name: 'A1',
  capacity: 20,
};

const mockRoomResponse = {
  ...mockRoomData,
  id: 1,
  schedules: [],
};

describe('RoomService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('createRoom', () => {
    it('should handle Name already exists error', async () => {
      (prisma.room.create as jest.Mock).mockRejectedValue({ code: 'P2002' });
      await expect(RoomService.createRoom(mockRoomData)).rejects.toThrow(/Name already exists/);
    });

    it('should throw error when service fails', async () => {
      (prisma.room.create as jest.Mock).mockRejectedValue(new Error('DB Error'));
      await expect(RoomService.createRoom(mockRoomData)).rejects.toThrow(
        /Failed to create room: DB Error/,
      );
    });

    it('should handle unknown errors gracefully', async () => {
      (prisma.room.create as jest.Mock).mockRejectedValue('DB Error');
      await expect(RoomService.createRoom(mockRoomData)).rejects.toThrow(/Unknown error/);
    });

    it('should create a room successfully', async () => {
      (prisma.room.create as jest.Mock).mockReturnValue(mockRoomResponse);
      const responseRoom = await RoomService.createRoom(mockRoomData);
      expect(prisma.room.create).toHaveBeenCalledWith({
        data: mockRoomData,
        select: {
          id: true,
          name: true,
          capacity: true,
          schedules: true,
        },
      });
      expect(responseRoom).toEqual(mockRoomResponse);
    });
  });

  describe('getAll', () => {
    it('should throw error when service fails', async () => {
      (prisma.room.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));
      await expect(RoomService.getAll()).rejects.toThrow(/Failed to get rooms: DB Error/);
    });

    it('should handle unknown errors gracefully', async () => {
      (prisma.room.findMany as jest.Mock).mockRejectedValue('DB Error');
      await expect(RoomService.getAll()).rejects.toThrow(/Unknown error/);
    });

    it('should fetch rooms successfully', async () => {
      (prisma.room.findMany as jest.Mock).mockReturnValue([mockRoomResponse]);
      const responseRoom = await RoomService.getAll(10, 0);
      expect(prisma.room.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        select: {
          id: true,
          name: true,
          capacity: true,
          schedules: true,
        },
        orderBy: { id: 'asc' },
      });
      expect(responseRoom).toEqual([mockRoomResponse]);
    });
  });

  describe('updateRoom', () => {
    it('should throw error when service fails', async () => {
      (prisma.room.update as jest.Mock).mockRejectedValue(new Error('DB Error'));
      await expect(RoomService.updateRoom(1, 10)).rejects.toThrow(
        /Failed to update room: DB Error/,
      );
    });

    it('should handle unknown errors gracefully', async () => {
      (prisma.room.update as jest.Mock).mockRejectedValue('DB Error');
      await expect(RoomService.updateRoom(1, 10)).rejects.toThrow(/Unknown error/);
    });

    it('should update a room successfully', async () => {
      (prisma.room.update as jest.Mock).mockReturnValue(mockRoomResponse);
      const responseRoom = await RoomService.updateRoom(1, 20);
      expect(prisma.room.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { capacity: 20 },
        select: {
          id: true,
          name: true,
          capacity: true,
          schedules: true,
        },
      });
      expect(responseRoom).toEqual(mockRoomResponse);
    });
  });

  describe('deleteRoom', () => {
    it('should throw error when service fails', async () => {
      (prisma.room.delete as jest.Mock).mockRejectedValue(new Error('DB Error'));
      await expect(RoomService.deleteRoom(1)).rejects.toThrow(/Failed to delete room: DB Error/);
    });

    it('should handle unknown errors gracefully', async () => {
      (prisma.room.delete as jest.Mock).mockRejectedValue('DB Error');
      await expect(RoomService.deleteRoom(1)).rejects.toThrow(/Unknown error/);
    });

    it('should update a room successfully', async () => {
      (prisma.room.delete as jest.Mock).mockReturnValue(mockRoomResponse);
      const responseRoom = await RoomService.deleteRoom(1);
      expect(prisma.room.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(responseRoom).toEqual(mockRoomResponse);
    });
  });

  describe('getRoomByID', () => {
    it('should throw error when service fails', async () => {
      (prisma.room.findUnique as jest.Mock).mockRejectedValue(new Error('DB Error'));
      await expect(RoomService.getRoomByID(1)).rejects.toThrow(/Failed to get the room: DB Error/);
    });

    it('should handle unknown errors gracefully', async () => {
      (prisma.room.findUnique as jest.Mock).mockRejectedValue('DB Error');
      await expect(RoomService.getRoomByID(1)).rejects.toThrow(/Unknown error/);
    });

    it('should return error if room was not found', async () => {
      (prisma.room.findUnique as jest.Mock).mockReturnValue(null);
      await expect(RoomService.getRoomByID(1)).rejects.toThrow(
        /Failed to get the room: Room not found/,
      );
      expect(prisma.room.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          id: true,
          name: true,
          capacity: true,
          schedules: true,
        },
      });
    });

    it('should return a room successfully', async () => {
      (prisma.room.findUnique as jest.Mock).mockReturnValue(mockRoomResponse);
      const responseRoom = await RoomService.getRoomByID(1);
      expect(prisma.room.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          id: true,
          name: true,
          capacity: true,
          schedules: true,
        },
      });
      expect(responseRoom).toEqual(mockRoomResponse);
    });
  });
});
