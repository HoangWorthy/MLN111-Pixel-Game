import { v4 as uuidv4 } from 'uuid';
import { Player } from '../types/game';

export class PlayerModel {
  private players = new Map<string, Player>();
  private readonly spawnOrigin = { x: 10 * 48 + 24, y: 20 * 48 + 24 };
  private readonly spawnSpacing = 48;
  private readonly spawnColumns = 4;

  create(username: string): Player {
    const spawnPoint = this.getNextSpawnPoint();
    const player: Player = {
      id: uuidv4(),
      username,
      x: spawnPoint.x,
      y: spawnPoint.y,
      room: 1,
      isOnline: true,
      joinedAt: new Date(),
      lastSeen: new Date()
    };

    this.players.set(player.id, player);
    return player;
  }

  private getNextSpawnPoint() {
    const onlineCount = Array.from(this.players.values()).filter(
      (player) => player.isOnline
    ).length;
    const column = onlineCount % this.spawnColumns;
    const row = Math.floor(onlineCount / this.spawnColumns);

    return {
      x: this.spawnOrigin.x + column * this.spawnSpacing,
      y: this.spawnOrigin.y + row * this.spawnSpacing,
    };
  }

  findById(id: string): Player | undefined {
    return this.players.get(id);
  }

  findByUsername(username: string): Player | undefined {
    return Array.from(this.players.values()).find(
      player => player.username === username
    );
  }

  updatePosition(id: string, x: number, y: number): Player | null {
    const player = this.players.get(id);
    if (player) {
      player.x = x;
      player.y = y;
      player.lastSeen = new Date();
      return player;
    }
    return null;
  }

  updateRoom(id: string, room: number): Player | null {
    const player = this.players.get(id);
    if (player) {
      player.room = room;
      player.lastSeen = new Date();
      return player;
    }
    return null;
  }

  setOnline(id: string, isOnline: boolean): Player | null {
    const player = this.players.get(id);
    if (player) {
      player.isOnline = isOnline;
      player.lastSeen = new Date();
      if (!isOnline) {
        this.players.delete(id);
      }
      return player;
    }
    return null;
  }

  getOnlinePlayers(): Player[] {
    return Array.from(this.players.values()).filter(player => player.isOnline);
  }

  getPlayersByRoom(room: number): Player[] {
    return Array.from(this.players.values()).filter(
      player => player.room === room && player.isOnline
    );
  }

  remove(id: string): boolean {
    return this.players.delete(id);
  }

  getAll(): Player[] {
    return Array.from(this.players.values());
  }

  clear(): void {
    this.players.clear();
  }

  cleanup(): void {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    for (const [id, player] of this.players.entries()) {
      if (!player.isOnline && player.lastSeen < fiveMinutesAgo) {
        this.players.delete(id);
      }
    }
  }
}
