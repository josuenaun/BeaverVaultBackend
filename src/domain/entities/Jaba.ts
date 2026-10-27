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
    if (this._estado === 'Convertida_Kilos') {
      throw new ValidationError('No se puede mover un lote de jabas ya convertidas a kilos');
    }
    this._ubicacionId = nuevaUbicacionId;
    this._estado = 'Almacenada';
  }

  marcarEnTransito(): void {
    if (this._estado === 'Convertida_Kilos') {
      throw new ValidationError('No se puede enviar a tránsito un lote ya convertido a kilos');
    }
    this._estado = 'En Transito';
  }

  marcarConvertidaKilos(): void {
    if (this._estado === 'Convertida_Kilos') {
      throw new ValidationError('El lote de jabas ya fue transformado a kilos previamente');
    }
    this._estado = 'Convertida_Kilos';
  }

  descartar(): void {
    this._estado = 'Descartada';
  }
}
