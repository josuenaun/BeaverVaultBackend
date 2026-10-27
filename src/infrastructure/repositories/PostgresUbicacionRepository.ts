// Capa 4: Infrastructure - src/infrastructure/repositories/PostgresUbicacionRepository.ts

import { Pool } from 'pg';
import { Ubicacion } from '../../domain/entities/Ubicacion.js';
import { IUbicacionRepository } from '../../domain/repositories/IUbicacionRepository.js';
import { TipoUbicacion } from '../../domain/constants/clasificacion.js';

export class PostgresUbicacionRepository implements IUbicacionRepository {
  constructor(private readonly db: Pool) {}

  async save(ubicacion: Ubicacion): Promise<Ubicacion> {
    const query = `
      INSERT INTO ubicaciones (empresa_id, nombre, tipo)
      VALUES ($1, $2, $3)
      RETURNING ubicacion_id, empresa_id, nombre, tipo, fecha_creacion, fecha_actualizacion
    `;
    const values = [ubicacion.empresaId, ubicacion.nombre, ubicacion.tipo];
    const { rows } = await this.db.query(query, values);
    const row = rows[0];

    return new Ubicacion({
      ubicacionId: row.ubicacion_id,
      empresaId: row.empresa_id,
      nombre: row.nombre,
      tipo: row.tipo as TipoUbicacion,
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion),
    });
  }

  async findById(ubicacionId: string): Promise<Ubicacion | null> {
    const query = `
      SELECT ubicacion_id, empresa_id, nombre, tipo, fecha_creacion, fecha_actualizacion
      FROM ubicaciones
      WHERE ubicacion_id = $1
    `;
    const { rows } = await this.db.query(query, [ubicacionId]);
    if (rows.length === 0) return null;
    const row = rows[0];

    return new Ubicacion({
      ubicacionId: row.ubicacion_id,
      empresaId: row.empresa_id,
      nombre: row.nombre,
      tipo: row.tipo as TipoUbicacion,
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion),
    });
  }

  async findByEmpresaId(empresaId: string): Promise<Ubicacion[]> {
    const query = `
      SELECT ubicacion_id, empresa_id, nombre, tipo, fecha_creacion, fecha_actualizacion
      FROM ubicaciones
      WHERE empresa_id = $1
      ORDER BY nombre ASC
    `;
    const { rows } = await this.db.query(query, [empresaId]);
    return rows.map(
      (row) =>
        new Ubicacion({
          ubicacionId: row.ubicacion_id,
          empresaId: row.empresa_id,
          nombre: row.nombre,
          tipo: row.tipo as TipoUbicacion,
          fechaCreacion: new Date(row.fecha_creacion),
          fechaActualizacion: new Date(row.fecha_actualizacion),
        })
    );
  }

  async delete(ubicacionId: string): Promise<void> {
    await this.db.query('DELETE FROM ubicaciones WHERE ubicacion_id = $1', [ubicacionId]);
  }
}
