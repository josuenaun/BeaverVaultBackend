// Capa 2: Application - src/application/use-cases/lima/DistribuirUbicacionUseCase.ts

import { IJabaRepository } from '../../../domain/repositories/IJabaRepository.js';
import { ValidationError } from '../../../domain/errors/DomainError.js';
import { DistribuirJabaInputDTO } from '../../dtos/lima.dto.js';

export class DistribuirUbicacionUseCase {
  constructor(private readonly jabaRepo: IJabaRepository) {}

  async execute(input: DistribuirJabaInputDTO): Promise<void> {
    if (!input.ubicacionId) {
      throw new ValidationError('El ID de ubicación de destino es requerido');
    }

    const jaba = await this.jabaRepo.findById(input.jabaId);
    if (!jaba) {
      throw new ValidationError(`Lote de jaba con ID ${input.jabaId} no encontrado`);
    }

    jaba.trasladar(input.ubicacionId);
    await this.jabaRepo.updateUbicacion(input.jabaId, input.ubicacionId);
    await this.jabaRepo.updateEstado(input.jabaId, 'Almacenada');
  }
}
