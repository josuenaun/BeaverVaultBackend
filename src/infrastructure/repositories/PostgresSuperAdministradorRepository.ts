// Capa 4: Infrastructure - src/infrastructure/repositories/PostgresSuperAdministradorRepository.ts

import { Pool } from 'pg';
import { SuperAdministrador } from '../../domain/entities/SuperAdministrador.js';
import { ISuperAdministradorRepository } from '../../domain/repositories/ISuperAdministradorRepository.js';

export class PostgresSuperAdministradorRepository implements ISuperAdministradorRepository {
  constructor(private readonly db: Pool) {}

  async save(admin: SuperAdministrador): Promise<SuperAdministrador> {
    const query = `
      INSERT INTO super_administradores (nombre, correo, contrasena_hash, activo)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (correo)
      DO UPDATE SET
        nombre = EXCLUDED.nombre,
        contrasena_hash = EXCLUDED.contrasena_hash,
        activo = EXCLUDED.activo,
        fecha_actualizacion = CURRENT_TIMESTAMP
      RETURNING super_admin_id, nombre, correo, contrasena_hash, activo, fecha_creacion, fecha_actualizacion
    `;
    const values = [admin.nombre, admin.correo, admin.contrasenaHash, admin.activo];
    const { rows } = await this.db.query(query, values);
    const row = rows[0];

    return new SuperAdministrador({
      superAdminId: row.super_admin_id,
      nombre: row.nombre,
      correo: row.correo,
      contrasenaHash: row.contrasena_hash,
      activo: row.activo,
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion),
    });
  }

  async findById(superAdminId: string): Promise<SuperAdministrador | null> {
    const query = `
      SELECT super_admin_id, nombre, correo, contrasena_hash, activo, fecha_creacion, fecha_actualizacion
      FROM super_administradores
      WHERE super_admin_id = $1
    `;
    const { rows } = await this.db.query(query, [superAdminId]);
    if (rows.length === 0) return null;
    const row = rows[0];

    return new SuperAdministrador({
      superAdminId: row.super_admin_id,
      nombre: row.nombre,
      correo: row.correo,
      contrasenaHash: row.contrasena_hash,
      activo: row.activo,
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion),
    });
  }

  async findByCorreo(correo: string): Promise<SuperAdministrador | null> {
    const query = `
      SELECT super_admin_id, nombre, correo, contrasena_hash, activo, fecha_creacion, fecha_actualizacion
      FROM super_administradores
      WHERE correo = $1
    `;
    const { rows } = await this.db.query(query, [correo.toLowerCase()]);
    if (rows.length === 0) return null;
    const row = rows[0];

    return new SuperAdministrador({
      superAdminId: row.super_admin_id,
      nombre: row.nombre,
      correo: row.correo,
      contrasenaHash: row.contrasena_hash,
      activo: row.activo,
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion),
    });
  }

  async findAll(): Promise<SuperAdministrador[]> {
    const query = `
      SELECT super_admin_id, nombre, correo, contrasena_hash, activo, fecha_creacion, fecha_actualizacion
      FROM super_administradores
      ORDER BY fecha_creacion ASC
    `;
    const { rows } = await this.db.query(query);
    return rows.map(
      (row) =>
        new SuperAdministrador({
          superAdminId: row.super_admin_id,
          nombre: row.nombre,
          correo: row.correo,
          contrasenaHash: row.contrasena_hash,
          activo: row.activo,
          fechaCreacion: new Date(row.fecha_creacion),
          fechaActualizacion: new Date(row.fecha_actualizacion),
        })
    );
  }

  async delete(superAdminId: string): Promise<void> {
    await this.db.query('DELETE FROM super_administradores WHERE super_admin_id = $1', [superAdminId]);
  }
}
