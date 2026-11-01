// Capa 1: Domain - src/domain/repositories/IInventarioKilosRepository.ts

import { InventarioKilos } from '../entities/InventarioKilos.js';
import { TipoPalta } from '../constants/clasificacion.js';

export interface InventarioConUbicacion {
  inventarioId: string;
  ubicacionId: string;
  ubicacionNombre: string;
  ubicacionTipo: string;
  tipoPalta: TipoPalta;
  categoria: string;
  kilosDisponibles: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface IInventarioKilosRepository {
  findByUbicacionYPalta(
    ubicacionId: string,
    tipoPalta: TipoPalta,
    categoria: string
  ): Promise<InventarioKilos | null>;
  save(inventario: InventarioKilos): Promise<InventarioKilos>;
  findByUbicacionId(ubicacionId: string): Promise<InventarioKilos[]>;
  findByEmpresaId(empresaId: string): Promise<InventarioConUbicacion[]>;
}
