// Capa 2: Application - src/application/use-cases/configuracion/RegistrarUbicacionUseCase.ts

import { Ubicacion } from '../../../domain/entities/Ubicacion.js';
import { IUbicacionRepository } from '../../../domain/repositories/IUbicacionRepository.js';
import { IEmpresaRepository } from '../../../domain/repositories/IEmpresaRepository.js';
import { RegistrarUbicacionInputDTO } from '../../dtos/configuracion.dto.js';
import { ValidationError } from '../../../domain/errors/DomainError.js';

export class RegistrarUbicacionUseCase {
  constructor(
    private readonly ubicacionRepo: IUbicacionRepository,
    private readonly empresaRepo: IEmpresaRepository
  ) {}

  async execute(input: RegistrarUbicacionInputDTO): Promise<Ubicacion> {
    const empresa = await this.empresaRepo.findById(input.empresaId);
    if (!empresa) {
      throw new ValidationError(`Empresa con ID ${input.empresaId} no encontrada`);
    }

    const ubicacion = new Ubicacion({
      empresaId: input.empresaId,
      nombre: input.nombre,
      tipo: input.tipo,
    });

    return await this.ubicacionRepo.save(ubicacion);
  }
}
