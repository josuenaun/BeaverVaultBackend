// Capa 3: Interfaces - src/interfaces/controllers/AcopioController.ts

import { Request, Response, NextFunction } from 'express';
import { RegistrarAcopioUseCase } from '../../application/use-cases/acopio/RegistrarAcopioUseCase.js';
import { RegistrarGastoSeleccionadorUseCase } from '../../application/use-cases/acopio/RegistrarGastoSeleccionadorUseCase.js';
import { IAcopioRepository } from '../../domain/repositories/IAcopioRepository.js';
import { RegistrarAcopioInputSchema, RegistrarGastoSeleccionadorInputSchema } from '../../application/dtos/acopio.dto.js';

export class AcopioController {
  constructor(
    private readonly registrarAcopioUseCase: RegistrarAcopioUseCase,
    private readonly registrarGastoSeleccionadorUseCase: RegistrarGastoSeleccionadorUseCase,
    private readonly acopioRepo: IAcopioRepository
  ) {}

  async crearAcopio(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = RegistrarAcopioInputSchema.parse(req.body);
      const acopio = await this.registrarAcopioUseCase.execute(input);

      res.status(201).json({
        success: true,
        message: 'Acopio registrado con éxito',
        data: acopio,
      });
    } catch (error) {
      next(error);
    }
  }

  async registrarPagoSeleccionador(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const acopioId = String(req.params.acopioId);
      const input = RegistrarGastoSeleccionadorInputSchema.parse({
        ...req.body,
        acopioId,
      });
      const gasto = await this.registrarGastoSeleccionadorUseCase.execute(input);

      res.status(201).json({
        success: true,
        message: 'Pago a seleccionador registrado correctamente',
        data: gasto,
      });
    } catch (error) {
      next(error);
    }
  }

  async listarAcopiosPorEmpresa(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const empresaId = String(req.params.empresaId);
      const acopios = await this.acopioRepo.findByEmpresaId(empresaId);
      res.status(200).json({
        success: true,
        data: acopios,
      });
    } catch (error) {
      next(error);
    }
  }

  async eliminarAcopio(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const acopioId = String(req.params.acopioId);
      await this.acopioRepo.delete(acopioId);
      res.status(200).json({
        success: true,
        message: 'Acopio eliminado correctamente',
      });
    } catch (error) {
      next(error);
    }
  }
}
