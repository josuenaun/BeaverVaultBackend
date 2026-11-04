// Capa 1: Domain - src/domain/entities/Acopio.ts

import { EstadoAcopio } from '../constants/clasificacion.js';
import { ValidationError } from '../errors/DomainError.js';
import { Jaba } from './Jaba.js';

export interface AcopioProps {
  acopioId?: string;
  empresaId: string;
  encargadoLote: string;
  fechaCompra: string | Date;
  fechaLlegada?: Date | null;
  origen: string;
  fleteCosto?: number;
  estado?: EstadoAcopio;
  creadoPorUsuarioId: string;
  jabas?: Jaba[];
  gastos?: any[];
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export class Acopio {
  readonly acopioId?: string;
  readonly empresaId: string;
  readonly encargadoLote: string;
  readonly fechaCompra: string;
  private _fechaLlegada: Date | null;
  readonly origen: string;
  private _fleteCosto: number;
  private _estado: EstadoAcopio;
  readonly creadoPorUsuarioId: string;
  private _jabas: Jaba[];
  private _gastos: any[];
  readonly fechaCreacion: Date;
  readonly fechaActualizacion: Date;

  constructor(props: AcopioProps) {
    if (!props.encargadoLote || props.encargadoLote.trim().length === 0) {
      throw new ValidationError('El encargado del lote es requerido');
    }
    if (!props.origen || props.origen.trim().length === 0) {
      throw new ValidationError('El origen (provincia) es requerido');
    }
    if (!props.empresaId) {
      throw new ValidationError('El ID de empresa (tenant) es requerido');
    }
    if (!props.creadoPorUsuarioId) {
      throw new ValidationError('El ID del usuario creador es requerido');
    }

    this.acopioId = props.acopioId;
    this.empresaId = props.empresaId;
    this.encargadoLote = props.encargadoLote.trim();
    if (typeof props.fechaCompra === 'string') {
      this.fechaCompra = props.fechaCompra.includes('T')
        ? props.fechaCompra.split('T')[0]
        : props.fechaCompra;
    } else if (props.fechaCompra instanceof Date) {
      this.fechaCompra = props.fechaCompra.toISOString().split('T')[0];
    } else {
      this.fechaCompra = String(props.fechaCompra);
    }
    this._fechaLlegada = props.fechaLlegada ?? null;
    this.origen = props.origen.trim();
    this._fleteCosto = props.fleteCosto ?? 0;
    this._estado = props.estado ?? 'En Transito';
    this.creadoPorUsuarioId = props.creadoPorUsuarioId;
    this._jabas = props.jabas ?? [];
    this._gastos = props.gastos ?? [];
    this.fechaCreacion = props.fechaCreacion ?? new Date();
    this.fechaActualizacion = props.fechaActualizacion ?? new Date();
  }

  get gastos(): readonly any[] {
    return this._gastos;
  }

  asignarGastos(gastos: any[]): void {
    this._gastos = gastos;
  }

  get fleteCosto(): number {
    return this._fleteCosto;
  }

  get estado(): EstadoAcopio {
    return this._estado;
  }

  get fechaLlegada(): Date | null {
    return this._fechaLlegada;
  }

  get jabas(): readonly Jaba[] {
    return this._jabas;
  }

  get totalJabas(): number {
    return this._jabas.reduce((sum, j) => sum + j.cantidadJabas, 0);
  }

  get totalPesoBruto(): number {
    return this._jabas.reduce((sum, j) => sum + j.pesoBruto, 0);
  }

  agregarJaba(jaba: Jaba): void {
    this._jabas.push(jaba);
  }

  asignarFlete(costo: number): void {
    if (costo < 0) {
      throw new ValidationError('El costo del flete no puede ser negativo');
    }
    this._fleteCosto = costo;
  }

  marcarRecibido(fechaLlegada: Date = new Date()): void {
    this._estado = 'Recibido';
    this._fechaLlegada = fechaLlegada;
  }

  marcarLiquidado(): void {
    this._estado = 'Liquidado';
  }

  toJSON() {
    return {
      acopioId: this.acopioId,
      empresaId: this.empresaId,
      encargadoLote: this.encargadoLote,
      fechaCompra: this.fechaCompra,
      fechaLlegada: this._fechaLlegada,
      origen: this.origen,
      fleteCosto: this._fleteCosto,
      estado: this._estado,
      creadoPorUsuarioId: this.creadoPorUsuarioId,
      jabas: this._jabas.map((j) => (typeof (j as any).toJSON === 'function' ? (j as any).toJSON() : j)),
      gastos: this._gastos.map((g) => (typeof (g as any).toJSON === 'function' ? (g as any).toJSON() : g)),
      totalJabas: this.totalJabas,
      totalPesoBruto: this.totalPesoBruto,
      fechaCreacion: this.fechaCreacion,
      fechaActualizacion: this.fechaActualizacion,
    };
  }
}
