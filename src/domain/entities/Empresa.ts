// Capa 1: Domain - src/domain/entities/Empresa.ts

import { ValidationError } from '../errors/DomainError.js';

export interface EmpresaProps {
  empresaId?: string;
  nombre: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export class Empresa {
  readonly empresaId?: string;
  readonly nombre: string;
  readonly fechaCreacion: Date;
  readonly fechaActualizacion: Date;

  constructor(props: EmpresaProps) {
    if (!props.nombre || props.nombre.trim().length === 0) {
      throw new ValidationError('El nombre de la empresa es obligatorio');
    }

    this.empresaId = props.empresaId;
    this.nombre = props.nombre.trim();
    this.fechaCreacion = props.fechaCreacion ?? new Date();
    this.fechaActualizacion = props.fechaActualizacion ?? new Date();
  }
}
