// Capa 3: Interfaces - src/interfaces/controllers/TransporteController.ts

import { Request, Response, NextFunction } from 'express';
import { RegistrarTransporteUseCase } from '../../application/use-cases/transporte/RegistrarTransporteUseCase.js';
import { RegistrarTransporteInputSchema } from '../../application/dtos/transporte.dto.js';

export class TransporteController {
  constructor(private readonly registrarTransporteUseCase: RegistrarTransporteUseCase) {}

  async contratarFlete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const acopioId = String(req.params.acopioId);
      const input = RegistrarTransporteInputSchema.parse({
        ...req.body,
        acopioId,
      });
      const resultado = await this.registrarTransporteUseCase.execute(input);

      res.status(200).json({
        success: true,
        message: 'Flete y transporte registrado correctamente',
        data: resultado,
      });
    } catch (error) {
      next(error);
    }
  }
}
