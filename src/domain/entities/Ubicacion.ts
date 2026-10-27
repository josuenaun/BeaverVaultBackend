// Capa 1: Domain - src/domain/entities/Ubicacion.ts

import { TipoUbicacion, TIPOS_UBICACION } from '../constants/clasificacion.js';
import { ValidationError } from '../errors/DomainError.js';

export interface UbicacionProps {
  ubicacionId?: string;
  empresaId: string;
  nombre: string;
  tipo: TipoUbicacion;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export class Ubicacion {
  readonly ubicacionId?: string;
  readonly empresaId: string;
  readonly nombre: string;
  readonly tipo: TipoUbicacion;
  readonly fechaCreacion: Date;
  readonly fechaActualizacion: Date;

  constructor(props: UbicacionProps) {
    if (!props.empresaId) {
      throw new ValidationError('El ID de la empresa es obligatorio');
    }
    if (!props.nombre || props.nombre.trim().length === 0) {
      throw new ValidationError('El nombre de la ubicación es obligatorio');
    }
    if (!TIPOS_UBICACION.includes(props.tipo)) {
      throw new ValidationError(`Tipo de ubicación inválido: ${props.tipo}`);
    }

    this.ubicacionId = props.ubicacionId;
    this.empresaId = props.empresaId;
    this.nombre = props.nombre.trim();
    this.tipo = props.tipo;
    this.fechaCreacion = props.fechaCreacion ?? new Date();
    this.fechaActualizacion = props.fechaActualizacion ?? new Date();
  }
}
