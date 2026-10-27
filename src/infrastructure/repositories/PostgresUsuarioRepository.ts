// Capa 4: Infrastructure - src/infrastructure/repositories/PostgresUsuarioRepository.ts

import { Pool } from 'pg';
import { Usuario } from '../../domain/entities/Usuario.js';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository.js';

export class PostgresUsuarioRepository implements IUsuarioRepository {
  constructor(private readonly db: Pool) {}

  async save(usuario: Usuario): Promise<Usuario> {
    const query = `
      INSERT INTO usuarios (empresa_id, rol_id, nombre, correo, contrasena_hash)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING usuario_id, empresa_id, rol_id, nombre, correo, contrasena_hash, fecha_creacion, fecha_actualizacion
    `;
    const values = [
      usuario.empresaId,
      usuario.rolId,
      usuario.nombre,
      usuario.correo,
      usuario.contrasenaHash,
    ];
    const { rows } = await this.db.query(query, values);
    const row = rows[0];

    return new Usuario({
      usuarioId: row.usuario_id,
      empresaId: row.empresa_id,
      rolId: row.rol_id,
      nombre: row.nombre,
      correo: row.correo,
      contrasenaHash: row.contrasena_hash,
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion),
    });
  }

  async findById(usuarioId: string): Promise<Usuario | null> {
    const query = `
      SELECT usuario_id, empresa_id, rol_id, nombre, correo, contrasena_hash, fecha_creacion, fecha_actualizacion
      FROM usuarios
      WHERE usuario_id = $1
    `;
    const { rows } = await this.db.query(query, [usuarioId]);
    if (rows.length === 0) return null;
    const row = rows[0];

    return new Usuario({
      usuarioId: row.usuario_id,
      empresaId: row.empresa_id,
      rolId: row.rol_id,
      nombre: row.nombre,
      correo: row.correo,
      contrasenaHash: row.contrasena_hash,
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion),
    });
  }

  async findByCorreo(correo: string): Promise<Usuario | null> {
    const query = `
      SELECT usuario_id, empresa_id, rol_id, nombre, correo, contrasena_hash, fecha_creacion, fecha_actualizacion
      FROM usuarios
      WHERE correo = $1
    `;
    const { rows } = await this.db.query(query, [correo.toLowerCase()]);
    if (rows.length === 0) return null;
    const row = rows[0];

    return new Usuario({
      usuarioId: row.usuario_id,
      empresaId: row.empresa_id,
      rolId: row.rol_id,
      nombre: row.nombre,
      correo: row.correo,
      contrasenaHash: row.contrasena_hash,
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion),
    });
  }

  async findByEmpresaId(empresaId: string): Promise<Usuario[]> {
    const query = `
      SELECT usuario_id, empresa_id, rol_id, nombre, correo, contrasena_hash, fecha_creacion, fecha_actualizacion
      FROM usuarios
      WHERE empresa_id = $1
      ORDER BY nombre ASC
    `;
    const { rows } = await this.db.query(query, [empresaId]);
    return rows.map(
      (row) =>
        new Usuario({
          usuarioId: row.usuario_id,
          empresaId: row.empresa_id,
          rolId: row.rol_id,
          nombre: row.nombre,
          correo: row.correo,
          contrasenaHash: row.contrasena_hash,
          fechaCreacion: new Date(row.fecha_creacion),
          fechaActualizacion: new Date(row.fecha_actualizacion),
        })
    );
  }

  async delete(usuarioId: string): Promise<void> {
    await this.db.query('DELETE FROM usuarios WHERE usuario_id = $1', [usuarioId]);
  }
}
