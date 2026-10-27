// Capa 1: Domain - src/domain/entities/Usuario.ts

import { ValidationError } from '../errors/DomainError.js';

export interface UsuarioProps {
  usuarioId?: string;
  empresaId: string;
  rolId: string;
  nombre: string;
  correo: string;
  contrasenaHash: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export class Usuario {
  readonly usuarioId?: string;
  readonly empresaId: string;
  readonly rolId: string;
  readonly nombre: string;
  readonly correo: string;
  readonly contrasenaHash: string;
  readonly fechaCreacion: Date;
  readonly fechaActualizacion: Date;

  constructor(props: UsuarioProps) {
    if (!props.empresaId) {
      throw new ValidationError('El ID de la empresa es obligatorio');
    }
    if (!props.rolId) {
      throw new ValidationError('El ID del rol es obligatorio');
    }
    if (!props.nombre || props.nombre.trim().length === 0) {
      throw new ValidationError('El nombre del usuario es obligatorio');
    }
    if (!props.correo || !props.correo.includes('@')) {
      throw new ValidationError('El correo proporcionado no tiene un formato válido');
    }
    if (!props.contrasenaHash) {
      throw new ValidationError('La contraseña hasheada es obligatoria');
    }

    this.usuarioId = props.usuarioId;
    this.empresaId = props.empresaId;
    this.rolId = props.rolId;
    this.nombre = props.nombre.trim();
    this.correo = props.correo.trim().toLowerCase();
    this.contrasenaHash = props.contrasenaHash;
    this.fechaCreacion = props.fechaCreacion ?? new Date();
    this.fechaActualizacion = props.fechaActualizacion ?? new Date();
  }
}
