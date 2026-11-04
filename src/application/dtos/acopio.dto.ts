// Capa 2: Application - src/application/dtos/acopio.dto.ts

import { z } from 'zod';
import { TipoPalta } from '../../domain/constants/clasificacion.js';

export const JabaItemSchema = z.object({
  tipoPalta: z.enum(['Fuerte', 'Hass', 'Naval', 'Villacampa'] as const),
  categoria: z.string().min(1, 'La categoría es requerida'),
  codigoColor: z.string().min(1, 'El código de color es requerido'),
  cantidadJabas: z.number().int().positive('La cantidad de jabas debe ser mayor a 0'),
  pesoBruto: z.number().positive('El peso bruto debe ser mayor a 0'),
  ubicacionId: z.string().uuid('ID de ubicación inválido').nullable().optional(),
});

export type JabaItemDTO = z.infer<typeof JabaItemSchema>;

export const RegistrarAcopioInputSchema = z.object({
  empresaId: z.string().uuid('ID de empresa inválido'),
  encargadoLote: z.string().min(1, 'El encargado del lote es requerido'),
  fechaCompra: z.union([z.string().min(10), z.date()]).transform((val) => {
    if (typeof val === 'string') {
      return val.includes('T') ? val.split('T')[0] : val;
    }
    return val.toISOString().split('T')[0];
  }),
  origen: z.string().min(1, 'El origen es requerido'),
  creadoPorUsuarioId: z.string().uuid('ID de usuario inválido'),
  jabas: z.array(JabaItemSchema).min(1, 'Debe incluir al menos una jaba'),
});

export type RegistrarAcopioInputDTO = z.infer<typeof RegistrarAcopioInputSchema>;

export const RegistrarGastoSeleccionadorInputSchema = z.object({
  acopioId: z.string().uuid('ID de acopio inválido'),
  nombreReceptor: z.string().min(1, 'El nombre del receptor es requerido'),
  cantidadJabas: z.number().int().positive('La cantidad de jabas debe ser mayor a 0'),
  tarifaPorJaba: z.number().positive('La tarifa por jaba debe ser mayor a 0'),
  usuarioRegistroId: z.string().uuid('ID de usuario inválido'),
  concepto: z.string().optional(),
});

export type RegistrarGastoSeleccionadorInputDTO = z.infer<typeof RegistrarGastoSeleccionadorInputSchema>;
