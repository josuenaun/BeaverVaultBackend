// Capa 1: Domain - src/domain/entities/Venta.ts

import { ValidationError } from '../errors/DomainError.js';
import { DetalleVenta } from './DetalleVenta.js';

export { DetalleVenta, DetalleVentaProps } from './DetalleVenta.js';

export interface VentaProps {
  ventaId?: string;
  empresaId: string;
  ubicacionId?: string;
  ubicacionNombre?: string;
  vendedorUsuarioId: string;
  fechaVenta?: Date;
  detalles: DetalleVenta[];
  montoTotal?: number;
  metodoPago?: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export class Venta {
  readonly ventaId?: string;
  readonly empresaId: string;
  readonly ubicacionId?: string;
  readonly ubicacionNombre?: string;
  readonly vendedorUsuarioId: string;
  readonly fechaVenta: Date;
  readonly metodoPago: string;
  private _detalles: DetalleVenta[];
  private _montoTotal: number;
  readonly fechaCreacion: Date;
  readonly fechaActualizacion: Date;

  constructor(props: VentaProps) {
    if (!props.empresaId) {
      throw new ValidationError('El ID de empresa es requerido');
    }
    if (!props.vendedorUsuarioId) {
      throw new ValidationError('El ID del vendedor (usuario) es requerido');
    }
    if (!props.detalles || props.detalles.length === 0) {
      throw new ValidationError('La venta debe incluir al menos un detalle de producto');
    }

    this.ventaId = props.ventaId;
    this.empresaId = props.empresaId;
    this.ubicacionId = props.ubicacionId;
    this.ubicacionNombre = props.ubicacionNombre;
    this.vendedorUsuarioId = props.vendedorUsuarioId;
    this.fechaVenta = props.fechaVenta ?? new Date();
    this.metodoPago = props.metodoPago || 'Efectivo';
    this._detalles = [...props.detalles];
    this._montoTotal = props.montoTotal ?? this.calcularMontoTotal();
    this.fechaCreacion = props.fechaCreacion ?? new Date();
    this.fechaActualizacion = props.fechaActualizacion ?? new Date();
  }

  get detalles(): readonly DetalleVenta[] {
    return this._detalles;
  }

  get montoTotal(): number {
    return this._montoTotal;
  }

  private calcularMontoTotal(): number {
    const total = this._detalles.reduce((sum, d) => sum + d.subtotal, 0);
    return Number(total.toFixed(2));
  }

  toJSON() {
    return {
      ventaId: this.ventaId,
      empresaId: this.empresaId,
      ubicacionId: this.ubicacionId,
      ubicacionNombre: this.ubicacionNombre,
      vendedorUsuarioId: this.vendedorUsuarioId,
      fechaVenta: this.fechaVenta,
      metodoPago: this.metodoPago,
      montoTotal: this._montoTotal,
      detalles: this._detalles.map((d) => (typeof d.toJSON === 'function' ? d.toJSON() : d)),
      fechaCreacion: this.fechaCreacion,
      fechaActualizacion: this.fechaActualizacion,
    };
  }
}
