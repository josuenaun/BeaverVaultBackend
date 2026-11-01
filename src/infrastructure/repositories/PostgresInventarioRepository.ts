// Capa 4: Infrastructure - src/infrastructure/repositories/PostgresInventarioRepository.ts

import { Pool } from 'pg';
import { InventarioKilos } from '../../domain/entities/InventarioKilos.js';
import { IInventarioKilosRepository, InventarioConUbicacion } from '../../domain/repositories/IInventarioKilosRepository.js';
import { TipoPalta } from '../../domain/constants/clasificacion.js';

export class PostgresInventarioRepository implements IInventarioKilosRepository {
  constructor(private readonly db: Pool) {}

  async findByUbicacionYPalta(
    ubicacionId: string,
    tipoPalta: TipoPalta,
    categoria: string
  ): Promise<InventarioKilos | null> {
    const query = `
      SELECT inventario_id, ubicacion_id, tipo_palta, categoria, kilos_disponibles, fecha_creacion, fecha_actualizacion
      FROM inventarios_kilos
      WHERE ubicacion_id = $1 AND tipo_palta = $2 AND categoria = $3
    `;
    const { rows } = await this.db.query(query, [ubicacionId, tipoPalta, categoria]);
    if (rows.length === 0) return null;

    const row = rows[0];
    return new InventarioKilos({
      inventarioId: row.inventario_id,
      ubicacionId: row.ubicacion_id,
      tipoPalta: row.tipo_palta as TipoPalta,
      categoria: row.categoria,
      kilosDisponibles: parseFloat(row.kilos_disponibles),
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion),
    });
  }

  async save(inventario: InventarioKilos): Promise<InventarioKilos> {
    const query = `
      INSERT INTO inventarios_kilos (ubicacion_id, tipo_palta, categoria, kilos_disponibles, fecha_actualizacion)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (ubicacion_id, tipo_palta, categoria)
      DO UPDATE SET
        kilos_disponibles = EXCLUDED.kilos_disponibles,
        fecha_actualizacion = CURRENT_TIMESTAMP
      RETURNING inventario_id, ubicacion_id, tipo_palta, categoria, kilos_disponibles, fecha_creacion, fecha_actualizacion
    `;
    const values = [
      inventario.ubicacionId,
      inventario.tipoPalta,
      inventario.categoria,
      inventario.kilosDisponibles,
    ];

    const { rows } = await this.db.query(query, values);
    const row = rows[0];

    return new InventarioKilos({
      inventarioId: row.inventario_id,
      ubicacionId: row.ubicacion_id,
      tipoPalta: row.tipo_palta as TipoPalta,
      categoria: row.categoria,
      kilosDisponibles: parseFloat(row.kilos_disponibles),
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion),
    });
  }

  async findByUbicacionId(ubicacionId: string): Promise<InventarioKilos[]> {
    const query = `
      SELECT inventario_id, ubicacion_id, tipo_palta, categoria, kilos_disponibles, fecha_creacion, fecha_actualizacion
      FROM inventarios_kilos
      WHERE ubicacion_id = $1
      ORDER BY tipo_palta ASC, categoria ASC
    `;
    const { rows } = await this.db.query(query, [ubicacionId]);
    return rows.map(
      (row) =>
        new InventarioKilos({
          inventarioId: row.inventario_id,
          ubicacionId: row.ubicacion_id,
          tipoPalta: row.tipo_palta as TipoPalta,
          categoria: row.categoria,
          kilosDisponibles: parseFloat(row.kilos_disponibles),
          fechaCreacion: new Date(row.fecha_creacion),
          fechaActualizacion: new Date(row.fecha_actualizacion),
        })
    );
  }

  async findByEmpresaId(empresaId: string): Promise<InventarioConUbicacion[]> {
    const query = `
      SELECT 
        ik.inventario_id, 
        ik.ubicacion_id, 
        u.nombre AS ubicacion_nombre, 
        u.tipo AS ubicacion_tipo, 
        ik.tipo_palta, 
        ik.categoria, 
        ik.kilos_disponibles, 
        ik.fecha_creacion, 
        ik.fecha_actualizacion
      FROM inventarios_kilos ik
      INNER JOIN ubicaciones u ON ik.ubicacion_id = u.ubicacion_id
      WHERE u.empresa_id = $1
      ORDER BY u.nombre ASC, ik.tipo_palta ASC, ik.categoria ASC
    `;
    const { rows } = await this.db.query(query, [empresaId]);
    return rows.map((row) => ({
      inventarioId: row.inventario_id,
      ubicacionId: row.ubicacion_id,
      ubicacionNombre: row.ubicacion_nombre,
      ubicacionTipo: row.ubicacion_tipo,
      tipoPalta: row.tipo_palta as TipoPalta,
      categoria: row.categoria,
      kilosDisponibles: parseFloat(row.kilos_disponibles),
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion),
    }));
  }
}
