// Capa 3: Interfaces - src/interfaces/controllers/DistribucionController.ts

import { Request, Response, NextFunction } from 'express';
import { RegistrarDescargaLimaUseCase } from '../../application/use-cases/lima/RegistrarDescargaLimaUseCase.js';
import { DistribuirUbicacionUseCase } from '../../application/use-cases/lima/DistribuirUbicacionUseCase.js';
import { IJabaRepository } from '../../domain/repositories/IJabaRepository.js';
import { RegistrarDescargaLimaInputSchema, DistribuirJabaInputSchema } from '../../application/dtos/lima.dto.js';

export class DistribucionController {
  constructor(
    private readonly registrarDescargaLimaUseCase: RegistrarDescargaLimaUseCase,
    private readonly distribuirUbicacionUseCase: DistribuirUbicacionUseCase,
    private readonly jabaRepo?: IJabaRepository
  ) {}

  async registrarDescarga(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const acopioId = String(req.params.acopioId);
      const input = RegistrarDescargaLimaInputSchema.parse({
        ...req.body,
        acopioId,
      });
      const gasto = await this.registrarDescargaLimaUseCase.execute(input);

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
      const input = DistribuirJabaInputSchema.parse({
        ...req.body,
        jabaId,
      });
      await this.distribuirUbicacionUseCase.execute(input);

      res.status(200).json({
        success: true,
        message: 'Jaba trasladada de ubicación exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async dividirJaba(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!this.jabaRepo) throw new Error('Repositorio de jabas no disponible');
      const jabaId = String(req.params.jabaId);
      const { cantidadSeparar, pesoSeparado, ubicacionId } = req.body;

      const resultado = await this.jabaRepo.dividirJaba(
        jabaId,
        Number(cantidadSeparar),
        Number(pesoSeparado),
        String(ubicacionId)
      );

      res.status(200).json({
        success: true,
        message: 'Grupo de jabas fraccionado y reubicado exitosamente',
        data: resultado,
      });
    } catch (error) {
      next(error);
    }
  }
}
