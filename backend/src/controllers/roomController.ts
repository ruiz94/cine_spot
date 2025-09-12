import { Response, Request } from 'express';
import { RoomService } from '../services/roomService';

const createRoom = async (req: Request, res: Response) => {
  try {
    const { name, capacity } = req.body;

    const createdRoom = await RoomService.createRoom({ name, capacity });

    return res.status(201).json({
      success: true,
      message: 'Room created successfully',
      room: createdRoom
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
}

const getAllRooms = async (req: Request, res: Response) => {
  try {
    const { limit, offset } = req.body.query
    const rooms = await RoomService.getAll(limit, offset);

    return res.status(200).json({
      success: true,
      message: 'Rooms fetched successfully',
      data: rooms,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
}

const updateRoom = async (req: Request, res: Response) => {
  try {
    const userId = req.body.params.id;
    const { capacity } = req.body
    
    const roomUpdated = await RoomService.updateRoom(userId, capacity);

    return res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      data: roomUpdated,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
}

const deleteRoom = async (req: Request, res: Response) => {
  try {
    const roomID = req.body.params.id;
    
    await RoomService.deleteRoom(roomID);
    
    return res.status(204).send();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? 'An error occurred trying to delete a room' : 'An unknown error occurred',
    });
  }
}

export default { createRoom, getAllRooms, updateRoom, deleteRoom }