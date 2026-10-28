// Capa 3: Interfaces - src/interfaces/controllers/VentaController.ts

import { Request, Response, NextFunction } from 'express';
import { TransformarJabasAKilosUseCase } from '../../application/use-cases/ventas/TransformarJabasAKilosUseCase.js';
import { RegistrarVentaKilosUseCase } from '../../application/use-cases/ventas/RegistrarVentaKilosUseCase.js';
import { RegistrarFiadoUseCase } from '../../application/use-cases/fiados/RegistrarFiadoUseCase.js';
import { IInventarioKilosRepository } from '../../domain/repositories/IInventarioKilosRepository.js';
import { IVentaRepository } from '../../domain/repositories/IVentaRepository.js';
import { IFiadoRepository } from '../../domain/repositories/IFiadoRepository.js';
import { TransformarJabasInputSchema } from '../../application/dtos/transformacion.dto.js';
import { RegistrarVentaInputSchema } from '../../application/dtos/venta.dto.js';
import { RegistrarFiadoInputSchema } from '../../application/dtos/fiado.dto.js';

export class VentaController {
  constructor(
    private readonly transformarJabasAKilosUseCase: TransformarJabasAKilosUseCase,
    private readonly registrarVentaKilosUseCase: RegistrarVentaKilosUseCase,
    private readonly registrarFiadoUseCase: RegistrarFiadoUseCase,
    private readonly inventarioRepo: IInventarioKilosRepository,
    private readonly ventaRepo: IVentaRepository,
    private readonly fiadoRepo: IFiadoRepository
  ) {}

  async transformarJabas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const jabaId = String(req.params.jabaId);
      const input = TransformarJabasInputSchema.parse({
        ...req.body,
        jabaId,
      });
      const inventario = await this.transformarJabasAKilosUseCase.execute(input);

      res.status(200).json({
        success: true,
        message: 'Jaba convertida a kilos exitosamente (sin merma)',
        data: inventario,
      });
    } catch (error) {
      next(error);
    }
  }

  async registrarVenta(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = RegistrarVentaInputSchema.parse(req.body);
      const venta = await this.registrarVentaKilosUseCase.execute(input);
      res.status(201).json({
        success: true,
        message: 'Venta registrada con éxito',
        data: venta,
      });
    } catch (error) {
      next(error);
    }
  }

  async registrarFiado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = RegistrarFiadoInputSchema.parse(req.body);
      const fiado = await this.registrarFiadoUseCase.execute(input);

      res.status(201).json({
        success: true,
        message: 'Fiado registrado con éxito',
        data: fiado,
      });
    } catch (error) {
      next(error);
    }
  }

  async listarInventarioPorUbicacion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ubicacionId = String(req.params.ubicacionId);
      const inventarios = await this.inventarioRepo.findByUbicacionId(ubicacionId);
      res.status(200).json({
        success: true,
        data: inventarios,
      });
    } catch (error) {
      next(error);
    }
  }

  async listarVentasPorEmpresa(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const empresaId = String(req.params.empresaId);
      const ventas = await this.ventaRepo.findByEmpresaId(empresaId);
      res.status(200).json({
        success: true,
        data: ventas,
      });
    } catch (error) {
      next(error);
    }
  }

  async listarFiadosPorEmpresa(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const empresaId = String(req.params.empresaId);
      const fiados = await this.fiadoRepo.findByEmpresaId(empresaId);
      res.status(200).json({
        success: true,
        data: fiados,
      });
    } catch (error) {
      next(error);
    }
  }

  async eliminarFiado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fiadoId = String(req.params.fiadoId);
      await this.fiadoRepo.delete(fiadoId);
      res.status(200).json({
        success: true,
        message: 'Fiado eliminado correctamente',
      });
    } catch (error) {
      next(error);
    }
  }
}
