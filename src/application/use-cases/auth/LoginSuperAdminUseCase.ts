// Capa 2: Application - src/application/use-cases/auth/LoginSuperAdminUseCase.ts

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ISuperAdministradorRepository } from '../../../domain/repositories/ISuperAdministradorRepository.js';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository.js';
import { LoginInputDTO, AuthResponseDTO } from '../../dtos/AuthDTO.js';
import { ValidationError, BusinessRuleError } from '../../../domain/errors/DomainError.js';
import { config } from '../../../infrastructure/config/env.js';

export class LoginSuperAdminUseCase {
  constructor(
    private readonly superAdminRepo: ISuperAdministradorRepository,
    private readonly usuarioRepo?: IUsuarioRepository
  ) {}

  async execute(input: LoginInputDTO): Promise<AuthResponseDTO> {
    if (!input.correo || !input.contrasena) {
      throw new ValidationError('El correo y la contraseña son obligatorios');
    }

    // 1. Intentar autenticar contra super_administradores
    const admin = await this.superAdminRepo.findByCorreo(input.correo);
    if (admin) {
      if (!admin.activo) {
        throw new BusinessRuleError('La cuenta de super administrador se encuentra inactiva');
      }

      const esValida = await bcrypt.compare(input.contrasena, admin.contrasenaHash);
      if (!esValida) {
        throw new BusinessRuleError('Credenciales incorrectas');
      }

      const token = jwt.sign(
        {
          superAdminId: admin.superAdminId,
          nombre: admin.nombre,
          correo: admin.correo,
          rol: 'SUPER_ADMIN',
        },
        config.jwtSecret,
        { expiresIn: '8h' }
      );

      return {
        token,
        superAdmin: {
          superAdminId: admin.superAdminId!,
          nombre: admin.nombre,
          correo: admin.correo,
        },
      };
    }

    // 2. Si no es super administrador, intentar autenticar contra tabla usuarios
    if (this.usuarioRepo) {
      const usuario = await this.usuarioRepo.findByCorreo(input.correo);
      if (usuario) {
        const esValida = await bcrypt.compare(input.contrasena, usuario.contrasenaHash);
        if (!esValida) {
          throw new BusinessRuleError('Credenciales incorrectas');
        }

        const token = jwt.sign(
          {
            usuarioId: usuario.usuarioId,
            empresaId: usuario.empresaId,
            rolId: usuario.rolId,
            nombre: usuario.nombre,
            correo: usuario.correo,
            rol: 'USUARIO',
          },
          config.jwtSecret,
          { expiresIn: '8h' }
        );

        return {
          token,
          usuario: {
            usuarioId: usuario.usuarioId!,
            empresaId: usuario.empresaId,
            rolId: usuario.rolId,
            nombre: usuario.nombre,
            correo: usuario.correo,
          },
        };
      }
    }

    // 3. No encontrado en ninguna tabla o contraseña incorrecta
    throw new BusinessRuleError('Credenciales incorrectas');
  }
}
