// Capa 4: Infrastructure - src/infrastructure/repositories/PostgresAcopioRepository.ts

import { Pool } from 'pg';
import { Acopio } from '../../domain/entities/Acopio.js';
import { IAcopioRepository } from '../../domain/repositories/IAcopioRepository.js';
import { EstadoAcopio } from '../../domain/constants/clasificacion.js';

export class PostgresAcopioRepository implements IAcopioRepository {
  constructor(private readonly db: Pool) {}

  async save(acopio: Acopio): Promise<Acopio> {
    const query = `
      INSERT INTO acopios (empresa_id, encargado_lote, fecha_compra, fecha_llegada, origen, flete_costo, estado, creado_por_usuario_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING acopio_id, empresa_id, encargado_lote, fecha_compra, fecha_llegada, origen, flete_costo, estado, creado_por_usuario_id, fecha_creacion, fecha_actualizacion
    `;
    const values = [
      acopio.empresaId,
      acopio.encargadoLote,
      acopio.fechaCompra,
      acopio.fechaLlegada,
      acopio.origen,
      acopio.fleteCosto,
      acopio.estado,
      acopio.creadoPorUsuarioId,
    ];

    const { rows } = await this.db.query(query, values);
    const row = rows[0];

    return new Acopio({
      acopioId: row.acopio_id,
      empresaId: row.empresa_id,
      encargadoLote: row.encargado_lote,
      fechaCompra: new Date(row.fecha_compra),
      fechaLlegada: row.fecha_llegada ? new Date(row.fecha_llegada) : null,
      origen: row.origen,
      fleteCosto: parseFloat(row.flete_costo),
      estado: row.estado as EstadoAcopio,
      creadoPorUsuarioId: row.creado_por_usuario_id,
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion),
    });
  }

  async findById(acopioId: string): Promise<Acopio | null> {
    const query = `
      SELECT acopio_id, empresa_id, encargado_lote, fecha_compra, fecha_llegada, origen, flete_costo, estado, creado_por_usuario_id, fecha_creacion, fecha_actualizacion
      FROM acopios
      WHERE acopio_id = $1
    `;
    const { rows } = await this.db.query(query, [acopioId]);
    if (rows.length === 0) return null;

    const row = rows[0];
    return new Acopio({
      acopioId: row.acopio_id,
      empresaId: row.empresa_id,
      encargadoLote: row.encargado_lote,
      fechaCompra: new Date(row.fecha_compra),
      fechaLlegada: row.fecha_llegada ? new Date(row.fecha_llegada) : null,
      origen: row.origen,
      fleteCosto: parseFloat(row.flete_costo),
      estado: row.estado as EstadoAcopio,
      creadoPorUsuarioId: row.creado_por_usuario_id,
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion),
    });
  }

  async findByEmpresaId(empresaId: string): Promise<Acopio[]> {
    const query = `
      SELECT acopio_id, empresa_id, encargado_lote, fecha_compra, fecha_llegada, origen, flete_costo, estado, creado_por_usuario_id, fecha_creacion, fecha_actualizacion
      FROM acopios
      WHERE empresa_id = $1
      ORDER BY fecha_creacion DESC
    `;
    const { rows } = await this.db.query(query, [empresaId]);
    return rows.map(
      (row) =>
        new Acopio({
          acopioId: row.acopio_id,
          empresaId: row.empresa_id,
          encargadoLote: row.encargado_lote,
          fechaCompra: new Date(row.fecha_compra),
          fechaLlegada: row.fecha_llegada ? new Date(row.fecha_llegada) : null,
          origen: row.origen,
          fleteCosto: parseFloat(row.flete_costo),
          estado: row.estado as EstadoAcopio,
          creadoPorUsuarioId: row.creado_por_usuario_id,
          fechaCreacion: new Date(row.fecha_creacion),
          fechaActualizacion: new Date(row.fecha_actualizacion),
        })
    );
  }

  async updateFlete(acopioId: string, fleteCosto: number): Promise<void> {
    const query = `
      UPDATE acopios
      SET flete_costo = $1, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE acopio_id = $2
    `;
    await this.db.query(query, [fleteCosto, acopioId]);
  }

  async updateEstado(acopioId: string, estado: EstadoAcopio, fechaLlegada?: Date | null): Promise<void> {
    const query = `
      UPDATE acopios
      SET estado = $1,
          fecha_llegada = COALESCE($2, fecha_llegada),
          fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE acopio_id = $3
    `;
    await this.db.query(query, [estado, fechaLlegada ?? null, acopioId]);
  }

  async delete(acopioId: string): Promise<void> {
    await this.db.query('DELETE FROM acopios WHERE acopio_id = $1', [acopioId]);
  }
}
