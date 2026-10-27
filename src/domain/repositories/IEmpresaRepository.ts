// Capa 1: Domain - src/domain/repositories/IEmpresaRepository.ts

import { Empresa } from '../entities/Empresa.js';

export interface IEmpresaRepository {
  save(empresa: Empresa): Promise<Empresa>;
  findById(empresaId: string): Promise<Empresa | null>;
  findAll(): Promise<Empresa[]>;
  delete(empresaId: string): Promise<void>;
}
