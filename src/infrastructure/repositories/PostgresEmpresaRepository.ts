// Capa 4: Infrastructure - src/infrastructure/repositories/PostgresEmpresaRepository.ts

import { Pool } from 'pg';
import { Empresa } from '../../domain/entities/Empresa.js';
import { IEmpresaRepository } from '../../domain/repositories/IEmpresaRepository.js';

export class PostgresEmpresaRepository implements IEmpresaRepository {
  constructor(private readonly db: Pool) {}

  async save(empresa: Empresa): Promise<Empresa> {
    const query = `
      INSERT INTO empresas (nombre)
      VALUES ($1)
      RETURNING empresa_id, nombre, fecha_creacion, fecha_actualizacion
    `;
    const { rows } = await this.db.query(query, [empresa.nombre]);
    const row = rows[0];

    return new Empresa({
      empresaId: row.empresa_id,
      nombre: row.nombre,
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion),
    });
  }

  async findById(empresaId: string): Promise<Empresa | null> {
    const query = `
      SELECT empresa_id, nombre, fecha_creacion, fecha_actualizacion
      FROM empresas
      WHERE empresa_id = $1
    `;
    const { rows } = await this.db.query(query, [empresaId]);
    if (rows.length === 0) return null;
    const row = rows[0];

    return new Empresa({
      empresaId: row.empresa_id,
      nombre: row.nombre,
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion),
    });
  }

  async findAll(): Promise<Empresa[]> {
    const query = `
      SELECT empresa_id, nombre, fecha_creacion, fecha_actualizacion
      FROM empresas
      ORDER BY nombre ASC
    `;
    const { rows } = await this.db.query(query);
    return rows.map(
      (row) =>
        new Empresa({
          empresaId: row.empresa_id,
          nombre: row.nombre,
          fechaCreacion: new Date(row.fecha_creacion),
          fechaActualizacion: new Date(row.fecha_actualizacion),
        })
    );
  }

  async delete(empresaId: string): Promise<void> {
    await this.db.query('DELETE FROM empresas WHERE empresa_id = $1', [empresaId]);
  }
}
