import express from 'express';
import { movieController } from '../controllers';
import { createMovieSchema, updateMovieSchema } from '../utils/schemas/movies';
import { validateLimitOffset, validateParamID } from '../utils/schemas/generic';
import { validateWithZod } from '../middlewares/validateWithZod';
import { requireRole } from '../middlewares';

const router = express.Router();

//Get all movies
router.get('/', validateWithZod(validateLimitOffset, 'query'), movieController.getAllMovies);

//Create a movie
router.post(
  '/',
  requireRole(['ADMIN']),
  validateWithZod(createMovieSchema, 'body'),
  movieController.createMovie,
);

//Find a movie by id
router.get('/:id', validateWithZod(validateParamID, 'params'), movieController.getMovieByID);

//Update a movie
router.patch(
  '/:id',
  requireRole(['ADMIN']),
  validateWithZod(validateParamID, 'params'),
  validateWithZod(updateMovieSchema, 'body'),
  movieController.updateMovie,
);

//Delete a movie
router.delete(
  '/:id',
  requireRole(['ADMIN']),
  validateWithZod(validateParamID, 'params'),
  movieController.deleteMovie,
);

export default router;
