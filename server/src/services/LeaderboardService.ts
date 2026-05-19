import { LeaderboardModel, LeaderboardEntry } from '../models/Leaderboard';
import { Player } from '../types/game';

export class LeaderboardService {
  constructor(private leaderboardModel: LeaderboardModel) {}

  async recordCompletion(player: Player, startTime: Date): Promise<LeaderboardEntry> {
    if (this.leaderboardModel.hasCompleted(player.id)) {
      throw new Error('Người chơi đã hoàn thành');
    }

    const completionTime = Date.now() - startTime.getTime();
    return this.leaderboardModel.addEntry(player, completionTime);
  }

  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    return this.leaderboardModel.getTopEntries(limit);
  }

  async getPlayerRank(playerId: string): Promise<number> {
    return this.leaderboardModel.getPlayerRank(playerId);
  }

  async hasPlayerCompleted(playerId: string): Promise<boolean> {
    return this.leaderboardModel.hasCompleted(playerId);
  }

  formatTime(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const ms = milliseconds % 1000;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  }
}