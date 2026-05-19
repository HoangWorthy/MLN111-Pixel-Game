import { io, Socket } from "socket.io-client";
import {
  Player,
  ChatMessage,
  GameState,
  GameOverData,
  GameResetData,
  ApiResponse,
  JoinGameData,
  MovePlayerData,
  SendMessageData,
} from "@/types/api";
import { getServerUrl } from "@/lib/env-utils";

class GameClient {
  private socket: Socket | null = null;
  private readonly serverUrl: string;
  private currentPlayer: Player | null = null;

  constructor(serverUrl?: string) {
    this.serverUrl = serverUrl || getServerUrl();
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.socket) {
          this.socket.disconnect();
          this.socket = null;
        }
        this.currentPlayer = null;

        this.socket = io(this.serverUrl, {
          forceNew: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000
        });

        this.socket.on("connect", () => {
          resolve();
        });

        this.socket.on("connect_error", (error) => {
          reject(error);
        });

        this.socket.on("disconnect", (reason) => {
          this.socket = null;
        });

        this.socket.on("reconnect", () => {
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentPlayer = null;
  }

  joinGame(username: string): Promise<{ player: Player; existingPlayers: Player[] }> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error("Chưa kết nối với server"));
        return;
      }

      this.socket.emit("player:join", { username });

      this.socket.once(
        "player:joined",
        (data: { player: Player; allPlayers?: Player[] }) => {
          this.currentPlayer = data.player;

          resolve({ 
            player: data.player, 
            existingPlayers: data.allPlayers || [] 
          });
        }
      );

      this.socket.once("error", (error: { message: string }) => {
        reject(new Error(error.message));
      });
    });
  }

  movePlayer(x: number, y: number): void {
    if (!this.socket || !this.socket.connected || !this.currentPlayer) return;

    this.socket.emit("player:move", {
      playerId: this.currentPlayer.id,
      x,
      y,
    });
  }

  sendMessage(content: string, roomId?: number): void {
    if (!this.socket || !this.socket.connected || !this.currentPlayer) return;

    this.socket.emit("chat:send", {
      playerId: this.currentPlayer.id,
      message: content,
      room: roomId,
    });
  }

  joinRoom(roomId: number): void {
    if (!this.socket || !this.currentPlayer) return;

    this.socket.emit("room:join", {
      playerId: this.currentPlayer.id,
      roomId,
    });
  }

  getGameState(): void {
    if (!this.socket || !this.socket.connected) return;
    this.socket.emit("game:state");
  }

  finishGame(): void {
    if (!this.socket || !this.socket.connected || !this.currentPlayer) return;
    this.socket.emit("game:finish", { playerId: this.currentPlayer.id });
  }

  onPlayerJoined(callback: (player: Player) => void): void {
    if (!this.socket) return;
    this.socket.on("player:new", (data: { player: Player }) => {
      callback(data.player);
    });
  }

  onPlayerMoved(callback: (player: Player) => void): void {
    if (!this.socket) return;
    this.socket.on("player:moved", (data: { player: Player }) => {
      callback(data.player);
    });
  }

  onChatMessage(callback: (message: ChatMessage) => void): void {
    if (!this.socket) return;
    this.socket.on("chat:message", (data: { message: ChatMessage }) => {
      callback(data.message);
    });
  }

  onRoomState(callback: (roomState: any) => void): void {
    if (!this.socket) return;
    this.socket.on("room:state", (data: { roomState: any }) => {
      callback(data.roomState);
    });
  }

  onGameState(callback: (gameState: GameState) => void): void {
    if (!this.socket) return;
    this.socket.on("game:state", (data: { gameState: GameState }) => {
      callback(data.gameState);
    });
  }

  onPlayerDisconnected(callback: (playerId: string) => void): void {
    if (!this.socket) return;
    this.socket.on("player:disconnected", (data: { playerId: string }) => {
      callback(data.playerId);
    });
  }

  onError(callback: (error: string) => void): void {
    if (!this.socket) return;
    this.socket.on("error", (data: { message: string }) => {
      callback(data.message);
    });
  }

  onGameCompleted(callback: (data: { rank: number; time: string }) => void): void {
    if (!this.socket) return;
    this.socket.on("game:completed", callback);
  }

  onGameOver(callback: (data: GameOverData) => void): void {
    if (!this.socket) return;
    this.socket.on("game:over", callback);
  }

  onGameReset(callback: (data: GameResetData) => void): void {
    if (!this.socket) return;
    this.socket.on("game:reset", callback);
  }

  onLeaderboardUpdated(callback: (data: { leaderboard: any[] }) => void): void {
    if (!this.socket) return;
    this.socket.on("leaderboard:updated", callback);
  }

  getCurrentPlayer(): Player | null {
    return this.currentPlayer;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const gameClient = new GameClient();

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${getServerUrl()}/api${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  return response.json();
}

export async function createPlayer(
  username: string
): Promise<ApiResponse<Player>> {
  return apiRequest<Player>("/players", {
    method: "POST",
    body: JSON.stringify({ username }),
  });
}

export async function updatePlayerPosition(
  playerId: string,
  x: number,
  y: number
): Promise<ApiResponse<Player>> {
  return apiRequest<Player>(`/players/${playerId}/position`, {
    method: "PUT",
    body: JSON.stringify({ x, y }),
  });
}

export async function getOnlinePlayers(): Promise<ApiResponse<Player[]>> {
  return apiRequest<Player[]>("/players");
}

export async function sendChatMessage(
  playerId: string,
  content: string,
  roomId?: number
): Promise<ApiResponse<ChatMessage>> {
  return apiRequest<ChatMessage>("/chat/send", {
    method: "POST",
    body: JSON.stringify({ playerId, content, roomId }),
  });
}

export async function getChatHistory(
  roomId?: number
): Promise<ApiResponse<ChatMessage[]>> {
  const endpoint = roomId ? `/chat/room/${roomId}` : "/chat/global";
  return apiRequest<ChatMessage[]>(endpoint);
}

export async function getGameState(): Promise<ApiResponse<GameState>> {
  return apiRequest<GameState>("/game/state");
}

export async function getRoomState(roomId: number): Promise<ApiResponse<any>> {
  return apiRequest(`/game/room/${roomId}`);
}
