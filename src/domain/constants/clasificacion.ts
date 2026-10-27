// Capa 1: Domain - src/domain/constants/clasificacion.ts

import { ValidationError } from '../errors/DomainError.js';

export const MATRIZ_CLASIFICACION = {
  Fuerte: ['1era', '2da', '3era', '4ta', 'Semimanchada', 'Manchada'],
  Hass: ['1era', '2da', '3era', '4ta', 'Manchada'],
  Naval: ['Limpia', 'Manchada'],
  Villacampa: ['1era', 'Manchada'],
} as const;

export type TipoPalta = keyof typeof MATRIZ_CLASIFICACION;
export type CategoriaPalta<T extends TipoPalta = TipoPalta> = typeof MATRIZ_CLASIFICACION[T][number];

export const TIPOS_UBICACION = [
  'Acopio',
  'Camara Frio',
  'Puesto Principal',
  'Puesto Contingencia',
] as const;

export type TipoUbicacion = typeof TIPOS_UBICACION[number];

export const ESTADOS_ACOPIO = [
  'En Transito',
  'Recibido',
  'Liquidado',
] as const;

export type EstadoAcopio = typeof ESTADOS_ACOPIO[number];

export const ESTADOS_JABA = [
  'Almacenada',
  'En Transito',
  'Convertida_Kilos',
  'Descartada',
] as const;

export type EstadoJaba = typeof ESTADOS_JABA[number];

export const TIPOS_GASTO = [
  'Estibador',
  'Cargador',
  'Transporte',
  'Seleccionador',
] as const;

export type TipoGasto = typeof TIPOS_GASTO[number];

export const ESTADOS_FIADO = [
  'Pendiente',
  'Pagado',
  'Vencido',
] as const;

export type EstadoFiado = typeof ESTADOS_FIADO[number];

export function validarClasificacion(tipo: string, categoria: string): void {
  const categoriasValidas = MATRIZ_CLASIFICACION[tipo as TipoPalta];
  if (!categoriasValidas) {
    throw new ValidationError(
      `Tipo de palta inválido: "${tipo}". Tipos permitidos: ${Object.keys(MATRIZ_CLASIFICACION).join(', ')}`
    );
  }

  if (!(categoriasValidas as readonly string[]).includes(categoria)) {
    throw new ValidationError(
      `Categoría "${categoria}" no permitida para el tipo "${tipo}". Permitidas: ${categoriasValidas.join(', ')}`
    );
  }
}
