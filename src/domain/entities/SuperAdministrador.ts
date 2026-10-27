// Capa 1: Domain - src/domain/entities/SuperAdministrador.ts

import { ValidationError } from '../errors/DomainError.js';

export interface SuperAdministradorProps {
  superAdminId?: string;
  nombre: string;
  correo: string;
  contrasenaHash: string;
  activo?: boolean;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export class SuperAdministrador {
  readonly superAdminId?: string;
  readonly nombre: string;
  readonly correo: string;
  readonly contrasenaHash: string;
  private _activo: boolean;
  readonly fechaCreacion: Date;
  readonly fechaActualizacion: Date;

  constructor(props: SuperAdministradorProps) {
    if (!props.nombre || props.nombre.trim().length === 0) {
      throw new ValidationError('El nombre del super administrador es requerido');
    }
    if (!props.correo || !props.correo.includes('@')) {
      throw new ValidationError('El correo proporcionado no tiene un formato válido');
    }
    if (!props.contrasenaHash) {
      throw new ValidationError('La contraseña hasheada es obligatoria');
    }

    this.superAdminId = props.superAdminId;
    this.nombre = props.nombre.trim();
    this.correo = props.correo.trim().toLowerCase();
    this.contrasenaHash = props.contrasenaHash;
    this._activo = props.activo ?? true;
    this.fechaCreacion = props.fechaCreacion ?? new Date();
    this.fechaActualizacion = props.fechaActualizacion ?? new Date();
  }

  get activo(): boolean {
    return this._activo;
  }

  desactivar(): void {
    this._activo = false;
  }

  activar(): void {
    this._activo = true;
  }
}
