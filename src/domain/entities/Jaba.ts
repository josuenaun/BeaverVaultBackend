// Capa 1: Domain - src/domain/entities/Jaba.ts

import { TipoPalta, EstadoJaba, validarClasificacion } from '../constants/clasificacion.js';
import { ValidationError } from '../errors/DomainError.js';

export interface JabaProps {
  jabaId?: string;
  acopioId: string;
  ubicacionId?: string | null;
  tipoPalta: TipoPalta;
  categoria: string;
  codigoColor: string;
  cantidadJabas: number;
  pesoBruto: number;
  estado?: EstadoJaba;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export class Jaba {
  readonly jabaId?: string;
  readonly acopioId: string;
  private _ubicacionId: string | null;
  readonly tipoPalta: TipoPalta;
  readonly categoria: string;
  readonly codigoColor: string;
  readonly cantidadJabas: number;
  readonly pesoBruto: number;
  private _estado: EstadoJaba;
  readonly fechaCreacion: Date;
  readonly fechaActualizacion: Date;

  constructor(props: JabaProps) {
    validarClasificacion(props.tipoPalta, props.categoria);

    if (props.cantidadJabas <= 0) {
      throw new ValidationError('La cantidad de jabas debe ser mayor a 0');
    }
    if (props.pesoBruto <= 0) {
      throw new ValidationError('El peso bruto debe ser mayor a 0');
    }
    if (!props.codigoColor || props.codigoColor.trim().length === 0) {
      throw new ValidationError('El código de color es obligatorio');
    }

    this.jabaId = props.jabaId;
    this.acopioId = props.acopioId;
    this._ubicacionId = props.ubicacionId ?? null;
    this.tipoPalta = props.tipoPalta;
    this.categoria = props.categoria;
    this.codigoColor = props.codigoColor.trim();
    this.cantidadJabas = props.cantidadJabas;
    this.pesoBruto = props.pesoBruto;
    this._estado = props.estado ?? 'Almacenada';
    this.fechaCreacion = props.fechaCreacion ?? new Date();
    this.fechaActualizacion = props.fechaActualizacion ?? new Date();
  }

  get ubicacionId(): string | null {
    return this._ubicacionId;
  }

  get estado(): EstadoJaba {
    return this._estado;
  }

  trasladar(nuevaUbicacionId: string): void {
    if (!nuevaUbicacionId) {
      throw new ValidationError('El ID de la nueva ubicación es requerido');
    }
    this._ubicacionId = nuevaUbicacionId;
    if (this._estado !== 'Convertida_Kilos') {
      this._estado = 'Almacenada';
    }
  }

  marcarEnTransito(): void {
    this._estado = 'En Transito';
  }

  marcarConvertidaKilos(): void {
    this._estado = 'Convertida_Kilos';
  }

  descartar(): void {
    this._estado = 'Descartada';
  }

  toJSON() {
    return {
      jabaId: this.jabaId,
      acopioId: this.acopioId,
      ubicacionId: this._ubicacionId,
      tipoPalta: this.tipoPalta,
      categoria: this.categoria,
      codigoColor: this.codigoColor,
      cantidadJabas: this.cantidadJabas,
      pesoBruto: this.pesoBruto,
      estado: this._estado,
      fechaCreacion: this.fechaCreacion,
      fechaActualizacion: this.fechaActualizacion,
    };
  }
}
