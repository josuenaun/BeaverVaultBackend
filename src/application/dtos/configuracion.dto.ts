// Capa 2: Application - src/application/dtos/configuracion.dto.ts

import { z } from 'zod';
import { TIPOS_UBICACION } from '../../domain/constants/clasificacion.js';

export const RegistrarRolInputSchema = z.object({
  nombre: z.string().min(1, 'El nombre del rol es requerido'),
  descripcion: z.string().nullable().optional(),
});

export type RegistrarRolInputDTO = z.infer<typeof RegistrarRolInputSchema>;

export const RegistrarEmpresaInputSchema = z.object({
  nombre: z.string().min(1, 'El nombre de la empresa es requerido'),
});

export type RegistrarEmpresaInputDTO = z.infer<typeof RegistrarEmpresaInputSchema>;

export const RegistrarUbicacionInputSchema = z.object({
  empresaId: z.string().uuid('ID de empresa inválido'),
  nombre: z.string().min(1, 'El nombre de la ubicación es requerido'),
  tipo: z.enum(TIPOS_UBICACION),
});

export type RegistrarUbicacionInputDTO = z.infer<typeof RegistrarUbicacionInputSchema>;

export const RegistrarUsuarioInputSchema = z.object({
  empresaId: z.string().uuid('ID de empresa inválido'),
  rolId: z.string().uuid('ID de rol inválido'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  correo: z.string().email('Correo electrónico inválido'),
  contrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type RegistrarUsuarioInputDTO = z.infer<typeof RegistrarUsuarioInputSchema>;

export const RegistrarSuperAdminInputSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  correo: z.string().email('Correo electrónico inválido'),
  contrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type RegistrarSuperAdminInputDTO = z.infer<typeof RegistrarSuperAdminInputSchema>;
