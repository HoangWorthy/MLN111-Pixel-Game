import { PlayerService } from './PlayerService';
import { ChatService } from './ChatService';
import { RoomModel } from '../models/Room';
import { GameState, Player, ChatMessage } from '../types/game';

export class GameService {
  constructor(
    private playerService: PlayerService,
    private chatService: ChatService,
    private roomModel: RoomModel
  ) {}

  async getGameState(): Promise<GameState> {
    const players = await this.playerService.getOnlinePlayers();
    const rooms = this.roomModel.getAllRooms();
    const messages = await this.chatService.getRecentMessages(undefined, 100);

    const playersMap = new Map<string, Player>();
    players.forEach(player => playersMap.set(player.id, player));

    const roomsMap = new Map<number, any>();
    rooms.forEach(room => roomsMap.set(room.id, room));

    return {
      players: playersMap,
      rooms: roomsMap,
      messages
    };
  }

  async getRoomState(roomId: number): Promise<{
    players: Player[];
    messages: ChatMessage[];
    roomInfo: any;
  }> {
    const players = await this.playerService.getPlayersInRoom(roomId);
    const messages = await this.chatService.getMessagesByRoom(roomId);
    const roomInfo = this.roomModel.findById(roomId);

    return {
      players,
      messages,
      roomInfo: roomInfo || null
    };
  }

  async getServerStats(): Promise<{
    onlinePlayers: number;
    totalRooms: number;
    roomStats: Array<{id: number, name: string, playerCount: number}>;
    messageStats: any;
  }> {
    const onlinePlayers = (await this.playerService.getOnlinePlayers()).length;
    const roomStats = this.roomModel.getRoomStats();
    const messageStats = await this.chatService.getMessageStats();

    return {
      onlinePlayers,
      totalRooms: roomStats.length,
      roomStats,
      messageStats
    };
  }

  async broadcastToRoom(roomId: number, event: string, data: any): Promise<Player[]> {
    const players = await this.playerService.getPlayersInRoom(roomId);
    return players;
  }

  async broadcastToAll(event: string, data: any): Promise<Player[]> {
    const players = await this.playerService.getOnlinePlayers();
    return players;
  }

  async cleanup(): Promise<void> {
    await this.playerService.cleanup();
    await this.chatService.cleanup();
  }

  async resetGame(): Promise<void> {
    await this.playerService.resetPlayers();
    await this.chatService.resetMessages();
    this.roomModel.reset();
  }

  async handlePlayerJoin(username: string): Promise<Player> {
    return await this.playerService.createPlayer(username);
  }

  async handlePlayerMove(playerId: string, x: number, y: number, room?: number): Promise<Player | null> {
    let player = await this.playerService.updatePlayerPosition(playerId, x, y);
    
    if (room !== undefined && player && player.room !== room) {
      player = await this.playerService.movePlayerToRoom(playerId, room);
    }

    return player;
  }

  async handlePlayerDisconnect(playerId: string): Promise<void> {
    await this.playerService.disconnectPlayer(playerId);
  }

  async handleChatMessage(playerId: string, message: string, room?: number): Promise<ChatMessage | null> {
    return await this.chatService.sendMessage(playerId, message, room);
  }
}
