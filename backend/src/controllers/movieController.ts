import { Response, Request } from 'express';
import { MovieService } from '../services/movieService';
import logger from '../utils/logger';

/**
 * Get all movies
 * @route [GET] /movies
 * @query limit: number
 * @query offset: number
 * @return 200 {
 * success: boolean
 * data: Movie[]
 * }
 */
const getAllMovies = async (req: Request, res: Response) => {
  try {
    const { limit, offset } = req.body.query;
    const movies = await MovieService.getAll(limit, offset);
    return res.status(200).json({
      success: true,
      data: movies,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'getAllMovies: Unknown error';
    logger.error(message);
    return res.status(400).json({
      success: false,
      message: 'Failed to get movies',
    });
  }
};

const createMovie = async (req: Request, res: Response) => {
  try {
    const { name, minutes, category } = req.body;
    const movie = await MovieService.createMovie({ name, minutes, category });
    return res.status(200).json({
      success: true,
      data: movie,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'createMovie: Unknown error';

    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      logger.error({ message: 'Movie already exists', code: error.code });
      return res.status(409).json({ success: false, message: 'Movie already exists' });
    }
    logger.error(message);
    return res.status(400).json({
      success: false,
      message: 'Failed to create the movie.',
    });
  }
};

const getMovieByID = async (req: Request, res: Response) => {
  try {
    const movieID = req.body.params.id;
    const movie = await MovieService.getMovieByID(movieID);

    return res.status(200).json({
      success: true,
      data: movie,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'getMovieByID: Unknown error';
    logger.error(message);
    return res.status(400).json({
      success: false,
      message: 'Failed to get the movie.',
    });
  }
};

const updateMovie = async (req: Request, res: Response) => {
  try {
    const movieID = req.body.params.id;
    const movie = await MovieService.getMovieByID(movieID);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    const { name, minutes, category } = req.body;
    const updateMovie = await MovieService.updateMovie(movieID, { name, minutes, category });

    return res.status(200).json({
      success: true,
      data: updateMovie,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'updateMovie: Unknown error';
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      logger.error({ message: 'Name already exists', code: error.code });
      return res.status(409).json({ success: false, message: 'Name already exists.' });
    }
    logger.error(message);
    return res.status(400).json({
      success: false,
      message: 'Failed to update the movie.',
    });
  }
};

const deleteMovie = async (req: Request, res: Response) => {
  try {
    const movieID = req.body.params.id;

    await MovieService.deleteMovie(movieID);

    return res.status(204).send();
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
      logger.error({ message: 'No movie found to delete.', code: error.code });
      return res.status(404).json({ success: false, message: 'No movie found to delete.' });
    }

    const message = error instanceof Error ? error.message : 'deleteMovie: Unknown error';
    logger.error(message);
    return res.status(400).json({
      success: false,
      message: 'Failed to delete the movie.',
    });
  }
};

export default { getAllMovies, createMovie, getMovieByID, updateMovie, deleteMovie };
