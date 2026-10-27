// Capa 3: Interfaces - src/interfaces/controllers/DistribucionController.ts

import { Request, Response, NextFunction } from 'express';
import { RegistrarDescargaLimaUseCase } from '../../application/use-cases/lima/RegistrarDescargaLimaUseCase.js';
import { DistribuirUbicacionUseCase } from '../../application/use-cases/lima/DistribuirUbicacionUseCase.js';

export class DistribucionController {
  constructor(
    private readonly registrarDescargaLimaUseCase: RegistrarDescargaLimaUseCase,
    private readonly distribuirUbicacionUseCase: DistribuirUbicacionUseCase
  ) {}

  async registrarDescarga(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const acopioId = String(req.params.acopioId);
      const gasto = await this.registrarDescargaLimaUseCase.execute({
        acopioId,
        tipoGasto: req.body.tipoGasto,
        nombreReceptor: req.body.nombreReceptor,
        cantidadJabas: req.body.cantidadJabas,
        tarifaPorJaba: req.body.tarifaPorJaba,
        usuarioRegistroId: req.body.usuarioRegistroId,
        concepto: req.body.concepto,
      });

      res.status(201).json({
        success: true,
        message: 'Descarga y liquidación de estibadores/cargadores registrada con éxito',
        data: gasto,
      });
    } catch (error) {
      next(error);
    }
  }

  async trasladarUbicacion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const jabaId = String(req.params.jabaId);
      await this.distribuirUbicacionUseCase.execute({
        jabaId,
        ubicacionId: req.body.ubicacionId,
      });

      res.status(200).json({
        success: true,
        message: 'Jaba trasladada de ubicación exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
}
