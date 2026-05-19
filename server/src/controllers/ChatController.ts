import { Request, Response } from "express";
import { ChatService } from "../services/ChatService";
import { ApiResponse } from "../types/express";

export class ChatController {
  constructor(private chatService: ChatService) {}

  getChatHistory = async (req: Request, res: Response<ApiResponse>) => {
    const { roomId } = req.params;
    const { limit = 50 } = req.query;

    const messages = await this.chatService.getMessagesByRoom(
      parseInt(roomId),
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: messages,
    });
  };

  sendMessage = async (req: Request, res: Response<ApiResponse>) => {
    const { playerId, content, roomId } = req.body;

    const message = await this.chatService.sendMessage(
      playerId,
      content,
      roomId
    );

    res.status(201).json({
      success: true,
      data: message,
    });
  };

  getGlobalMessages = async (req: Request, res: Response<ApiResponse>) => {
    const { limit = 50 } = req.query;

    const messages = await this.chatService.getGlobalMessages(
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: messages,
    });
  };
}
