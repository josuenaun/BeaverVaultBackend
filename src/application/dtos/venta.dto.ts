// Capa 2: Application - src/application/dtos/venta.dto.ts

import { z } from 'zod';
import { TipoPalta } from '../../domain/constants/clasificacion.js';

export const DetalleVentaItemSchema = z.object({
  tipoPalta: z.enum(['Fuerte', 'Hass', 'Naval', 'Villacampa'] as const),
  categoria: z.string().min(1, 'La categoría es requerida'),
  kilosVendidos: z.number().positive('Los kilos vendidos deben ser mayores a 0'),
  precioUnitario: z.number().positive('El precio unitario debe ser mayor a 0'),
});

export type DetalleVentaItemDTO = z.infer<typeof DetalleVentaItemSchema>;

export const RegistrarVentaInputSchema = z.object({
  empresaId: z.string().uuid('ID de empresa inválido'),
  vendedorUsuarioId: z.string().uuid('ID de usuario vendedor inválido'),
  ubicacionId: z.string().uuid('ID de ubicación inválido'),
  metodoPago: z.string().optional().default('Efectivo'),
  detalles: z.array(DetalleVentaItemSchema).min(1, 'Debe incluir al menos un detalle de venta'),
});

export type RegistrarVentaInputDTO = z.infer<typeof RegistrarVentaInputSchema>;
