// Capa 1: Domain - src/domain/entities/DetalleVenta.ts

import { TipoPalta, validarClasificacion } from '../constants/clasificacion.js';
import { ValidationError } from '../errors/DomainError.js';

export interface DetalleVentaProps {
  detalleId?: string;
  ventaId?: string;
  tipoPalta: TipoPalta;
  categoria: string;
  kilosVendidos: number;
  precioUnitario: number;
  subtotal?: number;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export class DetalleVenta {
  readonly detalleId?: string;
  readonly ventaId?: string;
  readonly tipoPalta: TipoPalta;
  readonly categoria: string;
  readonly kilosVendidos: number;
  readonly precioUnitario: number;
  readonly subtotal: number;
  readonly fechaCreacion: Date;
  readonly fechaActualizacion: Date;

  constructor(props: DetalleVentaProps) {
    validarClasificacion(props.tipoPalta, props.categoria);

    if (props.kilosVendidos <= 0) {
      throw new ValidationError('Los kilos vendidos deben ser mayores a 0');
    }
    if (props.precioUnitario <= 0) {
      throw new ValidationError('El precio unitario por kilo debe ser mayor a 0');
    }

    this.detalleId = props.detalleId;
    this.ventaId = props.ventaId;
    this.tipoPalta = props.tipoPalta;
    this.categoria = props.categoria;
    this.kilosVendidos = props.kilosVendidos;
    this.precioUnitario = props.precioUnitario;
    this.subtotal = props.subtotal ?? Number((props.kilosVendidos * props.precioUnitario).toFixed(2));
    this.fechaCreacion = props.fechaCreacion ?? new Date();
    this.fechaActualizacion = props.fechaActualizacion ?? new Date();
  }

  toJSON() {
    return {
      detalleId: this.detalleId,
      ventaId: this.ventaId,
      tipoPalta: this.tipoPalta,
      categoria: this.categoria,
      kilosVendidos: this.kilosVendidos,
      precioUnitario: this.precioUnitario,
      subtotal: this.subtotal,
      fechaCreacion: this.fechaCreacion,
      fechaActualizacion: this.fechaActualizacion,
    };
  }
}
