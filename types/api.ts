export interface Player {
  id: string;
  username: string;
  x: number;
  y: number;
  room: number;
  isOnline: boolean;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  username: string;
  message: string;
  room?: number;
  timestamp: Date;
}

export interface GameState {
  players: Map<string, Player>;
  rooms: Map<number, any>;
  messages: ChatMessage[];
}

export interface GameOverData {
  winner: Pick<Player, "id" | "username">;
  rank: number;
  time: string;
  completedAt: string;
  resetAt: string;
}

export interface GameResetData {
  resetAt: string;
  message: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface JoinGameData {
  username: string;
}

export interface MovePlayerData {
  playerId: string;
  x: number;
  y: number;
}

export interface SendMessageData {
  playerId: string;
  content: string;
  roomId?: number;
}
