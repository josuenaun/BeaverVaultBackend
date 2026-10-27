// Capa 1: Domain - src/domain/repositories/IFiadoRepository.ts

import { Fiado } from '../entities/Fiado.js';
import { EstadoFiado } from '../constants/clasificacion.js';

export interface IFiadoRepository {
  save(fiado: Fiado): Promise<Fiado>;
  findById(fiadoId: string): Promise<Fiado | null>;
  findByEmpresaId(empresaId: string): Promise<Fiado[]>;
  updateEstado(fiadoId: string, estado: EstadoFiado): Promise<void>;
  delete(fiadoId: string): Promise<void>;
}
