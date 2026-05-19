import { ChatMessageModel } from '../models/ChatMessage';
import { PlayerModel } from '../models/Player';
import { ChatMessage } from '../types/game';

export class ChatService {
  constructor(
    private chatMessageModel: ChatMessageModel,
    private playerModel: PlayerModel
  ) {}

  async sendMessage(playerId: string, message: string, room?: number): Promise<ChatMessage | null> {
    const player = this.playerModel.findById(playerId);
    if (!player || !player.isOnline) {
      throw new Error('Người chơi không tồn tại hoặc đã offline');
    }

    if (!this.validateMessage(message)) {
      throw new Error('Tin nhắn không hợp lệ');
    }

    const chatMessage = this.chatMessageModel.create(
      playerId,
      player.username,
      message,
      room
    );

    return chatMessage;
  }

  async getRecentMessages(room?: number, limit: number = 50): Promise<ChatMessage[]> {
    if (room !== undefined) {
      return this.chatMessageModel.getByRoom(room, limit);
    }
    return this.chatMessageModel.getGlobal(limit);
  }

  async getMessagesByRoom(room: number, limit: number = 50): Promise<ChatMessage[]> {
    return this.chatMessageModel.getByRoom(room, limit);
  }

  async getGlobalMessages(limit: number = 50): Promise<ChatMessage[]> {
    return this.chatMessageModel.getGlobal(limit);
  }

  private validateMessage(message: string): boolean {
    if (!message || typeof message !== 'string') {
      return false;
    }

    const trimmed = message.trim();
    if (trimmed.length === 0 || trimmed.length > 500) {
      return false;
    }

    const forbiddenWords = ['spam', 'hack', 'cheat'];
    const lowerMessage = trimmed.toLowerCase();
    
    for (const word of forbiddenWords) {
      if (lowerMessage.includes(word)) {
        return false;
      }
    }

    return true;
  }

  async cleanup(): Promise<void> {
    this.chatMessageModel.cleanup();
  }

  async resetMessages(): Promise<void> {
    this.chatMessageModel.clear();
  }

  async getMessageStats(): Promise<{
    totalMessages: number;
    messagesByRoom: Array<{room: number, count: number}>;
  }> {
    const allMessages = this.chatMessageModel.getAll();
    const messagesByRoom = new Map<number, number>();

    allMessages.forEach(msg => {
      if (msg.room !== undefined) {
        messagesByRoom.set(msg.room, (messagesByRoom.get(msg.room) || 0) + 1);
      }
    });

    return {
      totalMessages: allMessages.length,
      messagesByRoom: Array.from(messagesByRoom.entries()).map(([room, count]) => ({
        room,
        count
      }))
    };
  }
}
