// Capa 4: Infrastructure - src/infrastructure/repositories/PostgresFiadoRepository.ts

import { Pool } from 'pg';
import { Fiado } from '../../domain/entities/Fiado.js';
import { IFiadoRepository } from '../../domain/repositories/IFiadoRepository.js';
import { EstadoFiado } from '../../domain/constants/clasificacion.js';

export class PostgresFiadoRepository implements IFiadoRepository {
  constructor(private readonly db: Pool) {}

  async save(fiado: Fiado): Promise<Fiado> {
    const query = `
      INSERT INTO fiados (empresa_id, nombre_deudor, motivo_deuda, monto_deuda, fecha_advertencia, estado, creado_por_usuario_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING fiado_id, empresa_id, nombre_deudor, motivo_deuda, monto_deuda, fecha_advertencia, estado, creado_por_usuario_id, fecha_creacion, fecha_actualizacion
    `;
    const values = [
      fiado.empresaId,
      fiado.nombreDeudor,
      fiado.motivoDeuda,
      fiado.montoDeuda,
      fiado.fechaAdvertencia,
      fiado.estado,
      fiado.creadoPorUsuarioId,
    ];

    const { rows } = await this.db.query(query, values);
    const row = rows[0];

    return new Fiado({
      fiadoId: row.fiado_id,
      empresaId: row.empresa_id,
      nombreDeudor: row.nombre_deudor,
      motivoDeuda: row.motivo_deuda,
      montoDeuda: parseFloat(row.monto_deuda),
      fechaAdvertencia: new Date(row.fecha_advertencia),
      estado: row.estado as EstadoFiado,
      creadoPorUsuarioId: row.creado_por_usuario_id,
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion),
    });
  }

  async findById(fiadoId: string): Promise<Fiado | null> {
    const query = `
      SELECT fiado_id, empresa_id, nombre_deudor, motivo_deuda, monto_deuda, fecha_advertencia, estado, creado_por_usuario_id, fecha_creacion, fecha_actualizacion
      FROM fiados
      WHERE fiado_id = $1
    `;
    const { rows } = await this.db.query(query, [fiadoId]);
    if (rows.length === 0) return null;

    const row = rows[0];
    return new Fiado({
      fiadoId: row.fiado_id,
      empresaId: row.empresa_id,
      nombreDeudor: row.nombre_deudor,
      motivoDeuda: row.motivo_deuda,
      montoDeuda: parseFloat(row.monto_deuda),
      fechaAdvertencia: new Date(row.fecha_advertencia),
      estado: row.estado as EstadoFiado,
      creadoPorUsuarioId: row.creado_por_usuario_id,
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion),
    });
  }

  async findByEmpresaId(empresaId: string): Promise<Fiado[]> {
    const query = `
      SELECT fiado_id, empresa_id, nombre_deudor, motivo_deuda, monto_deuda, fecha_advertencia, estado, creado_por_usuario_id, fecha_creacion, fecha_actualizacion
      FROM fiados
      WHERE empresa_id = $1
      ORDER BY fecha_creacion DESC
    `;
    const { rows } = await this.db.query(query, [empresaId]);
    return rows.map(
      (row) =>
        new Fiado({
          fiadoId: row.fiado_id,
          empresaId: row.empresa_id,
          nombreDeudor: row.nombre_deudor,
          motivoDeuda: row.motivo_deuda,
          montoDeuda: parseFloat(row.monto_deuda),
          fechaAdvertencia: new Date(row.fecha_advertencia),
          estado: row.estado as EstadoFiado,
          creadoPorUsuarioId: row.creado_por_usuario_id,
          fechaCreacion: new Date(row.fecha_creacion),
          fechaActualizacion: new Date(row.fecha_actualizacion),
        })
    );
  }

  async updateEstado(fiadoId: string, estado: EstadoFiado): Promise<void> {
    const query = `
      UPDATE fiados
      SET estado = $1, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE fiado_id = $2
    `;
    await this.db.query(query, [estado, fiadoId]);
  }

  async actualizar(fiadoId: string, data: { montoDeuda?: number; motivoDeuda?: string; estado?: string }): Promise<void> {
    const sets: string[] = ['fecha_actualizacion = CURRENT_TIMESTAMP'];
    const values: any[] = [];
    let idx = 1;

    if (data.montoDeuda !== undefined) {
      sets.push(`monto_deuda = $${idx++}`);
      values.push(data.montoDeuda);
    }
    if (data.motivoDeuda !== undefined) {
      sets.push(`motivo_deuda = $${idx++}`);
      values.push(data.motivoDeuda);
    }
    if (data.estado !== undefined) {
      sets.push(`estado = $${idx++}`);
      values.push(data.estado);
    }

    values.push(fiadoId);
    const query = `UPDATE fiados SET ${sets.join(', ')} WHERE fiado_id = $${idx}`;
    await this.db.query(query, values);
  }

  async delete(fiadoId: string): Promise<void> {
    await this.db.query('DELETE FROM fiados WHERE fiado_id = $1', [fiadoId]);
  }
}
