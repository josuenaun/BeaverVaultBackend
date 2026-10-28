// Capa 2: Application - src/application/dtos/auth.dto.ts

import { z } from 'zod';

export const LoginInputSchema = z.object({
  correo: z.string().email('Correo electrónico inválido'),
  contrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginInputDTO = z.infer<typeof LoginInputSchema>;

export interface AuthResponseDTO {
  token: string;
  superAdmin?: {
    superAdminId: string;
    nombre: string;
    correo: string;
  };
  usuario?: {
    usuarioId: string;
    empresaId: string;
    rolId: string;
    nombre: string;
    correo: string;
  };
}
