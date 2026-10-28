// Capa 3: Interfaces - src/interfaces/middlewares/errorHandler.ts

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { DomainError, ValidationError, BusinessRuleError } from '../../domain/errors/DomainError.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      errorType: 'SchemaValidationError',
      message: 'Los datos enviados no cumplen con el formato requerido',
      errors: err.errors.map((e) => ({
        campo: e.path.join('.'),
        mensaje: e.message,
      })),
    });
    return;
  }

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
