// Capa 2: Application - src/application/dtos/fiado.dto.ts

import { z } from 'zod';

export const RegistrarFiadoInputSchema = z.object({
  empresaId: z.string().uuid('ID de empresa inválido'),
  nombreDeudor: z.string().min(1, 'El nombre del deudor es requerido'),
  motivoDeuda: z.string().min(1, 'El motivo de deuda es requerido'),
  montoDeuda: z.number().positive('El monto de deuda debe ser mayor a 0'),
  fechaAdvertencia: z.coerce.date(),
  creadoPorUsuarioId: z.string().uuid('ID de usuario inválido'),
});

export type RegistrarFiadoInputDTO = z.infer<typeof RegistrarFiadoInputSchema>;
