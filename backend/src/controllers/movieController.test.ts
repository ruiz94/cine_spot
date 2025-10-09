import movieController from './movieController';
import { MovieService } from '../services/movieService';
import { Response, Request } from 'express';

jest.mock('../services/movieService');

const mockMovie = {
  id: 1,
  name: "Harry Potter and the Sorcerer's stone",
  minutes: 120,
  category: 'A',
};

describe('movieController', () => {
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let res: Partial<Response>;
  let req: Partial<Request>;

  beforeEach(() => {
    jsonMock = jest.fn().mockReturnThis();
    statusMock = jest.fn().mockReturnThis();
    req = {
      body: {},
    };
    res = {
      status: statusMock,
      json: jsonMock,
    } as unknown as Response;
    jest.clearAllMocks();
  });

  describe('getAllMovies', () => {
    it('should return status 200 when movies are fetched successfully', async () => {
      (MovieService.getAll as jest.Mock).mockReturnValue([mockMovie]);

      req.body = {
        query: {
          limit: 10,
          offset: 0,
        },
      };

      await movieController.getAllMovies(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: [mockMovie],
      });
    });

    it('should return status 400 error when there is an error ', async () => {
      (MovieService.getAll as jest.Mock).mockRejectedValue(new Error('Error fetching movies'));

      req.body = {
        query: {
          limit: 10,
          offset: 0,
        },
      };

      await movieController.getAllMovies(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to get movies',
      });
    });

    it('should handle unknown error gracefully', async () => {
      (MovieService.getAll as jest.Mock).mockRejectedValue('Error fetching movies');

      req.body = {
        query: {
          limit: 10,
          offset: 0,
        },
      };

      await movieController.getAllMovies(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to get movies',
      });
    });
  });

  describe('createMovie', () => {
    it('should return status 200 when movies is created successfully', async () => {
      (MovieService.createMovie as jest.Mock).mockReturnValue(mockMovie);
      req.body = {
        name: "Harry Potter and the Sorcerer's stone",
        minutes: 120,
        category: 'A',
      };

      await movieController.createMovie(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockMovie,
      });
    });

    it('should return status 400 error when there is an error ', async () => {
      (MovieService.createMovie as jest.Mock).mockRejectedValue(new Error('Error creating movies'));
      req.body = {
        name: "Harry Potter and the Sorcerer's stone",
        minutes: 120,
        category: 'A',
      };

      await movieController.createMovie(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to create the movie.',
      });
    });

    it('should handle error when movie already exists', async () => {
      (MovieService.createMovie as jest.Mock).mockRejectedValue({
        code: 'P2002',
        message: 'Movie already exists',
      });
      req.body = {
        name: "Harry Potter and the Sorcerer's stone",
        minutes: 120,
        category: 'A',
      };

      await movieController.createMovie(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Movie already exists',
      });
    });

    it('should handle unknown error gracefully', async () => {
      (MovieService.createMovie as jest.Mock).mockRejectedValue('Error creating movies');
      req.body = {
        name: "Harry Potter and the Sorcerer's stone",
        minutes: 120,
        category: 'A',
      };

      await movieController.createMovie(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to create the movie.',
      });
    });
  });

  describe('getMovieByID', () => {
    it('should return status 200 when movies is found successfully', async () => {
      (MovieService.getMovieByID as jest.Mock).mockReturnValue(mockMovie);
      req.body.params = {
        id: 1,
      };

      await movieController.getMovieByID(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockMovie,
      });
    });

    it('should return status 400 error when getMovieByID service fails', async () => {
      (MovieService.getMovieByID as jest.Mock).mockRejectedValue(new Error('Error fetching movie'));
      req.body.params = {
        id: 1,
      };

      await movieController.getMovieByID(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to get the movie.',
      });
    });

    it('should handle unknown error gracefully', async () => {
      (MovieService.getMovieByID as jest.Mock).mockRejectedValue('Error fetching movie');
      req.body.params = {
        id: 1,
      };

      await movieController.getMovieByID(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to get the movie.',
      });
    });

    it('should return status 400 error when movie is not found', async () => {
      (MovieService.getMovieByID as jest.Mock).mockReturnValue(null);
      req.body = {
        params: {
          id: 1,
        }
      };

      await movieController.getMovieByID(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Movie not found.',
      });
    });
  });

  describe('updateMovie', () => {
    it('should return status 200 when movies is updated successfully', async () => {
      (MovieService.updateMovie as jest.Mock).mockReturnValue(mockMovie);
      (MovieService.getMovieByID as jest.Mock).mockReturnValue(mockMovie);
      req.body = {
        params: {
          id: 1,
        },
        name: "Harry Potter and the Sorcerer's stone",
        minutes: 120,
        category: 'A',
      };

      await movieController.updateMovie(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockMovie,
      });
    });

    it('should return status 400 error when movie is not found', async () => {
      (MovieService.getMovieByID as jest.Mock).mockReturnValue(null);
      req.body = {
        params: {
          id: 1,
        },
        name: "Harry Potter and the Sorcerer's stone",
        minutes: 120,
        category: 'A',
      };

      await movieController.updateMovie(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Movie not found',
      });
      expect(MovieService.updateMovie).not.toHaveBeenCalled();
    });

    it('should return status 400 error when name already exists', async () => {
      (MovieService.getMovieByID as jest.Mock).mockReturnValue(mockMovie);
      (MovieService.updateMovie as jest.Mock).mockRejectedValue({
        code: 'P2002',
        message: 'Name already exists',
      });

      req.body = {
        params: {
          id: 1,
        },
        name: "Harry Potter and the Sorcerer's stone",
        minutes: 120,
        category: 'A',
      };

      await movieController.updateMovie(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Name already exists.',
      });
    });

    it('should return status 400 error when getMovieByID service fails', async () => {
      (MovieService.getMovieByID as jest.Mock).mockReturnValue(mockMovie);
      (MovieService.updateMovie as jest.Mock).mockRejectedValue(new Error('Error fetching movie'));
      req.body = {
        params: {
          id: 1,
        },
        name: "Harry Potter and the Sorcerer's stone",
        minutes: 120,
        category: 'A',
      };

      await movieController.updateMovie(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to update the movie.',
      });
    });

    it('should handle unknown error gracefully', async () => {
      (MovieService.getMovieByID as jest.Mock).mockReturnValue(mockMovie);
      (MovieService.updateMovie as jest.Mock).mockRejectedValue('Error fetching movie');
      req.body = {
        params: {
          id: 1,
        },
        name: "Harry Potter and the Sorcerer's stone",
        minutes: 120,
        category: 'A',
      };

      await movieController.updateMovie(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to update the movie.',
      });
    });
  });

  describe('deleteMovie', () => {
    it('should return status 204 when movies is deleted successfully', async () => {
      (MovieService.deleteMovie as jest.Mock).mockReturnValue(mockMovie);
      req.body.params = {
        id: 1,
      };

      await movieController.deleteMovie(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(204);
    });

    it('should return status 404 error when movie is not found to delete', async () => {
      (MovieService.deleteMovie as jest.Mock).mockRejectedValue({
        code: 'P2025',
        message: 'Name already exists',
      });
      req.body.params = {
        id: 1,
      };

      await movieController.deleteMovie(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'No movie found to delete.',
      });
    });

    it('should return status 400 error when deleteMovie service fails', async () => {
      (MovieService.deleteMovie as jest.Mock).mockRejectedValue(new Error('Error fetching movie'));
      req.body.params = {
        id: 1,
      };

      await movieController.deleteMovie(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to delete the movie.',
      });
    });

    it('should handle unknown error gracefully', async () => {
      (MovieService.deleteMovie as jest.Mock).mockRejectedValue('Error fetching movie');
      req.body.params = {
        id: 1,
      };

      await movieController.deleteMovie(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to delete the movie.',
      });
    });
  });
});
