// Capa 2: Application - src/application/use-cases/fiados/RegistrarFiadoUseCase.ts

import { Fiado } from '../../../domain/entities/Fiado.js';
import { IFiadoRepository } from '../../../domain/repositories/IFiadoRepository.js';
import { RegistrarFiadoInputDTO } from '../../dtos/VentaDTO.js';

export class RegistrarFiadoUseCase {
  constructor(private readonly fiadoRepo: IFiadoRepository) {}

  async execute(input: RegistrarFiadoInputDTO): Promise<Fiado> {
    const fiado = new Fiado({
      empresaId: input.empresaId,
      nombreDeudor: input.nombreDeudor,
      motivoDeuda: input.motivoDeuda,
      montoDeuda: input.montoDeuda,
      fechaAdvertencia: input.fechaAdvertencia,
      creadoPorUsuarioId: input.creadoPorUsuarioId,
      estado: 'Pendiente',
    });

    return await this.fiadoRepo.save(fiado);
  }
}
