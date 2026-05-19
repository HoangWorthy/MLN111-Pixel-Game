export interface Player {
  id: string;
  username: string;
  x: number;
  y: number;
  room: number;
  isOnline: boolean;
  joinedAt: Date;
  lastSeen: Date;
  startTime?: Date;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  username: string;
  message: string;
  timestamp: Date;
  room?: number;
}

export interface Room {
  id: number;
  name: string;
  players: string[];
  messages: ChatMessage[];
  createdAt: Date;
}

export interface PlayerUpdate {
  playerId: string;
  x?: number;
  y?: number;
  room?: number;
}

export interface GameState {
  players: Map<string, Player>;
  rooms: Map<number, Room>;
  messages: ChatMessage[];
}

export interface GameOverData {
  winner: Pick<Player, 'id' | 'username'>;
  rank: number;
  time: string;
  completedAt: string;
  resetAt: string;
}

export interface GameResetData {
  resetAt: string;
  message: string;
}
