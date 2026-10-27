// Capa 3: Interfaces - src/interfaces/middlewares/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../infrastructure/config/env.js';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      errorType: 'UnauthorizedError',
      message: 'Token de autorización requerido. Ingrese Bearer <token>',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      errorType: 'UnauthorizedError',
      message: 'Token inválido o expirado. Inicie sesión nuevamente.',
    });
  }
}
