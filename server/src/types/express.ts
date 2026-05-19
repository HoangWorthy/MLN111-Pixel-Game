import { Request, Response } from 'express';
import { Socket } from 'socket.io';
import { Player } from './game';

export interface AuthenticatedRequest extends Request {
  player?: Player;
}

export interface SocketWithPlayer extends Socket {
  playerId?: string;
  username?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}