// Capa 1: Domain - src/domain/entities/Rol.ts

import { ValidationError } from '../errors/DomainError.js';

export interface RolProps {
  rolId?: string;
  nombre: string;
  descripcion?: string | null;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export class Rol {
  readonly rolId?: string;
  readonly nombre: string;
  readonly descripcion: string | null;
  readonly fechaCreacion: Date;
  readonly fechaActualizacion: Date;

  constructor(props: RolProps) {
    if (!props.nombre || props.nombre.trim().length === 0) {
      throw new ValidationError('El nombre del rol es obligatorio');
    }

    this.rolId = props.rolId;
    this.nombre = props.nombre.trim();
    this.descripcion = props.descripcion?.trim() ?? null;
    this.fechaCreacion = props.fechaCreacion ?? new Date();
    this.fechaActualizacion = props.fechaActualizacion ?? new Date();
  }
}
