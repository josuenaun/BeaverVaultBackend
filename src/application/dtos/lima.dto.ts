// Capa 2: Application - src/application/dtos/lima.dto.ts

import { z } from 'zod';

export const RegistrarDescargaLimaInputSchema = z.object({
  acopioId: z.string().uuid('ID de acopio inválido'),
  tipoGasto: z.enum(['Estibador', 'Cargador']),
  nombreReceptor: z.string().min(1, 'El nombre del receptor es requerido'),
  cantidadJabas: z.number().int().positive('La cantidad de jabas debe ser mayor a 0'),
  tarifaPorJaba: z.number().positive('La tarifa por jaba debe ser mayor a 0'),
  usuarioRegistroId: z.string().uuid('ID de usuario inválido'),
  concepto: z.string().optional(),
});

export type RegistrarDescargaLimaInputDTO = z.infer<typeof RegistrarDescargaLimaInputSchema>;

export const DistribuirJabaInputSchema = z.object({
  jabaId: z.string().uuid('ID de jaba inválido'),
  ubicacionId: z.string().uuid('ID de ubicación inválido'),
});

export type DistribuirJabaInputDTO = z.infer<typeof DistribuirJabaInputSchema>;
