import { Response, Request } from 'express';
import { RoomService } from '../services/roomService';
import logger from '../utils/logger';

const createRoom = async (req: Request, res: Response) => {
  try {
    const { name, capacity } = req.body;

    const createdRoom = await RoomService.createRoom({ name, capacity });

    return res.status(201).json({
      success: true,
      message: 'Room created successfully',
      room: createdRoom,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(message);
    return res.status(400).json({
      success: false,
      message: 'Failed to create the room.',
    });
  }
};

const getAllRooms = async (req: Request, res: Response) => {
  try {
    const { limit, offset } = req.body.query;
    const rooms = await RoomService.getAll(limit, offset);

    return res.status(200).json({
      success: true,
      message: 'Rooms fetched successfully',
      data: rooms,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(message);
    return res.status(400).json({
      success: false,
      message: 'Failed to get rooms.',
    });
  }
};

const getRoomByID = async (req: Request, res: Response) => {
  try {
    const roomID = req.body.params.id;
    const room = await RoomService.getRoomByID(roomID);

    return res.status(200).json({
      success: true,
      message: 'Room fetched successfully',
      data: room,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(message);
    return res.status(400).json({
      success: false,
      message: 'Failed to get the room.',
    });
  }
};

const updateRoom = async (req: Request, res: Response) => {
  try {
    const userId = req.body.params.id;
    const { capacity } = req.body;

    const roomUpdated = await RoomService.updateRoom(userId, capacity);

    return res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      data: roomUpdated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(message);
    return res.status(400).json({
      success: false,
      message: 'Failed to update the room.',
    });
  }
};

const deleteRoom = async (req: Request, res: Response) => {
  try {
    const roomID = req.body.params.id;

    await RoomService.deleteRoom(roomID);

    return res.status(204).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(message);
    return res.status(400).json({
      success: false,
      message: 'Failed to delete the room.',
    });
  }
};

export default { createRoom, getAllRooms, getRoomByID, updateRoom, deleteRoom };
