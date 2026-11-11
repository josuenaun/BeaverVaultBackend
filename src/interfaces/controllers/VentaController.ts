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

  async listarInventarioPorEmpresa(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const empresaId = String(req.params.empresaId);
      const inventarios = await this.inventarioRepo.findByEmpresaId(empresaId);
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

  async actualizarFiado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fiadoId = String(req.params.fiadoId);
      const { montoAbono, montoDeuda, motivoDeuda, estado, nota, metodoPago, ventaId } = req.body;

      const fiadoExistente = await this.fiadoRepo.findById(fiadoId);
      if (!fiadoExistente) {
        res.status(404).json({ success: false, message: 'Fiado no encontrado' });
        return;
      }

      let nuevoMonto = montoDeuda !== undefined ? Number(montoDeuda) : fiadoExistente.montoDeuda;
      if (montoAbono !== undefined && Number(montoAbono) > 0) {
        nuevoMonto = Math.max(0, fiadoExistente.montoDeuda - Number(montoAbono));
      }

      // Si la deuda quedó en 0, eliminar o saldar completamente
      if (nuevoMonto <= 0) {
        await this.fiadoRepo.delete(fiadoId);

        // Si se envió ventaId o está vinculado en motivoDeuda, actualizar el método de pago de la venta a 'Fiado (Pagado)'
        const vid = ventaId || fiadoExistente.motivoDeuda?.match(/\[VID:([a-f0-9-]+)\]/i)?.[1];
        if (vid) {
          await this.ventaRepo.actualizarMetodoPago(vid, 'Fiado (Pagado)');
        }

        res.status(200).json({
          success: true,
          message: 'Deuda saldada en su totalidad',
          data: { fiadoId, saldado: true, saldoRestante: 0 },
        });
        return;
      }

      let nuevoMotivo = motivoDeuda || fiadoExistente.motivoDeuda;
      if (montoAbono && Number(montoAbono) > 0) {
        const detalleAbono = `[Abonó S/ ${Number(montoAbono).toFixed(2)}${metodoPago ? ` via ${metodoPago}` : ''}${nota ? ` - ${nota}` : ''}]`;
        nuevoMotivo = `${nuevoMotivo} ${detalleAbono}`.slice(0, 250);
      }

      let estadoFinal = estado || fiadoExistente.estado;
      if (estadoFinal === 'Mora') estadoFinal = 'Vencido';

      await this.fiadoRepo.actualizar(fiadoId, {
        montoDeuda: nuevoMonto,
        motivoDeuda: nuevoMotivo,
        estado: estadoFinal,
      });

      res.status(200).json({
        success: true,
        message: 'Abono registrado con éxito',
        data: {
          fiadoId,
          saldoRestante: nuevoMonto,
          motivoDeuda: nuevoMotivo,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async actualizarMetodoPagoVenta(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ventaId = String(req.params.ventaId);
      const { metodoPago } = req.body;
      if (!metodoPago) {
        res.status(400).json({ success: false, message: 'El método de pago es requerido' });
        return;
      }
      await this.ventaRepo.actualizarMetodoPago(ventaId, metodoPago);
      res.status(200).json({
        success: true,
        message: 'Método de pago de venta actualizado con éxito',
        data: { ventaId, metodoPago },
      });
    } catch (error) {
      next(error);
    }
  }

  async eliminarFiado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fiadoId = String(req.params.fiadoId);
      const ventaIdParam = req.query?.ventaId ? String(req.query.ventaId) : null;
      const fiadoExistente = await this.fiadoRepo.findById(fiadoId);
      const vid = ventaIdParam || fiadoExistente?.motivoDeuda?.match(/\[VID:([a-f0-9-]+)\]/i)?.[1];

      await this.fiadoRepo.delete(fiadoId);

      if (vid) {
        await this.ventaRepo.actualizarMetodoPago(vid, 'Fiado (Pagado)');
      }

      res.status(200).json({
        success: true,
        message: 'Fiado eliminado correctamente',
      });
    } catch (error) {
      next(error);
    }
  }
}
