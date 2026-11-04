// Capa 2: Application - src/application/use-cases/ventas/RegistrarVentaKilosUseCase.ts

import { Venta, DetalleVenta } from '../../../domain/entities/Venta.js';
import { IVentaRepository } from '../../../domain/repositories/IVentaRepository.js';
import { IInventarioKilosRepository } from '../../../domain/repositories/IInventarioKilosRepository.js';
import { RegistrarVentaInputDTO } from '../../dtos/venta.dto.js';
import { BusinessRuleError, ValidationError } from '../../../domain/errors/DomainError.js';

export class RegistrarVentaKilosUseCase {
  constructor(
    private readonly ventaRepo: IVentaRepository,
    private readonly inventarioRepo: IInventarioKilosRepository
  ) {}

  async execute(input: RegistrarVentaInputDTO): Promise<Venta> {
    if (!input.detalles || input.detalles.length === 0) {
      throw new ValidationError('La venta debe incluir al menos un detalle de palta');
    }

    const detalleEntities: DetalleVenta[] = [];

    // Validar y descontar stock por cada item
    for (const item of input.detalles) {
      const inventario = await this.inventarioRepo.findByUbicacionYPalta(
        input.ubicacionId,
        item.tipoPalta,
        item.categoria
      );

      if (!inventario) {
        throw new BusinessRuleError(
          `No existe inventario registrado para ${item.tipoPalta} (${item.categoria}) en la ubicación ${input.ubicacionId}`
        );
      }

      inventario.descontarStock(item.kilosVendidos);
      await this.inventarioRepo.save(inventario);

      detalleEntities.push(
        new DetalleVenta({
          tipoPalta: item.tipoPalta,
          categoria: item.categoria,
          kilosVendidos: item.kilosVendidos,
          precioUnitario: item.precioUnitario,
        })
      );
    }

    const venta = new Venta({
      empresaId: input.empresaId,
      ubicacionId: input.ubicacionId,
      metodoPago: input.metodoPago,
      vendedorUsuarioId: input.vendedorUsuarioId,
      detalles: detalleEntities,
    });

    return await this.ventaRepo.save(venta);
  }
}
