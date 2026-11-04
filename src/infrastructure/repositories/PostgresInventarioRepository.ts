// Capa 4: Infrastructure - src/infrastructure/repositories/PostgresInventarioRepository.ts

import { Pool } from 'pg';
import { InventarioKilos } from '../../domain/entities/InventarioKilos.js';
import { IInventarioKilosRepository, InventarioConUbicacion } from '../../domain/repositories/IInventarioKilosRepository.js';
import { TipoPalta } from '../../domain/constants/clasificacion.js';

export class PostgresInventarioRepository implements IInventarioKilosRepository {
  constructor(private readonly db: Pool) {}

  /**
   * Obtener inventario de una variedad y calidad específica en un puesto.
   * Calcula el stock disponible en tiempo real a partir de las jabas activas en Lima menos las ventas.
   */
  async findByUbicacionYPalta(
    ubicacionId: string,
    tipoPalta: TipoPalta,
    categoria: string
  ): Promise<InventarioKilos | null> {
    const query = `
      SELECT 
        COALESCE(SUM(j.peso_bruto), 0) AS total_jabas_kg,
        COALESCE(v.total_vendido, 0) AS total_vendido_kg,
        GREATEST(0, (COALESCE(SUM(j.peso_bruto), 0) - COALESCE(v.total_vendido, 0))) AS kilos_disponibles
      FROM jabas j
      INNER JOIN acopios a ON j.acopio_id = a.acopio_id
      INNER JOIN ubicaciones u ON j.ubicacion_id = u.ubicacion_id
      LEFT JOIN (
        SELECT 
          v2.ubicacion_id, 
          dv.tipo_palta, 
          dv.categoria, 
          SUM(dv.kilos_vendidos) as total_vendido
        FROM ventas v2
        INNER JOIN detalles_venta dv ON v2.venta_id = dv.venta_id
        WHERE v2.ubicacion_id = $1 AND dv.tipo_palta = $2 AND dv.categoria = $3
        GROUP BY v2.ubicacion_id, dv.tipo_palta, dv.categoria
      ) v ON j.ubicacion_id = v.ubicacion_id 
          AND j.tipo_palta = v.tipo_palta 
          AND j.categoria = v.categoria
      WHERE j.ubicacion_id = $1 
        AND j.tipo_palta = $2 
        AND j.categoria = $3
      GROUP BY v.total_vendido
    `;

    const { rows } = await this.db.query(query, [ubicacionId, tipoPalta, categoria]);

    let kilos = 0;
    if (rows.length > 0) {
      kilos = parseFloat(rows[0].kilos_disponibles) || 0;
    } else {
      // Fallback a inventarios_kilos cache si existiera
      const fallbackQuery = `
        SELECT kilos_disponibles FROM inventarios_kilos
        WHERE ubicacion_id = $1 AND tipo_palta = $2 AND categoria = $3
      `;
      const fbRes = await this.db.query(fallbackQuery, [ubicacionId, tipoPalta, categoria]);
      if (fbRes.rows.length === 0) return null;
      kilos = parseFloat(fbRes.rows[0].kilos_disponibles) || 0;
    }

    return new InventarioKilos({
      ubicacionId,
      tipoPalta,
      categoria,
      kilosDisponibles: kilos,
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

  /**
   * Obtener inventario en kilos de una ubicación física específica.
   * Totalmente sincronizado con las jabas distribuidas en Lima menos las ventas de esa ubicación.
   */
  async findByUbicacionId(ubicacionId: string): Promise<InventarioKilos[]> {
    const query = `
      SELECT 
        gen_random_uuid() AS inventario_id,
        j.ubicacion_id,
        j.tipo_palta,
        j.categoria,
        GREATEST(0, (SUM(j.peso_bruto) - COALESCE(v.total_vendido, 0))) AS kilos_disponibles,
        NOW() AS fecha_creacion,
        NOW() AS fecha_actualizacion
      FROM jabas j
      INNER JOIN acopios a ON j.acopio_id = a.acopio_id
      INNER JOIN ubicaciones u ON j.ubicacion_id = u.ubicacion_id
      LEFT JOIN (
        SELECT 
          v2.ubicacion_id, 
          dv.tipo_palta, 
          dv.categoria, 
          SUM(dv.kilos_vendidos) as total_vendido
        FROM ventas v2
        INNER JOIN detalles_venta dv ON v2.venta_id = dv.venta_id
        WHERE v2.ubicacion_id = $1
        GROUP BY v2.ubicacion_id, dv.tipo_palta, dv.categoria
      ) v ON j.ubicacion_id = v.ubicacion_id 
          AND j.tipo_palta = v.tipo_palta 
          AND j.categoria = v.categoria
      WHERE j.ubicacion_id = $1
      GROUP BY j.ubicacion_id, j.tipo_palta, j.categoria, v.total_vendido
      HAVING GREATEST(0, (SUM(j.peso_bruto) - COALESCE(v.total_vendido, 0))) >= 0
      ORDER BY j.tipo_palta ASC, j.categoria ASC
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

  /**
   * Obtener todo el inventario en kilos de una empresa agrupado por sus puestos de Lima.
   * La fuente de la verdad son las jabas distribuidas en Lima menos las ventas registradas.
   */
  async findByEmpresaId(empresaId: string): Promise<InventarioConUbicacion[]> {
    const query = `
      SELECT 
        gen_random_uuid() AS inventario_id, 
        u.ubicacion_id, 
        u.nombre AS ubicacion_nombre, 
        u.tipo AS ubicacion_tipo, 
        j.tipo_palta, 
        j.categoria, 
        GREATEST(0, (SUM(j.peso_bruto) - COALESCE(v.total_vendido, 0))) AS kilos_disponibles, 
        NOW() AS fecha_creacion, 
        NOW() AS fecha_actualizacion
      FROM jabas j
      INNER JOIN acopios a ON j.acopio_id = a.acopio_id
      INNER JOIN ubicaciones u ON j.ubicacion_id = u.ubicacion_id
      LEFT JOIN (
        SELECT 
          v2.ubicacion_id, 
          dv.tipo_palta, 
          dv.categoria, 
          SUM(dv.kilos_vendidos) as total_vendido
        FROM ventas v2
        INNER JOIN detalles_venta dv ON v2.venta_id = dv.venta_id
        GROUP BY v2.ubicacion_id, dv.tipo_palta, dv.categoria
      ) v ON j.ubicacion_id = v.ubicacion_id 
          AND j.tipo_palta = v.tipo_palta 
          AND j.categoria = v.categoria
      WHERE u.empresa_id = $1
        AND u.tipo != 'Acopio' AND u.nombre != 'Acopio'
      GROUP BY u.ubicacion_id, u.nombre, u.tipo, j.tipo_palta, j.categoria, v.total_vendido
      HAVING GREATEST(0, (SUM(j.peso_bruto) - COALESCE(v.total_vendido, 0))) >= 0
      ORDER BY u.nombre ASC, j.tipo_palta ASC, j.categoria ASC
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
