import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from '../types/game';

export class ChatMessageModel {
  private messages: ChatMessage[] = [];
  private readonly maxMessages = 1000;

  create(playerId: string, username: string, message: string, room?: number): ChatMessage {
    const chatMessage: ChatMessage = {
      id: uuidv4(),
      playerId,
      username,
      message: message.trim(),
      timestamp: new Date(),
      room
    };

    this.messages.push(chatMessage);
    
    if (this.messages.length > this.maxMessages) {
      this.messages.shift();
    }

    return chatMessage;
  }

  getRecent(limit: number = 50, room?: number): ChatMessage[] {
    let filtered = this.messages;
    
    if (room !== undefined) {
      filtered = this.messages.filter(msg => 
        msg.room === room || msg.room === undefined
      );
    }

    return filtered
      .slice(-limit)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  getByRoom(room: number, limit: number = 50): ChatMessage[] {
    return this.messages
      .filter(msg => msg.room === room)
      .slice(-limit)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  getGlobal(limit: number = 50): ChatMessage[] {
    return this.messages
      .filter(msg => msg.room === undefined)
      .slice(-limit)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  cleanup(): void {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.messages = this.messages.filter(msg => msg.timestamp > oneDayAgo);
  }

  clear(): void {
    this.messages = [];
  }

  getAll(): ChatMessage[] {
    return [...this.messages];
  }
}
