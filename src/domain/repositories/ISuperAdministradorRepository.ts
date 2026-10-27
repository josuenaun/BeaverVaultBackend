// Capa 1: Domain - src/domain/repositories/ISuperAdministradorRepository.ts

import { SuperAdministrador } from '../entities/SuperAdministrador.js';

export interface ISuperAdministradorRepository {
  save(admin: SuperAdministrador): Promise<SuperAdministrador>;
  findById(superAdminId: string): Promise<SuperAdministrador | null>;
  findByCorreo(correo: string): Promise<SuperAdministrador | null>;
  findAll(): Promise<SuperAdministrador[]>;
  delete(superAdminId: string): Promise<void>;
}
