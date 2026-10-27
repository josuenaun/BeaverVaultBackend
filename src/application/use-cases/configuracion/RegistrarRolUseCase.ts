// Capa 2: Application - src/application/use-cases/configuracion/RegistrarRolUseCase.ts

import { Rol } from '../../../domain/entities/Rol.js';
import { IRolRepository } from '../../../domain/repositories/IRolRepository.js';
import { RegistrarRolInputDTO } from '../../dtos/ConfiguracionDTO.js';
import { ValidationError } from '../../../domain/errors/DomainError.js';

export class RegistrarRolUseCase {
  constructor(private readonly rolRepo: IRolRepository) {}

  async execute(input: RegistrarRolInputDTO): Promise<Rol> {
    if (!input.nombre || input.nombre.trim().length === 0) {
      throw new ValidationError('El nombre del rol es obligatorio');
    }

    const existe = await this.rolRepo.findByNombre(input.nombre);
    if (existe) {
      throw new ValidationError(`El rol "${input.nombre}" ya existe`);
    }

    const rol = new Rol({
      nombre: input.nombre,
      descripcion: input.descripcion ?? null,
    });

    return await this.rolRepo.save(rol);
  }
}
