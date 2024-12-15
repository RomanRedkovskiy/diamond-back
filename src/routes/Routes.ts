import { Router } from 'express';
import { UserController } from '../controller/UserController.js';

const router = Router();
const controller = new UserController()

/*router.get('/', controller.getMovies);
router.get('/:id', controller.getMovieById);
router.post('/:id/rate', controller.setMovieMark);*/

export default router;
