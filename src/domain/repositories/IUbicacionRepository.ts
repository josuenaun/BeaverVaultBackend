// Capa 1: Domain - src/domain/repositories/IUbicacionRepository.ts

import { Ubicacion } from '../entities/Ubicacion.js';

export interface IUbicacionRepository {
  save(ubicacion: Ubicacion): Promise<Ubicacion>;
  findById(ubicacionId: string): Promise<Ubicacion | null>;
  findByEmpresaId(empresaId: string): Promise<Ubicacion[]>;
  delete(ubicacionId: string): Promise<void>;
}
