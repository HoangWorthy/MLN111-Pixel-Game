import { Router } from 'express';
import { PlayerController } from '../controllers/PlayerController';
import { validateRequest } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

export function createPlayerRoutes(playerController: PlayerController): Router {
  const router = Router();

  router.post(
    '/',
    validateRequest('createPlayer'),
    asyncHandler(playerController.createPlayer)
  );

  router.get('/', asyncHandler(playerController.getAllPlayers));

  router.get('/:id', asyncHandler(playerController.getPlayer));

  router.put(
    '/:id/position',
    validateRequest('updatePosition'),
    asyncHandler(playerController.updatePosition)
  );

  router.delete('/:id', asyncHandler(playerController.removePlayer));

  return router;
}