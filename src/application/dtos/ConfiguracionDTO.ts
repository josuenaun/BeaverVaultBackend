// Capa 2: Application - src/application/dtos/ConfiguracionDTO.ts

import { TipoUbicacion } from '../../domain/constants/clasificacion.js';

export interface RegistrarRolInputDTO {
  nombre: string;
  descripcion?: string | null;
}

export interface RegistrarEmpresaInputDTO {
  nombre: string;
}

export interface RegistrarUbicacionInputDTO {
  empresaId: string;
  nombre: string;
  tipo: TipoUbicacion;
}

export interface RegistrarUsuarioInputDTO {
  empresaId: string;
  rolId: string;
  nombre: string;
  correo: string;
  contrasena: string;
}

export interface RegistrarSuperAdminInputDTO {
  nombre: string;
  correo: string;
  contrasena: string;
}
