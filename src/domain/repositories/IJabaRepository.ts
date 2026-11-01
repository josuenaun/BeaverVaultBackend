// Capa 1: Domain - src/domain/repositories/IJabaRepository.ts

import { Jaba } from '../entities/Jaba.js';
import { EstadoJaba } from '../constants/clasificacion.js';

export interface IJabaRepository {
  saveMany(jabas: Jaba[]): Promise<Jaba[]>;
  findById(jabaId: string): Promise<Jaba | null>;
  findByAcopioId(acopioId: string): Promise<Jaba[]>;
  findByUbicacionId(ubicacionId: string): Promise<Jaba[]>;
  updateUbicacion(jabaId: string, ubicacionId: string): Promise<void>;
  updateEstado(jabaId: string, estado: EstadoJaba): Promise<void>;
  updateUbicacionYEstadoByAcopio(acopioId: string, ubicacionId: string | null, estado: EstadoJaba): Promise<void>;
  dividirJaba(jabaId: string, cantidadSeparar: number, pesoSeparado: number, ubicacionId: string): Promise<{ original: Jaba; nueva: Jaba }>;
}
