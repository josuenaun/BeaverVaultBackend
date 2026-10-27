// Capa 1: Domain - src/domain/repositories/IVentaRepository.ts

import { Venta } from '../entities/Venta.js';

export interface IVentaRepository {
  save(venta: Venta): Promise<Venta>;
  findById(ventaId: string): Promise<Venta | null>;
  findByEmpresaId(empresaId: string): Promise<Venta[]>;
}
