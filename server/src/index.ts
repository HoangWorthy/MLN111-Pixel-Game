import express, { Application, Request, Response, NextFunction } from "express";
import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { getAllowedOrigins, getServerPort } from "./env-utils";

import { PlayerModel } from "./models/Player";
import { ChatMessageModel } from "./models/ChatMessage";
import { RoomModel } from "./models/Room";
import { LeaderboardModel } from "./models/Leaderboard";
import { PlayerService } from "./services/PlayerService";
import { ChatService } from "./services/ChatService";
import { GameService } from "./services/GameService";
import { LeaderboardService } from "./services/LeaderboardService";
import { PlayerController } from "./controllers/PlayerController";
import { ChatController } from "./controllers/ChatController";
import { GameController } from "./controllers/GameController";
import { LeaderboardController } from "./controllers/LeaderboardController";
import { createPlayerRoutes } from "./routes/playerRoutes";
import { createChatRoutes } from "./routes/chatRoutes";
import { createGameRoutes } from "./routes/gameRoutes";
import { createLeaderboardRoutes } from "./routes/leaderboardRoutes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { SocketHandler } from "./utils/socketHandler";

class GameServer {
  private app: Application;
  private server: HttpServer;
  private io: SocketServer;
  private socketHandler!: SocketHandler;

  private playerModel!: PlayerModel;
  private chatMessageModel!: ChatMessageModel;
  private roomModel!: RoomModel;
  private leaderboardModel!: LeaderboardModel;

  private playerService!: PlayerService;
  private chatService!: ChatService;
  private gameService!: GameService;
  private leaderboardService!: LeaderboardService;

  private playerController!: PlayerController;
  private chatController!: ChatController;
  private gameController!: GameController;
  private leaderboardController!: LeaderboardController;

  constructor() {
    this.app = express();
    this.server = new HttpServer(this.app);
    const allowedOrigins = getAllowedOrigins();

    this.io = new SocketServer(this.server, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.initializeModels();
    this.initializeServices();
    this.initializeControllers();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeSocketHandler();
    this.initializeErrorHandling();
  }

  private initializeModels() {
    this.playerModel = new PlayerModel();
    this.chatMessageModel = new ChatMessageModel();
    this.roomModel = new RoomModel();
    this.leaderboardModel = new LeaderboardModel();
  }

  private initializeServices() {
    this.playerService = new PlayerService(this.playerModel, this.roomModel);
    this.chatService = new ChatService(this.chatMessageModel, this.playerModel);
    this.leaderboardService = new LeaderboardService(this.leaderboardModel);
    this.gameService = new GameService(
      this.playerService,
      this.chatService,
      this.roomModel
    );
  }

  private initializeControllers() {
    this.playerController = new PlayerController(this.playerService);
    this.chatController = new ChatController(this.chatService);
    this.gameController = new GameController(this.gameService);
    this.leaderboardController = new LeaderboardController(
      this.leaderboardService
    );
  }

  private initializeMiddleware() {
    this.app.use(helmet());
    this.app.use(compression());

    const expressAllowed = getAllowedOrigins();

    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const origin = req.headers.origin as string | undefined;
      if (origin && expressAllowed.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
      } else {
        res.header("Access-Control-Allow-Origin", expressAllowed[0]);
      }
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      if (req.method === "OPTIONS") {
        res.sendStatus(204);
        return;
      }
      next();
    });

    this.app.use(
      cors({
        origin: expressAllowed,
        credentials: true,
      })
    );
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  }

  private initializeRoutes() {
    this.app.use("/api/players", createPlayerRoutes(this.playerController));
    this.app.use("/api/chat", createChatRoutes(this.chatController));
    this.app.use("/api/game", createGameRoutes(this.gameController));
    this.app.use(
      "/api/leaderboard",
      createLeaderboardRoutes(this.leaderboardController)
    );

    this.app.get("/health", (req: any, res: any) => {
      res.json({ status: "OK", timestamp: new Date().toISOString() });
    });
  }

  private initializeSocketHandler() {
    this.socketHandler = new SocketHandler(
      this.io,
      this.gameService,
      this.playerService,
      this.chatService,
      this.leaderboardService
    );
  }

  private initializeErrorHandling() {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  public start(port: number = getServerPort()) {
    this.server.listen(port, () => {
      console.log(`🚀 Server đang chạy trên port ${port}`);
      console.log(`🌐 Allowed origins:`, getAllowedOrigins());
    });
  }

  public getApp(): Application {
    return this.app;
  }

  public getServer(): HttpServer {
    return this.server;
  }

  public getSocketServer(): SocketServer {
    return this.io;
  }
}

const gameServer = new GameServer();

if (process.env.NODE_ENV !== "test") {
  gameServer.start();
}

export default gameServer;
