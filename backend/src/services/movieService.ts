import { Movie } from '@prisma/client';
import { prisma } from '../config';

export class MovieService {
  static async getAll(limit: number, offset: number) {
    try {
      const movies = await prisma.movie.findMany({
        skip: offset,
        take: limit,
        select: {
          id: true,
          name: true,
          minutes: true,
          category: true,
          schedules: true,
        },
      });
      return movies;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get movies: ${message}`);
    }
  }

  static async createMovie(data: Omit<Movie, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const movies = await prisma.movie.create({
        data,
        select: {
          id: true,
          name: true,
          minutes: true,
          category: true,
          schedules: true,
        },
      });
      return movies;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
        throw { code: error.code, message: error.message };
      }
      throw new Error(`Failed to create the movie: ${message}`);
    }
  }

  static async getMovieByID(movieID: number) {
    try {
      const movies = await prisma.movie.findUnique({
        where: { id: movieID },
        select: {
          id: true,
          name: true,
          minutes: true,
          category: true,
          schedules: true,
        },
      });
      return movies;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get the movie: ${message}`);
    }
  }

  static async updateMovie(movieID: number, data: Partial<Movie>) {
    try {
      const movies = await prisma.movie.update({
        where: { id: movieID },
        data,
        select: {
          id: true,
          name: true,
          minutes: true,
          category: true,
          schedules: true,
        },
      });
      return movies;
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
        throw { code: error.code, message: error.message };
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update the movie: ${message}`);
    }
  }

  static async deleteMovie(movieID: number) {
    try {
      const movies = await prisma.movie.delete({
        where: { id: movieID },
      });
      return movies;
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
        throw { code: error.code, message: error.message };
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to delete the movie: ${message}`);
    }
  }
}
