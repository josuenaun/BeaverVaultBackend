// Capa 1: Domain - src/domain/entities/GastoOperativo.ts

import { TipoGasto, TIPOS_GASTO } from '../constants/clasificacion.js';
import { ValidationError } from '../errors/DomainError.js';

export interface GastoOperativoProps {
  gastoId?: string;
  acopioId?: string | null;
  nombreReceptor: string;
  tipoGasto: TipoGasto;
  concepto: string;
  cantidadJabas?: number | null;
  tarifaPorJaba?: number | null;
  montoTotal: number;
  usuarioRegistroId: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export class GastoOperativo {
  readonly gastoId?: string;
  readonly acopioId?: string | null;
  readonly nombreReceptor: string;
  readonly tipoGasto: TipoGasto;
  readonly concepto: string;
  readonly cantidadJabas?: number | null;
  readonly tarifaPorJaba?: number | null;
  readonly montoTotal: number;
  readonly usuarioRegistroId: string;
  readonly fechaCreacion: Date;
  readonly fechaActualizacion: Date;

  constructor(props: GastoOperativoProps) {
    if (!TIPOS_GASTO.includes(props.tipoGasto)) {
      throw new ValidationError(`Tipo de gasto inválido: ${props.tipoGasto}`);
    }
    if (!props.nombreReceptor || props.nombreReceptor.trim().length === 0) {
      throw new ValidationError('El nombre del receptor del pago es obligatorio');
    }
    if (!props.concepto || props.concepto.trim().length === 0) {
      throw new ValidationError('El concepto del gasto es obligatorio');
    }
    if (!props.usuarioRegistroId) {
      throw new ValidationError('El ID del usuario que registra el gasto es obligatorio');
    }
    if (props.montoTotal <= 0) {
      throw new ValidationError('El monto total del gasto debe ser estrictamente positivo');
    }

    this.gastoId = props.gastoId;
    this.acopioId = props.acopioId ?? null;
    this.nombreReceptor = props.nombreReceptor.trim();
    this.tipoGasto = props.tipoGasto;
    this.concepto = props.concepto.trim();
    this.cantidadJabas = props.cantidadJabas ?? null;
    this.tarifaPorJaba = props.tarifaPorJaba ?? null;
    this.montoTotal = props.montoTotal;
    this.usuarioRegistroId = props.usuarioRegistroId;
    this.fechaCreacion = props.fechaCreacion ?? new Date();
    this.fechaActualizacion = props.fechaActualizacion ?? new Date();
  }
}
