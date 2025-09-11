import { RoomService } from "./roomService";
import { prisma } from '../config';

jest.mock('../config', () => ({
  prisma: {
    room: {
      create: jest.fn()
    }
  }
}));

const mockRoomData = {
  name: 'A1',
  capacity: 20
}

const mockRoomResponse = {
  ...mockRoomData,
  id: 1,
  schedules: []
}

describe('RoomService', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('createRoom', () => {

    it('should handle Name already exists error', async () => {
      (prisma.room.create as jest.Mock).mockRejectedValue({ code: 'P2002'});
      await expect(RoomService.createRoom(mockRoomData)).rejects.toThrow(/Name already exists/);
    })

    it('should throw error when service fails', async () => {
      (prisma.room.create as jest.Mock).mockRejectedValue(new Error('DB Error'));
      await expect(RoomService.createRoom(mockRoomData)).rejects.toThrow(/Failed to create room: DB Error/);
    })

    it('should handle unknown errors gracefully', async () => {
      (prisma.room.create as jest.Mock).mockRejectedValue('DB Error');
      await expect(RoomService.createRoom(mockRoomData)).rejects.toThrow(/Unknown error/);
    })

    it('should create a room successfully', async () => {
      (prisma.room.create as jest.Mock).mockReturnValue(mockRoomResponse);
      const responseRoom = await RoomService.createRoom(mockRoomData);
      expect(prisma.room.create).toHaveBeenCalledWith({
        data: mockRoomData,
        select: {
          id: true,
          name: true,
          capacity: true,
          schedules: true
        }
      });
      expect(responseRoom).toEqual(mockRoomResponse);
    })
  })
})