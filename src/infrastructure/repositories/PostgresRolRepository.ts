// Capa 4: Infrastructure - src/infrastructure/repositories/PostgresRolRepository.ts

import { Pool } from 'pg';
import { Rol } from '../../domain/entities/Rol.js';
import { IRolRepository } from '../../domain/repositories/IRolRepository.js';

export class PostgresRolRepository implements IRolRepository {
  constructor(private readonly db: Pool) {}

  async save(rol: Rol): Promise<Rol> {
    const query = `
      INSERT INTO roles (nombre, descripcion)
      VALUES ($1, $2)
      RETURNING rol_id, nombre, descripcion, fecha_creacion, fecha_actualizacion
    `;
    const { rows } = await this.db.query(query, [rol.nombre, rol.descripcion]);
    const row = rows[0];

    return new Rol({
      rolId: row.rol_id,
      nombre: row.nombre,
      descripcion: row.descripcion,
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion),
    });
  }

  async findById(rolId: string): Promise<Rol | null> {
    const query = `
      SELECT rol_id, nombre, descripcion, fecha_creacion, fecha_actualizacion
      FROM roles
      WHERE rol_id = $1
    `;
    const { rows } = await this.db.query(query, [rolId]);
    if (rows.length === 0) return null;
    const row = rows[0];

    return new Rol({
      rolId: row.rol_id,
      nombre: row.nombre,
      descripcion: row.descripcion,
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion),
    });
  }

  async findByNombre(nombre: string): Promise<Rol | null> {
    const query = `
      SELECT rol_id, nombre, descripcion, fecha_creacion, fecha_actualizacion
      FROM roles
      WHERE nombre = $1
    `;
    const { rows } = await this.db.query(query, [nombre]);
    if (rows.length === 0) return null;
    const row = rows[0];

    return new Rol({
      rolId: row.rol_id,
      nombre: row.nombre,
      descripcion: row.descripcion,
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion),
    });
  }

  async findAll(): Promise<Rol[]> {
    const query = `
      SELECT rol_id, nombre, descripcion, fecha_creacion, fecha_actualizacion
      FROM roles
      ORDER BY nombre ASC
    `;
    const { rows } = await this.db.query(query);
    return rows.map(
      (row) =>
        new Rol({
          rolId: row.rol_id,
          nombre: row.nombre,
          descripcion: row.descripcion,
          fechaCreacion: new Date(row.fecha_creacion),
          fechaActualizacion: new Date(row.fecha_actualizacion),
        })
    );
  }

  async delete(rolId: string): Promise<void> {
    await this.db.query('DELETE FROM roles WHERE rol_id = $1', [rolId]);
  }
}
