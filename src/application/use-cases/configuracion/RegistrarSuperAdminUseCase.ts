// Capa 2: Application - src/application/use-cases/configuracion/RegistrarSuperAdminUseCase.ts

import bcrypt from 'bcryptjs';
import { SuperAdministrador } from '../../../domain/entities/SuperAdministrador.js';
import { ISuperAdministradorRepository } from '../../../domain/repositories/ISuperAdministradorRepository.js';
import { RegistrarSuperAdminInputDTO } from '../../dtos/configuracion.dto.js';
import { ValidationError } from '../../../domain/errors/DomainError.js';

export class RegistrarSuperAdminUseCase {
  constructor(private readonly superAdminRepo: ISuperAdministradorRepository) {}

  async execute(input: RegistrarSuperAdminInputDTO): Promise<SuperAdministrador> {
    if (!input.nombre || input.nombre.trim().length === 0) {
      throw new ValidationError('El nombre del super administrador es obligatorio');
    }
    if (!input.correo || !input.correo.includes('@')) {
      throw new ValidationError('El correo proporcionado no tiene un formato válido');
    }
    if (!input.contrasena || input.contrasena.trim().length < 6) {
      throw new ValidationError('La contraseña debe tener al menos 6 caracteres');
    }

    const existe = await this.superAdminRepo.findByCorreo(input.correo);
    if (existe) {
      throw new ValidationError(`El correo "${input.correo}" ya se encuentra registrado`);
    }

    // Hashear automáticamente la contraseña en backend
    const salt = await bcrypt.genSalt(10);
    const contrasenaHash = await bcrypt.hash(input.contrasena, salt);

    const superAdmin = new SuperAdministrador({
      nombre: input.nombre,
      correo: input.correo,
      contrasenaHash,
      activo: true,
    });

    return await this.superAdminRepo.save(superAdmin);
  }
}
