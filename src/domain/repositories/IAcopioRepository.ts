// Capa 1: Domain - src/domain/repositories/IAcopioRepository.ts

import { Acopio } from '../entities/Acopio.js';
import { EstadoAcopio } from '../constants/clasificacion.js';

export interface IAcopioRepository {
  save(acopio: Acopio): Promise<Acopio>;
  findById(acopioId: string): Promise<Acopio | null>;
  findByEmpresaId(empresaId: string): Promise<Acopio[]>;
  updateFlete(acopioId: string, fleteCosto: number): Promise<void>;
  updateEstado(acopioId: string, estado: EstadoAcopio, fechaLlegada?: Date | null): Promise<void>;
  verificarYLiquidarSiAgotado(acopioId: string): Promise<boolean>;
  delete(acopioId: string): Promise<void>;
}
