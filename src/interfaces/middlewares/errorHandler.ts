// Capa 3: Interfaces - src/interfaces/middlewares/errorHandler.ts

import { Request, Response, NextFunction } from 'express';
import { DomainError, ValidationError, BusinessRuleError } from '../../domain/errors/DomainError.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ValidationError) {
    res.status(400).json({
      success: false,
      errorType: 'ValidationError',
      message: err.message,
    });
    return;
  }

  if (err instanceof BusinessRuleError) {
    res.status(422).json({
      success: false,
      errorType: 'BusinessRuleError',
      message: err.message,
    });
    return;
  }

  if (err instanceof DomainError) {
    res.status(400).json({
      success: false,
      errorType: 'DomainError',
      message: err.message,
    });
    return;
  }

  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    errorType: 'InternalServerError',
    message: err.message || 'Ha ocurrido un error inesperado en el servidor',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
}
