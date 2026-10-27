// Capa 1: Domain - src/domain/repositories/IGastoOperativoRepository.ts

import { GastoOperativo } from '../entities/GastoOperativo.js';
import { TipoGasto } from '../constants/clasificacion.js';

export interface IGastoOperativoRepository {
  save(gasto: GastoOperativo): Promise<GastoOperativo>;
  findById(gastoId: string): Promise<GastoOperativo | null>;
  findByAcopioId(acopioId: string): Promise<GastoOperativo[]>;
  findByTipo(tipoGasto: TipoGasto): Promise<GastoOperativo[]>;
}
