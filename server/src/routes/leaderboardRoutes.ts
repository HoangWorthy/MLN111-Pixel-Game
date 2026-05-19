import { Router } from 'express';
import { LeaderboardController } from '../controllers/LeaderboardController';
import { validateLeaderboardCompletion } from '../middleware/validation';

export function createLeaderboardRoutes(leaderboardController: LeaderboardController): Router {
  const router = Router();

  router.get('/', leaderboardController.getLeaderboard);
  router.get('/player/:playerId/rank', leaderboardController.getPlayerRank);
  router.post('/complete', validateLeaderboardCompletion, leaderboardController.recordCompletion);

  return router;
}