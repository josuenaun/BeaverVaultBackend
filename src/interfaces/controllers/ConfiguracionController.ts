// Capa 3: Interfaces - src/interfaces/controllers/ConfiguracionController.ts

import { Request, Response, NextFunction } from 'express';
import { RegistrarRolUseCase } from '../../application/use-cases/configuracion/RegistrarRolUseCase.js';
import { RegistrarEmpresaUseCase } from '../../application/use-cases/configuracion/RegistrarEmpresaUseCase.js';
import { RegistrarUbicacionUseCase } from '../../application/use-cases/configuracion/RegistrarUbicacionUseCase.js';
import { RegistrarUsuarioUseCase } from '../../application/use-cases/configuracion/RegistrarUsuarioUseCase.js';
import { RegistrarSuperAdminUseCase } from '../../application/use-cases/configuracion/RegistrarSuperAdminUseCase.js';
import { IEmpresaRepository } from '../../domain/repositories/IEmpresaRepository.js';
import { IUbicacionRepository } from '../../domain/repositories/IUbicacionRepository.js';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository.js';
import { IRolRepository } from '../../domain/repositories/IRolRepository.js';
import { ISuperAdministradorRepository } from '../../domain/repositories/ISuperAdministradorRepository.js';

export class ConfiguracionController {
  constructor(
    private readonly registrarRolUseCase: RegistrarRolUseCase,
    private readonly registrarEmpresaUseCase: RegistrarEmpresaUseCase,
    private readonly registrarUbicacionUseCase: RegistrarUbicacionUseCase,
    private readonly registrarUsuarioUseCase: RegistrarUsuarioUseCase,
    private readonly registrarSuperAdminUseCase: RegistrarSuperAdminUseCase,
    private readonly empresaRepo: IEmpresaRepository,
    private readonly ubicacionRepo: IUbicacionRepository,
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly rolRepo: IRolRepository,
    private readonly superAdminRepo: ISuperAdministradorRepository
  ) {}

  // --- Super Administradores ---
  async crearSuperAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const admin = await this.registrarSuperAdminUseCase.execute({
        nombre: req.body.nombre,
        correo: req.body.correo,
        contrasena: req.body.contrasena,
      });

      res.status(201).json({
        success: true,
        message: 'Super Administrador creado exitosamente con contraseña hasheada',
        data: {
          superAdminId: admin.superAdminId,
          nombre: admin.nombre,
          correo: admin.correo,
          activo: admin.activo,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async listarSuperAdmins(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const admins = await this.superAdminRepo.findAll();
      res.status(200).json({
        success: true,
        data: admins.map((a) => ({
          superAdminId: a.superAdminId,
          nombre: a.nombre,
          correo: a.correo,
          activo: a.activo,
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  async eliminarSuperAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const superAdminId = String(req.params.superAdminId);
      await this.superAdminRepo.delete(superAdminId);
      res.status(200).json({
        success: true,
        message: 'Super Administrador eliminado correctamente',
      });
    } catch (error) {
      next(error);
    }
  }

  // --- Roles ---
  async crearRol(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rol = await this.registrarRolUseCase.execute(req.body);
      res.status(201).json({
        success: true,
        message: 'Rol creado correctamente',
        data: rol,
      });
    } catch (error) {
      next(error);
    }
  }

  async listarRoles(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const roles = await this.rolRepo.findAll();
      res.status(200).json({
        success: true,
        data: roles,
      });
    } catch (error) {
      next(error);
    }
  }

  async eliminarRol(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rolId = String(req.params.rolId);
      await this.rolRepo.delete(rolId);
      res.status(200).json({
        success: true,
        message: 'Rol eliminado correctamente',
      });
    } catch (error) {
      next(error);
    }
  }

  // --- Empresas ---
  async crearEmpresa(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const empresa = await this.registrarEmpresaUseCase.execute(req.body);
      res.status(201).json({
        success: true,
        message: 'Empresa registrada correctamente',
        data: empresa,
      });
    } catch (error) {
      next(error);
    }
  }

  async listarEmpresas(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const empresas = await this.empresaRepo.findAll();
      res.status(200).json({
        success: true,
        data: empresas,
      });
    } catch (error) {
      next(error);
    }
  }

  async eliminarEmpresa(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const empresaId = String(req.params.empresaId);
      await this.empresaRepo.delete(empresaId);
      res.status(200).json({
        success: true,
        message: 'Empresa eliminada correctamente',
      });
    } catch (error) {
      next(error);
    }
  }

  // --- Ubicaciones ---
  async crearUbicacion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ubicacion = await this.registrarUbicacionUseCase.execute(req.body);
      res.status(201).json({
        success: true,
        message: 'Ubicación registrada correctamente',
        data: ubicacion,
      });
    } catch (error) {
      next(error);
    }
  }

  async listarUbicacionesPorEmpresa(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const empresaId = String(req.params.empresaId);
      const ubicaciones = await this.ubicacionRepo.findByEmpresaId(empresaId);
      res.status(200).json({
        success: true,
        data: ubicaciones,
      });
    } catch (error) {
      next(error);
    }
  }

  async eliminarUbicacion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ubicacionId = String(req.params.ubicacionId);
      await this.ubicacionRepo.delete(ubicacionId);
      res.status(200).json({
        success: true,
        message: 'Ubicación eliminada correctamente',
      });
    } catch (error) {
      next(error);
    }
  }

  // --- Usuarios ---
  async crearUsuario(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuario = await this.registrarUsuarioUseCase.execute({
        empresaId: req.body.empresaId,
        rolId: req.body.rolId,
        nombre: req.body.nombre,
        correo: req.body.correo,
        contrasena: req.body.contrasena,
      });

      res.status(201).json({
        success: true,
        message: 'Usuario registrado correctamente con contraseña hasheada',
        data: {
          usuarioId: usuario.usuarioId,
          empresaId: usuario.empresaId,
          rolId: usuario.rolId,
          nombre: usuario.nombre,
          correo: usuario.correo,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async listarUsuariosPorEmpresa(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const empresaId = String(req.params.empresaId);
      const usuarios = await this.usuarioRepo.findByEmpresaId(empresaId);
      res.status(200).json({
        success: true,
        data: usuarios.map((u) => ({
          usuarioId: u.usuarioId,
          empresaId: u.empresaId,
          rolId: u.rolId,
          nombre: u.nombre,
          correo: u.correo,
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  async eliminarUsuario(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = String(req.params.usuarioId);
      await this.usuarioRepo.delete(usuarioId);
      res.status(200).json({
        success: true,
        message: 'Usuario eliminado correctamente',
      });
    } catch (error) {
      next(error);
    }
  }
}
