import { Request, Response } from 'express';
import { LeaderboardService } from '../services/LeaderboardService';

export class LeaderboardController {
  constructor(private leaderboardService: LeaderboardService) {}

  getLeaderboard = async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await this.leaderboardService.getLeaderboard(limit);
      
      const formattedLeaderboard = leaderboard.map((entry, index) => ({
        rank: index + 1,
        username: entry.username,
        completionTime: this.leaderboardService.formatTime(entry.completionTime),
        completedAt: entry.completedAt
      }));

      res.json({ leaderboard: formattedLeaderboard });
    } catch (error) {
      res.status(500).json({ error: 'Không thể lấy bảng xếp hạng' });
    }
  };

  getPlayerRank = async (req: Request, res: Response) => {
    try {
      const { playerId } = req.params;
      const rank = await this.leaderboardService.getPlayerRank(playerId);
      
      if (rank === -1) {
        return res.status(404).json({ error: 'Người chơi chưa hoàn thành' });
      }

      res.json({ rank });
    } catch (error) {
      res.status(500).json({ error: 'Không thể lấy thứ hạng' });
    }
  };

  recordCompletion = async (req: Request, res: Response) => {
    try {
      const { playerId, startTime } = req.body;
      
      if (!playerId || !startTime) {
        return res.status(400).json({ error: 'Thiếu thông tin' });
      }

      const player = { id: playerId, username: req.body.username };
      const entry = await this.leaderboardService.recordCompletion(
        player as any,
        new Date(startTime)
      );

      res.json({
        message: 'Đã ghi nhận hoàn thành',
        entry: {
          rank: await this.leaderboardService.getPlayerRank(playerId),
          completionTime: this.leaderboardService.formatTime(entry.completionTime)
        }
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };
}