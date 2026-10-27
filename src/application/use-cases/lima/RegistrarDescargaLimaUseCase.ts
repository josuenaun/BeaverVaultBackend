// Capa 2: Application - src/application/use-cases/lima/RegistrarDescargaLimaUseCase.ts

import { GastoOperativo } from '../../../domain/entities/GastoOperativo.js';
import { IGastoOperativoRepository } from '../../../domain/repositories/IGastoOperativoRepository.js';
import { IAcopioRepository } from '../../../domain/repositories/IAcopioRepository.js';
import { ValidationError } from '../../../domain/errors/DomainError.js';
import { RegistrarDescargaLimaInputDTO } from '../../dtos/AcopioDTO.js';

export class RegistrarDescargaLimaUseCase {
  constructor(
    private readonly gastoRepo: IGastoOperativoRepository,
    private readonly acopioRepo: IAcopioRepository
  ) {}

  async execute(input: RegistrarDescargaLimaInputDTO): Promise<GastoOperativo> {
    if (input.tipoGasto !== 'Estibador' && input.tipoGasto !== 'Cargador') {
      throw new ValidationError('El tipo de gasto de descarga debe ser "Estibador" o "Cargador"');
    }

    const acopio = await this.acopioRepo.findById(input.acopioId);
    if (!acopio) {
      throw new ValidationError(`Acopio con ID ${input.acopioId} no encontrado`);
    }

    if (input.cantidadJabas <= 0) {
      throw new ValidationError('La cantidad de jabas debe ser mayor a 0');
    }
    if (input.tarifaPorJaba <= 0) {
      throw new ValidationError('La tarifa por jaba/bulto debe ser mayor a 0');
    }

    // Marca el acopio como Recibido con fecha de llegada
    await this.acopioRepo.updateEstado(input.acopioId, 'Recibido', new Date());

    const montoTotal = Number((input.cantidadJabas * input.tarifaPorJaba).toFixed(2));
    const concepto = input.concepto ?? `Pago de descarga (${input.tipoGasto} - ${input.nombreReceptor}) por ${input.cantidadJabas} jabas`;

    const gasto = new GastoOperativo({
      acopioId: input.acopioId,
      nombreReceptor: input.nombreReceptor,
      tipoGasto: input.tipoGasto,
      concepto,
      cantidadJabas: input.cantidadJabas,
      tarifaPorJaba: input.tarifaPorJaba,
      montoTotal,
      usuarioRegistroId: input.usuarioRegistroId,
    });

    return await this.gastoRepo.save(gasto);
  }
}
