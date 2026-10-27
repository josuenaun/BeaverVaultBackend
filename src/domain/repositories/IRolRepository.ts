// Capa 1: Domain - src/domain/repositories/IRolRepository.ts

import { Rol } from '../entities/Rol.js';

export interface IRolRepository {
  save(rol: Rol): Promise<Rol>;
  findById(rolId: string): Promise<Rol | null>;
  findByNombre(nombre: string): Promise<Rol | null>;
  findAll(): Promise<Rol[]>;
  delete(rolId: string): Promise<void>;
}
