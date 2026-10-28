// Capa 2: Application - src/application/dtos/transporte.dto.ts

import { z } from 'zod';

export const RegistrarTransporteInputSchema = z.object({
  acopioId: z.string().uuid('ID de acopio inválido'),
  fleteCosto: z.number().positive('El costo de flete debe ser mayor a 0'),
  nombreReceptor: z.string().min(1, 'El nombre del transportista es requerido'),
  usuarioRegistroId: z.string().uuid('ID de usuario inválido'),
  concepto: z.string().optional(),
});

export type RegistrarTransporteInputDTO = z.infer<typeof RegistrarTransporteInputSchema>;
