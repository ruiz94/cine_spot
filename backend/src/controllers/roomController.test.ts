import roomController from "./roomController";
import { Response, Request } from 'express';
import { RoomService } from "../services/roomService";

jest.mock('../services/roomService');

describe('roomController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnThis();
    req = {
      body: {}
    }
    res = {
      status: statusMock,
      json: jsonMock
    } as unknown as Response;
    jest.clearAllMocks();
  })


  describe('createRoom', () => {

    it('should return 200 when room is created successfully', async () => {
      const roomMock = {
        id: 1,
        name: 'A1',
        capacity: 20,
        schedules: []
      };

      (RoomService.createRoom as jest.Mock).mockReturnValue(roomMock);

      req.body = {
        name: 'A1',
        capacity: 20
      }

      await roomController.createRoom(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Room created successfully',
        room: roomMock
      })
    })

    it('should return 400 when fails', async () => {

      (RoomService.createRoom as jest.Mock).mockRejectedValue(new Error('Error creating a room'));
      req.body = {
        name: 'A1',
        capacity: 20
      }

      await roomController.createRoom(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Error creating a room',
      })
    })

    it('should handle unknown errors gracefully', async () => {

      (RoomService.createRoom as jest.Mock).mockRejectedValue('Error creating a room');
      req.body = {
        name: 'A1',
        capacity: 20
      }

      await roomController.createRoom(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'An unknown error occurred',
      })
    })
  })
})