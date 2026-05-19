import { Server as SocketServer, Socket } from "socket.io";
import { GameService } from "../services/GameService";
import { PlayerService } from "../services/PlayerService";
import { ChatService } from "../services/ChatService";
import { LeaderboardService } from "../services/LeaderboardService";
import { GameOverData } from "../types/game";

export class SocketHandler {
  private socketPlayerMap = new Map<string, string>();
  private gameOverData: GameOverData | null = null;
  private isEndingGame = false;
  private gameResetTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly gameResetDelayMs = 60_000;

  constructor(
    private io: SocketServer,
    private gameService: GameService,
    private playerService: PlayerService,
    private chatService: ChatService,
    private leaderboardService: LeaderboardService
  ) {
    this.setupSocketEvents();
  }

  private setupSocketEvents() {
    this.io.on("connection", (socket: Socket) => {
      socket.on("player:join", async (data: { username: string }) => {
        try {
          const player = await this.gameService.handlePlayerJoin(data.username);
          player.startTime = new Date();
          
          this.socketPlayerMap.set(socket.id, player.id);

          const allPlayers = await this.playerService.getOnlinePlayers();
          const otherPlayers = allPlayers.filter((p) => p.id !== player.id);

          socket.emit("player:joined", {
            player,
            allPlayers: otherPlayers,
          });

          if (this.gameOverData) {
            socket.emit("game:over", this.gameOverData);
          }

          socket.broadcast.emit("player:new", { player });
        } catch (error) {
          console.error("Player join error:", error);
          socket.emit("error", {
            message:
              error instanceof Error
                ? error.message
                : "Không thể tham gia game",
          });
        }
      });

      socket.on(
        "player:move",
        async (data: { playerId: string; x: number; y: number }) => {
          if (this.gameOverData || this.isEndingGame) return;

          try {
            const updatedPlayer = await this.playerService.updatePlayerPosition(
              data.playerId,
              data.x,
              data.y
            );

            if (updatedPlayer) {
              socket.broadcast.emit("player:moved", { player: updatedPlayer });
            }
          } catch (error) {
            socket.emit("error", { message: "Không thể di chuyển" });
          }
        }
      );

      socket.on(
        "chat:send",
        async (data: { playerId: string; message: string; room?: number }) => {
          if (this.gameOverData || this.isEndingGame) return;

          try {
            const chatMessage = await this.chatService.sendMessage(
              data.playerId,
              data.message,
              data.room
            );

            if (data.room) {
              this.io
                .to(`room:${data.room}`)
                .emit("chat:message", { message: chatMessage });
            } else {
              this.io.emit("chat:message", { message: chatMessage });
            }
          } catch (error) {
            socket.emit("error", { message: "Không thể gửi tin nhắn" });
          }
        }
      );

      socket.on(
        "room:join",
        async (data: { playerId: string; roomId: number }) => {
          if (this.gameOverData || this.isEndingGame) return;

          try {
            const player = await this.playerService.movePlayerToRoom(
              data.playerId,
              data.roomId
            );

            if (player) {
              const newRoom = `room:${data.roomId}`;

              socket.join(newRoom);
              socket.to(newRoom).emit("player:joined-room", { player });

              const roomState = await this.gameService.getRoomState(
                data.roomId
              );
              socket.emit("room:state", { roomState });
            }
          } catch (error) {
            socket.emit("error", { message: "Không thể tham gia phòng" });
          }
        }
      );

      socket.on("game:state", async () => {
        try {
          const gameState = await this.gameService.getGameState();
          socket.emit("game:state", { gameState });
        } catch (error) {
          socket.emit("error", { message: "Không thể lấy trạng thái game" });
        }
      });

      socket.on("game:finish", async (data: { playerId: string }) => {
        if (this.gameOverData) {
          socket.emit("game:over", this.gameOverData);
          return;
        }

        if (this.isEndingGame) {
          return;
        }

        this.isEndingGame = true;

        try {
          const player = await this.playerService.getPlayer(data.playerId);
          if (
            !player ||
            !player.startTime ||
            (await this.leaderboardService.hasPlayerCompleted(player.id))
          ) {
            return;
          }

          const entry = await this.leaderboardService.recordCompletion(
            player,
            player.startTime
          );
          const rank = await this.leaderboardService.getPlayerRank(player.id);
          const formattedTime = this.leaderboardService.formatTime(
            entry.completionTime
          );
          const resetAt = new Date(
            Date.now() + this.gameResetDelayMs
          ).toISOString();

          socket.emit("game:completed", {
            rank,
            time: formattedTime,
          });

          this.gameOverData = {
            winner: {
              id: player.id,
              username: player.username,
            },
            rank,
            time: formattedTime,
            completedAt: entry.completedAt.toISOString(),
            resetAt,
          };

          this.io.emit("game:over", this.gameOverData);
          this.scheduleGameReset();

          const leaderboard = await this.leaderboardService.getLeaderboard();
          this.io.emit("leaderboard:updated", { leaderboard });
        } catch (error) {
          console.error("Game finish error:", error);
        } finally {
          if (!this.gameOverData) {
            this.isEndingGame = false;
          }
        }
      });

      socket.on("disconnect", async () => {
        const playerId = this.socketPlayerMap.get(socket.id);
        if (playerId) {
          try {
            await this.gameService.handlePlayerDisconnect(playerId);
            this.socketPlayerMap.delete(socket.id);
            socket.broadcast.emit("player:disconnected", { playerId });
          } catch (error) {
            console.error('Error handling player disconnect:', error);
          }
        }
      });
    });
  }

  private scheduleGameReset() {
    if (this.gameResetTimer) {
      clearTimeout(this.gameResetTimer);
    }

    this.gameResetTimer = setTimeout(() => {
      void this.resetGameSession();
    }, this.gameResetDelayMs);
  }

  private async resetGameSession() {
    try {
      this.gameOverData = null;
      this.isEndingGame = false;
      this.gameResetTimer = null;
      this.socketPlayerMap.clear();

      await this.gameService.resetGame();

      this.io.emit("game:reset", {
        resetAt: new Date().toISOString(),
        message: "Trò chơi đã được reset.",
      });
    } catch (error) {
      console.error("Game reset error:", error);
    }
  }

  broadcastToRoom(roomId: number, event: string, data: any) {
    this.io.to(`room:${roomId}`).emit(event, data);
  }

  broadcastToAll(event: string, data: any) {
    this.io.emit(event, data);
  }
}
