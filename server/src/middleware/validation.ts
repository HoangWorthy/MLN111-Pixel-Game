import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiResponse } from '../types/express';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    next();
  };
};

export const validateRequest = (schemaName: keyof typeof schemas) => {
  return validate(schemas[schemaName]);
};

export const schemas = {
  createPlayer: Joi.object({
    username: Joi.string().alphanum().min(3).max(20).required()
  }),

  updatePosition: Joi.object({
    x: Joi.number().min(0).max(9000).required(),
    y: Joi.number().min(0).max(1200).required(),
    room: Joi.number().min(1).max(3).optional()
  }),

  sendMessage: Joi.object({
    message: Joi.string().min(1).max(500).required(),
    room: Joi.number().min(1).max(3).optional()
  }),

  joinRoom: Joi.object({
    room: Joi.number().min(1).max(3).required()
  }),

  leaderboardCompletion: Joi.object({
    playerId: Joi.string().required(),
    username: Joi.string().required(),
    startTime: Joi.date().iso().required()
  })
};

export const validateLeaderboardCompletion = validate(schemas.leaderboardCompletion);