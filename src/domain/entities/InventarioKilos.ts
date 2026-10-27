// Capa 1: Domain - src/domain/entities/InventarioKilos.ts

import { TipoPalta, validarClasificacion } from '../constants/clasificacion.js';
import { ValidationError, BusinessRuleError } from '../errors/DomainError.js';

export interface InventarioKilosProps {
  inventarioId?: string;
  ubicacionId: string;
  tipoPalta: TipoPalta;
  categoria: string;
  kilosDisponibles: number;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export class InventarioKilos {
  readonly inventarioId?: string;
  readonly ubicacionId: string;
  readonly tipoPalta: TipoPalta;
  readonly categoria: string;
  private _kilosDisponibles: number;
  readonly fechaCreacion: Date;
  readonly fechaActualizacion: Date;

  constructor(props: InventarioKilosProps) {
    validarClasificacion(props.tipoPalta, props.categoria);

    if (!props.ubicacionId) {
      throw new ValidationError('El ID de ubicación física es requerido');
    }
    if (props.kilosDisponibles < 0) {
      throw new ValidationError('Los kilos disponibles no pueden ser negativos');
    }

    this.inventarioId = props.inventarioId;
    this.ubicacionId = props.ubicacionId;
    this.tipoPalta = props.tipoPalta;
    this.categoria = props.categoria;
    this._kilosDisponibles = props.kilosDisponibles;
    this.fechaCreacion = props.fechaCreacion ?? new Date();
    this.fechaActualizacion = props.fechaActualizacion ?? new Date();
  }

  get kilosDisponibles(): number {
    return this._kilosDisponibles;
  }

  ingresarStock(kilos: number): void {
    if (kilos <= 0) {
      throw new ValidationError('La cantidad de kilos a ingresar debe ser mayor a 0');
    }
    // Regla de negocio inquebrantable: NO HAY MERMA.
    this._kilosDisponibles += kilos;
  }

  descontarStock(kilos: number): void {
    if (kilos <= 0) {
      throw new ValidationError('La cantidad de kilos a descontar debe ser mayor a 0');
    }
    if (kilos > this._kilosDisponibles) {
      throw new BusinessRuleError(
        `Stock insuficiente para ${this.tipoPalta} (${this.categoria}) en ubicación ${this.ubicacionId}. Disponible: ${this._kilosDisponibles} kg, Solicitado: ${kilos} kg`
      );
    }
    this._kilosDisponibles -= kilos;
  }
}
