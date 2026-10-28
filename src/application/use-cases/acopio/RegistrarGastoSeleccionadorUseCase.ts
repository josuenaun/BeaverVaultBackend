// Capa 2: Application - src/application/use-cases/acopio/RegistrarGastoSeleccionadorUseCase.ts

import { GastoOperativo } from '../../../domain/entities/GastoOperativo.js';
import { IGastoOperativoRepository } from '../../../domain/repositories/IGastoOperativoRepository.js';
import { IAcopioRepository } from '../../../domain/repositories/IAcopioRepository.js';
import { ValidationError } from '../../../domain/errors/DomainError.js';
import { RegistrarGastoSeleccionadorInputDTO } from '../../dtos/acopio.dto.js';

export class RegistrarGastoSeleccionadorUseCase {
  constructor(
    private readonly gastoRepo: IGastoOperativoRepository,
    private readonly acopioRepo: IAcopioRepository
  ) {}

  async execute(input: RegistrarGastoSeleccionadorInputDTO): Promise<GastoOperativo> {
    const acopio = await this.acopioRepo.findById(input.acopioId);
    if (!acopio) {
      throw new ValidationError(`Acopio con ID ${input.acopioId} no encontrado`);
    }

    if (input.cantidadJabas <= 0) {
      throw new ValidationError('La cantidad de jabas procesadas debe ser mayor a 0');
    }
    if (input.tarifaPorJaba <= 0) {
      throw new ValidationError('La tarifa por jaba debe ser mayor a 0');
    }

    const montoTotal = Number((input.cantidadJabas * input.tarifaPorJaba).toFixed(2));
    const concepto = input.concepto ?? `Pago a seleccionador (${input.nombreReceptor}) por ${input.cantidadJabas} jabas`;

    const gasto = new GastoOperativo({
      acopioId: input.acopioId,
      nombreReceptor: input.nombreReceptor,
      tipoGasto: 'Seleccionador',
      concepto,
      cantidadJabas: input.cantidadJabas,
      tarifaPorJaba: input.tarifaPorJaba,
      montoTotal,
      usuarioRegistroId: input.usuarioRegistroId,
    });

    return await this.gastoRepo.save(gasto);
  }
}
