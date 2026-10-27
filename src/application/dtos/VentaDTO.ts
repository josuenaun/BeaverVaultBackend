// Capa 2: Application - src/application/dtos/VentaDTO.ts

import { TipoPalta } from '../../domain/constants/clasificacion.js';

export interface DetalleVentaItemDTO {
  tipoPalta: TipoPalta;
  categoria: string;
  kilosVendidos: number;
  precioUnitario: number;
}

export interface RegistrarVentaInputDTO {
  empresaId: string;
  vendedorUsuarioId: string;
  ubicacionId: string;
  detalles: DetalleVentaItemDTO[];
}

export interface TransformarJabasInputDTO {
  jabaId: string;
  ubicacionId: string;
}

export interface RegistrarFiadoInputDTO {
  empresaId: string;
  nombreDeudor: string;
  motivoDeuda: string;
  montoDeuda: number;
  fechaAdvertencia: Date;
  creadoPorUsuarioId: string;
}
