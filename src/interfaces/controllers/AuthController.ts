// Capa 3: Interfaces - src/interfaces/controllers/AuthController.ts

import { Request, Response, NextFunction } from 'express';
import { LoginSuperAdminUseCase } from '../../application/use-cases/auth/LoginSuperAdminUseCase.js';

export class AuthController {
  constructor(private readonly loginSuperAdminUseCase: LoginSuperAdminUseCase) {}

  async loginSuperAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resultado = await this.loginSuperAdminUseCase.execute({
        correo: req.body.correo,
        contrasena: req.body.contrasena,
      });

      res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: resultado,
      });
    } catch (error) {
      next(error);
    }
  }
}
