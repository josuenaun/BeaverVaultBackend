// Capa 2: Application - src/application/dtos/transformacion.dto.ts

import { z } from 'zod';

export const TransformarJabasInputSchema = z.object({
  jabaId: z.string().uuid('ID de jaba inválido'),
  ubicacionId: z.string().uuid('ID de ubicación inválido'),
});

export type TransformarJabasInputDTO = z.infer<typeof TransformarJabasInputSchema>;
