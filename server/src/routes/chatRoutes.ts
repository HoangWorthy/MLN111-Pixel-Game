import { Router } from 'express';
import { ChatController } from '../controllers/ChatController';
import { validateRequest } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

export function createChatRoutes(chatController: ChatController): Router {
  const router = Router();

  router.get('/global', asyncHandler(chatController.getGlobalMessages));

  router.get('/room/:roomId', asyncHandler(chatController.getChatHistory));

  router.post(
    '/send',
    validateRequest('sendMessage'),
    asyncHandler(chatController.sendMessage)
  );

  return router;
}