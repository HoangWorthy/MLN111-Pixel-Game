import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/express';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }

  console.error('Unhandled Error:', err);
  
  return res.status(500).json({
    success: false,
    error: 'Đã xảy ra lỗi server'
  });
};

export const notFoundHandler = (req: Request, res: Response<ApiResponse>) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} không tồn tại`
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};