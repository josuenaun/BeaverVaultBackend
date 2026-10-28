// Capa 2: Application - src/application/use-cases/transporte/RegistrarTransporteUseCase.ts

import { GastoOperativo } from '../../../domain/entities/GastoOperativo.js';
import { IAcopioRepository } from '../../../domain/repositories/IAcopioRepository.js';
import { IGastoOperativoRepository } from '../../../domain/repositories/IGastoOperativoRepository.js';
import { IJabaRepository } from '../../../domain/repositories/IJabaRepository.js';
import { ValidationError } from '../../../domain/errors/DomainError.js';
import { RegistrarTransporteInputDTO } from '../../dtos/transporte.dto.js';

export class RegistrarTransporteUseCase {
  constructor(
    private readonly acopioRepo: IAcopioRepository,
    private readonly jabaRepo: IJabaRepository,
    private readonly gastoRepo: IGastoOperativoRepository
  ) {}

  async execute(input: RegistrarTransporteInputDTO): Promise<{ acopioId: string; gastoFlete: GastoOperativo }> {
    const acopio = await this.acopioRepo.findById(input.acopioId);
    if (!acopio) {
      throw new ValidationError(`Acopio con ID ${input.acopioId} no encontrado`);
    }

    if (input.fleteCosto <= 0) {
      throw new ValidationError('El costo del flete debe ser mayor a 0');
    }

    // Actualiza el costo de flete y mantiene / confirma estado En Transito
    await this.acopioRepo.updateFlete(input.acopioId, input.fleteCosto);
    await this.acopioRepo.updateEstado(input.acopioId, 'En Transito');

    // Actualiza el estado de las jabas del acopio a 'En Transito'
    await this.jabaRepo.updateUbicacionYEstadoByAcopio(input.acopioId, null, 'En Transito');

    const totalJabas = acopio.totalJabas;
    const tarifaPorJaba = totalJabas > 0 ? Number((input.fleteCosto / totalJabas).toFixed(2)) : undefined;

    // Registra el gasto operativo en gastos_operativos con tipo_gasto = 'Transporte'
    const gasto = new GastoOperativo({
      acopioId: input.acopioId,
      nombreReceptor: input.nombreReceptor,
      tipoGasto: 'Transporte',
      concepto: input.concepto ?? `Flete de transporte contratado con ${input.nombreReceptor}`,
      cantidadJabas: totalJabas,
      tarifaPorJaba: tarifaPorJaba,
      montoTotal: input.fleteCosto,
      usuarioRegistroId: input.usuarioRegistroId,
    });

    const gastoGuardado = await this.gastoRepo.save(gasto);

    return {
      acopioId: input.acopioId,
      gastoFlete: gastoGuardado,
    };
  }
}
