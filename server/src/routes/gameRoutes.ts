import { Router } from 'express';
import { GameController } from '../controllers/GameController';
import { validateRequest } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

export function createGameRoutes(gameController: GameController): Router {
  const router = Router();

  router.get('/state', asyncHandler(gameController.getGameState));

  router.get('/room/:roomId', asyncHandler(gameController.getRoomState));

  router.get('/stats', asyncHandler(gameController.getServerStats));

  router.post(
    '/join',
    validateRequest('joinRoom'),
    asyncHandler(gameController.joinPlayer)
  );

  return router;
}