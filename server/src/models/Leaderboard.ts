import { Player } from '../types/game';

export interface LeaderboardEntry {
  id: string;
  username: string;
  completionTime: number;
  completedAt: Date;
}

export class LeaderboardModel {
  private entries = new Map<string, LeaderboardEntry>();
  private topEntries: LeaderboardEntry[] = [];

  addEntry(player: Player, completionTime: number): LeaderboardEntry {
    const entry: LeaderboardEntry = {
      id: player.id,
      username: player.username,
      completionTime,
      completedAt: new Date()
    };

    this.entries.set(player.id, entry);
    this.updateTopEntries();
    
    return entry;
  }

  private updateTopEntries(): void {
    this.topEntries = Array.from(this.entries.values())
      .sort((a, b) => a.completionTime - b.completionTime)
      .slice(0, 10);
  }

  getTopEntries(limit: number = 10): LeaderboardEntry[] {
    return this.topEntries.slice(0, limit);
  }

  getPlayerEntry(playerId: string): LeaderboardEntry | undefined {
    return this.entries.get(playerId);
  }

  getPlayerRank(playerId: string): number {
    const entry = this.entries.get(playerId);
    if (!entry) return -1;
    
    return this.topEntries.findIndex(e => e.id === playerId) + 1;
  }

  hasCompleted(playerId: string): boolean {
    return this.entries.has(playerId);
  }

  clear(): void {
    this.entries.clear();
    this.topEntries = [];
  }
}