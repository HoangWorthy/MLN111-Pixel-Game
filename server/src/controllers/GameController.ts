import { Request, Response } from "express";
import { GameService } from "../services/GameService";
import { ApiResponse } from "../types/express";

export class GameController {
  constructor(private gameService: GameService) {}

  getGameState = async (req: Request, res: Response<ApiResponse>) => {
    const gameState = await this.gameService.getGameState();

    res.json({
      success: true,
      data: gameState,
    });
  };

  getRoomState = async (req: Request, res: Response<ApiResponse>) => {
    const { roomId } = req.params;

    const roomState = await this.gameService.getRoomState(parseInt(roomId));

    res.json({
      success: true,
      data: roomState,
    });
  };

  getServerStats = async (req: Request, res: Response<ApiResponse>) => {
    const stats = await this.gameService.getServerStats();

    res.json({
      success: true,
      data: stats,
    });
  };

  joinPlayer = async (req: Request, res: Response<ApiResponse>) => {
    const { username } = req.body;

    const player = await this.gameService.handlePlayerJoin(username);

    res.status(201).json({
      success: true,
      data: player,
    });
  };
}
