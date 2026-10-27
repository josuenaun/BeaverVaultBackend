// Capa 2: Application - src/application/dtos/AcopioDTO.ts

import { TipoPalta } from '../../domain/constants/clasificacion.js';

export interface JabaItemDTO {
  tipoPalta: TipoPalta;
  categoria: string;
  codigoColor: string;
  cantidadJabas: number;
  pesoBruto: number;
  ubicacionId?: string | null;
}

export interface RegistrarAcopioInputDTO {
  empresaId: string;
  encargadoLote: string;
  fechaCompra: Date;
  origen: string;
  creadoPorUsuarioId: string;
  jabas: JabaItemDTO[];
}

export interface RegistrarGastoSeleccionadorInputDTO {
  acopioId: string;
  nombreReceptor: string;
  cantidadJabas: number;
  tarifaPorJaba: number;
  usuarioRegistroId: string;
  concepto?: string;
}

export interface RegistrarTransporteInputDTO {
  acopioId: string;
  fleteCosto: number;
  nombreReceptor: string;
  usuarioRegistroId: string;
  concepto?: string;
}

export interface RegistrarDescargaLimaInputDTO {
  acopioId: string;
  tipoGasto: 'Estibador' | 'Cargador';
  nombreReceptor: string;
  cantidadJabas: number;
  tarifaPorJaba: number;
  usuarioRegistroId: string;
  concepto?: string;
}

export interface DistribuirJabaInputDTO {
  jabaId: string;
  ubicacionId: string;
}
