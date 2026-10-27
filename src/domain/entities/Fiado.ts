// Capa 1: Domain - src/domain/entities/Fiado.ts

import { EstadoFiado, ESTADOS_FIADO } from '../constants/clasificacion.js';
import { ValidationError } from '../errors/DomainError.js';

export interface FiadoProps {
  fiadoId?: string;
  empresaId: string;
  nombreDeudor: string;
  motivoDeuda: string;
  montoDeuda: number;
  fechaAdvertencia: Date;
  estado?: EstadoFiado;
  creadoPorUsuarioId: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export class Fiado {
  readonly fiadoId?: string;
  readonly empresaId: string;
  readonly nombreDeudor: string;
  readonly motivoDeuda: string;
  readonly montoDeuda: number;
  readonly fechaAdvertencia: Date;
  private _estado: EstadoFiado;
  readonly creadoPorUsuarioId: string;
  readonly fechaCreacion: Date;
  readonly fechaActualizacion: Date;

  constructor(props: FiadoProps) {
    if (!props.empresaId) {
      throw new ValidationError('El ID de empresa es requerido');
    }
    if (!props.nombreDeudor || props.nombreDeudor.trim().length === 0) {
      throw new ValidationError('El nombre del deudor es obligatorio');
    }
    if (!props.motivoDeuda || props.motivoDeuda.trim().length === 0) {
      throw new ValidationError('El motivo de la deuda es obligatorio');
    }
    if (props.montoDeuda <= 0) {
      throw new ValidationError('El monto de la deuda debe ser mayor a 0');
    }
    if (!props.creadoPorUsuarioId) {
      throw new ValidationError('El ID del usuario creador es requerido');
    }

    this.fiadoId = props.fiadoId;
    this.empresaId = props.empresaId;
    this.nombreDeudor = props.nombreDeudor.trim();
    this.motivoDeuda = props.motivoDeuda.trim();
    this.montoDeuda = props.montoDeuda;
    this.fechaAdvertencia = props.fechaAdvertencia;
    this._estado = props.estado ?? 'Pendiente';
    this.creadoPorUsuarioId = props.creadoPorUsuarioId;
    this.fechaCreacion = props.fechaCreacion ?? new Date();
    this.fechaActualizacion = props.fechaActualizacion ?? new Date();
  }

  get estado(): EstadoFiado {
    return this._estado;
  }

  marcarPagado(): void {
    this._estado = 'Pagado';
  }

  marcarVencido(): void {
    this._estado = 'Vencido';
  }
}
