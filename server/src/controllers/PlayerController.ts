import { Request, Response } from 'express';
import { PlayerService } from '../services/PlayerService';
import { ApiResponse } from '../types/express';
import { AppError } from '../middleware/errorHandler';

export class PlayerController {
  constructor(private playerService: PlayerService) {}

  createPlayer = async (req: Request, res: Response<ApiResponse>) => {
    const { name } = req.body;
    
    const player = this.playerService.createPlayer(name);
    
    res.status(201).json({
      success: true,
      data: player
    });
  };

  getPlayer = async (req: Request, res: Response<ApiResponse>) => {
    const { id } = req.params;
    
    const player = this.playerService.getPlayer(id);
    
    if (!player) {
      throw new AppError('Người chơi không tồn tại', 404);
    }
    
    res.json({
      success: true,
      data: player
    });
  };

  getAllPlayers = async (req: Request, res: Response<ApiResponse>) => {
    const players = await this.playerService.getOnlinePlayers();
    
    res.json({
      success: true,
      data: players
    });
  };

  updatePosition = async (req: Request, res: Response<ApiResponse>) => {
    const { id } = req.params;
    const { x, y } = req.body;
    
    const updatedPlayer = await this.playerService.updatePlayerPosition(id, x, y);
    
    if (!updatedPlayer) {
      throw new AppError('Không thể cập nhật vị trí', 400);
    }
    
    res.json({
      success: true,
      data: updatedPlayer
    });
  };

  removePlayer = async (req: Request, res: Response<ApiResponse>) => {
    const { id } = req.params;
    
    await this.playerService.setPlayerOnline(id, false);
    
    res.json({
      success: true,
      message: 'Xóa người chơi thành công'
    });
  };
}