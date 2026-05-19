import { PlayerModel } from '../models/Player';
import { RoomModel } from '../models/Room';
import { Player, PlayerUpdate } from '../types/game';

export class PlayerService {
  constructor(
    private playerModel: PlayerModel,
    private roomModel: RoomModel
  ) {}

  async createPlayer(username: string): Promise<Player> {
    const existingPlayer = this.playerModel.findByUsername(username);
    if (existingPlayer && existingPlayer.isOnline) {
      throw new Error('Tên người dùng đã tồn tại');
    }

    const player = this.playerModel.create(username);
    this.roomModel.addPlayerToRoom(1, player.id);
    
    return player;
  }

  async getPlayer(playerId: string): Promise<Player | null> {
    const player = this.playerModel.findById(playerId);
    return player || null;
  }

  async updatePlayerPosition(playerId: string, x: number, y: number): Promise<Player | null> {
    return this.playerModel.updatePosition(playerId, x, y);
  }

  async movePlayerToRoom(playerId: string, roomId: number): Promise<Player | null> {
    const player = this.playerModel.findById(playerId);
    if (!player) return null;

    const oldRoom = player.room;
    const updatedPlayer = this.playerModel.updateRoom(playerId, roomId);
    
    if (updatedPlayer) {
      this.roomModel.movePlayer(oldRoom, roomId, playerId);
    }

    return updatedPlayer;
  }

  async setPlayerOnline(playerId: string, isOnline: boolean): Promise<Player | null> {
    const player = this.playerModel.setOnline(playerId, isOnline);
    
    if (!isOnline && player) {
      this.roomModel.removePlayerFromRoom(player.room, playerId);
    }

    return player;
  }

  async getOnlinePlayers(): Promise<Player[]> {
    return this.playerModel.getOnlinePlayers();
  }

  async getPlayersInRoom(roomId: number): Promise<Player[]> {
    return this.playerModel.getPlayersByRoom(roomId);
  }

  async disconnectPlayer(playerId: string): Promise<void> {
    const player = this.playerModel.findById(playerId);
    if (player) {
      await this.setPlayerOnline(playerId, false);
    }
  }

  async validatePlayerUpdate(update: PlayerUpdate): Promise<boolean> {
    const player = this.playerModel.findById(update.playerId);
    if (!player || !player.isOnline) {
      return false;
    }

    if (update.x !== undefined && (update.x < 0 || update.x > 9000)) {
      return false;
    }

    if (update.y !== undefined && (update.y < 0 || update.y > 1200)) {
      return false;
    }

    if (update.room !== undefined && (update.room < 1 || update.room > 3)) {
      return false;
    }

    return true;
  }

  async cleanup(): Promise<void> {
    this.playerModel.cleanup();
    this.roomModel.cleanup();
  }

  async resetPlayers(): Promise<void> {
    this.playerModel.clear();
  }
}
