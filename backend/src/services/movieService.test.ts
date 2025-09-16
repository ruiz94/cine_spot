import { MovieService } from './movieService';
import { prisma } from '../config';

jest.mock('../config', () => ({
  prisma: {
    movie: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockMovie = {
  id: 1,
  name: "Harry Potter and the Sorcerer's stone",
  minutes: 120,
  category: 'A',
};

describe('MovieService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return movies successfully', async () => {
      (prisma.movie.findMany as jest.Mock).mockReturnValue([mockMovie]);
      const res = await MovieService.getAll(10, 0);

      expect(res).toEqual([mockMovie]);
      expect(prisma.movie.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        select: {
          id: true,
          name: true,
          minutes: true,
          category: true,
          schedules: true,
        },
      });
    });

    it('should throw error when service fails', async () => {
      (prisma.movie.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(MovieService.getAll(10, 0)).rejects.toThrow(/Failed to get movies: DB error/);
    });

    it('should handle unknown errors gracefully', async () => {
      (prisma.movie.findMany as jest.Mock).mockRejectedValue('Unknown');

      await expect(MovieService.getAll(10, 0)).rejects.toThrow(
        /Failed to get movies: Unknown error/,
      );
    });
  });

  describe('createMovie', () => {
    const mockMovieData = {
      name: "Harry Potter and the Sorcerer's stone",
      minutes: 120,
      category: 'A',
    };
    it('should create the movies successfully', async () => {
      (prisma.movie.create as jest.Mock).mockReturnValue(mockMovie);
      const res = await MovieService.createMovie(mockMovieData);

      expect(res).toEqual(mockMovie);
      expect(prisma.movie.create).toHaveBeenCalledWith({
        data: mockMovieData,
        select: {
          id: true,
          name: true,
          minutes: true,
          category: true,
          schedules: true,
        },
      });
    });

    it('should throw error when movie already exists', async () => {
      (prisma.movie.create as jest.Mock).mockRejectedValue({
        code: 'P2002',
        message: 'Movie already exists.',
      });

      await expect(MovieService.createMovie(mockMovieData)).rejects.toMatchObject({
        code: 'P2002',
        message: 'Movie already exists.',
      });
    });

    it('should throw error when service fails', async () => {
      (prisma.movie.create as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(MovieService.createMovie(mockMovieData)).rejects.toThrow(
        /Failed to create the movie: DB error/,
      );
    });

    it('should handle unknown errors gracefully', async () => {
      (prisma.movie.create as jest.Mock).mockRejectedValue('Unknown');

      await expect(MovieService.createMovie(mockMovieData)).rejects.toThrow(
        /Failed to create the movie: Unknown error/,
      );
    });
  });

  describe('getMovieByID', () => {
    it('should return the movies successfully', async () => {
      (prisma.movie.findUnique as jest.Mock).mockReturnValue(mockMovie);
      const res = await MovieService.getMovieByID(1);

      expect(res).toEqual(mockMovie);
      expect(prisma.movie.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          id: true,
          name: true,
          minutes: true,
          category: true,
          schedules: true,
        },
      });
    });

    it('should throw error when service fails', async () => {
      (prisma.movie.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(MovieService.getMovieByID(1)).rejects.toThrow(
        /Failed to get the movie: DB error/,
      );
    });

    it('should handle unknown errors gracefully', async () => {
      (prisma.movie.findUnique as jest.Mock).mockRejectedValue('Unknown');

      await expect(MovieService.getMovieByID(1)).rejects.toThrow(
        /Failed to get the movie: Unknown error/,
      );
    });
  });

  describe('updateMovie', () => {
    const movieID = 1;
    const mockMovieData = {
      name: "Harry Potter and the Sorcerer's stone",
      minutes: 120,
      category: 'A',
    };
    it('should update the movies successfully', async () => {
      (prisma.movie.update as jest.Mock).mockReturnValue(mockMovie);
      const res = await MovieService.updateMovie(movieID, mockMovieData);

      expect(res).toEqual(mockMovie);
      expect(prisma.movie.update).toHaveBeenCalledWith({
        where: { id: movieID },
        data: mockMovieData,
        select: {
          id: true,
          name: true,
          minutes: true,
          category: true,
          schedules: true,
        },
      });
    });

    it('should throw error when movie name already exists', async () => {
      (prisma.movie.update as jest.Mock).mockRejectedValue({
        code: 'P2002',
        message: 'Name already exists.',
      });

      await expect(MovieService.updateMovie(movieID, mockMovieData)).rejects.toMatchObject({
        code: 'P2002',
        message: 'Name already exists.',
      });
    });

    it('should throw error when movie.update service fails', async () => {
      (prisma.movie.update as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(MovieService.updateMovie(movieID, mockMovieData)).rejects.toThrow(
        /Failed to update the movie: DB error/,
      );
    });

    it('should handle unknown errors gracefully', async () => {
      (prisma.movie.update as jest.Mock).mockRejectedValue('Unknown');

      await expect(MovieService.updateMovie(movieID, mockMovieData)).rejects.toThrow(
        /Failed to update the movie: Unknown error/,
      );
    });
  });

  describe('deleteMovie', () => {
    it('should return the movies successfully', async () => {
      (prisma.movie.delete as jest.Mock).mockReturnValue(mockMovie);
      const res = await MovieService.deleteMovie(1);

      expect(res).toEqual(mockMovie);
      expect(prisma.movie.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw error when movie was not found', async () => {
      (prisma.movie.delete as jest.Mock).mockRejectedValue({
        code: 'P2025',
        message: 'No movie found to delete.',
      });

      await expect(MovieService.deleteMovie(1)).rejects.toMatchObject({
        code: 'P2025',
        message: 'No movie found to delete.',
      });
    });

    it('should throw error when service fails', async () => {
      (prisma.movie.delete as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(MovieService.deleteMovie(1)).rejects.toThrow(
        /Failed to delete the movie: DB error/,
      );
    });

    it('should handle unknown errors gracefully', async () => {
      (prisma.movie.delete as jest.Mock).mockRejectedValue('Unknown');

      await expect(MovieService.deleteMovie(1)).rejects.toThrow(
        /Failed to delete the movie: Unknown error/,
      );
    });
  });
});
