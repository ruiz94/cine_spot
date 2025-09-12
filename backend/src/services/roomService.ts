import { prisma } from '../config';

/**
 * Room Service - Manejo de los rooms, ADMIN protected
 */
export class RoomService {
  /**
   * Crear un nuevo room
   */
  static async createRoom ({ name, capacity }: {name: string, capacity: number}){
    try {
      const room = await prisma.room.create({
        data: {
          name, capacity
        },
        select: {
          id: true,
          name: true,
          capacity: true,
          schedules: true
        }
      })
      return room;
    } catch (error) {
      // Handle unique constraint errors (e.g., duplicate name)
      if (typeof error === 'object' && error !== null && 'code' in error) {
        if (error.code === 'P2002') {
          throw new Error('Name already exists');
        }
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create room: ${errorMessage}`);
    }
  }

  /**
   * getAll rooms
   */
  static async getAll (limit = 20, offset = 0){
    try {
      const rooms = await prisma.room.findMany({
        skip: offset,
        take: limit,
        select: {
          id: true,
          name: true,
          capacity: true,
          schedules: true
        },
        orderBy: { id: 'asc' },
      });
      return rooms;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get rooms: ${errorMessage}`);
    }
  }

  /**
   * Update un room
   */
  static async updateRoom (roomID: number, capacity: number){
    try {
      const room = await prisma.room.update({
        where: { id: roomID },
        data: {
          capacity
        },
        select: {
          id: true,
          name: true,
          capacity: true,
          schedules: true
        }
      })
      return room;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update room: ${errorMessage}`);
    }
  }

  /**
   * Eliminar un room
   */
  static async deleteRoom (roomID: number){
    try {
      const room = await prisma.room.delete({
        where: { id: roomID },
      })
      return room;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to delete room: ${errorMessage}`);
    }
  }
}