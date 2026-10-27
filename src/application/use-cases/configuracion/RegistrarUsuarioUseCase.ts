// Capa 2: Application - src/application/use-cases/configuracion/RegistrarUsuarioUseCase.ts

import bcrypt from 'bcryptjs';
import { Usuario } from '../../../domain/entities/Usuario.js';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository.js';
import { IEmpresaRepository } from '../../../domain/repositories/IEmpresaRepository.js';
import { IRolRepository } from '../../../domain/repositories/IRolRepository.js';
import { RegistrarUsuarioInputDTO } from '../../dtos/ConfiguracionDTO.js';
import { ValidationError } from '../../../domain/errors/DomainError.js';

export class RegistrarUsuarioUseCase {
  constructor(
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly empresaRepo: IEmpresaRepository,
    private readonly rolRepo: IRolRepository
  ) {}

  async execute(input: RegistrarUsuarioInputDTO): Promise<Usuario> {
    if (!input.contrasena || input.contrasena.trim().length < 6) {
      throw new ValidationError('La contraseña debe tener al menos 6 caracteres');
    }

    const empresa = await this.empresaRepo.findById(input.empresaId);
    if (!empresa) {
      throw new ValidationError(`Empresa con ID ${input.empresaId} no encontrada`);
    }

    const rol = await this.rolRepo.findById(input.rolId);
    if (!rol) {
      throw new ValidationError(`Rol con ID ${input.rolId} no encontrado`);
    }

    const existeCorreo = await this.usuarioRepo.findByCorreo(input.correo);
    if (existeCorreo) {
      throw new ValidationError(`El correo ${input.correo} ya se encuentra registrado`);
    }

    // Hashear automáticamente la contraseña antes de guardar en base de datos
    const salt = await bcrypt.genSalt(10);
    const contrasenaHash = await bcrypt.hash(input.contrasena, salt);

    const usuario = new Usuario({
      empresaId: input.empresaId,
      rolId: input.rolId,
      nombre: input.nombre,
      correo: input.correo,
      contrasenaHash,
    });

    return await this.usuarioRepo.save(usuario);
  }
}
