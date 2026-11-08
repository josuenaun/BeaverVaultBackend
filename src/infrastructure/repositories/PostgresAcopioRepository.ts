// Capa 4: Infrastructure - src/infrastructure/repositories/PostgresAcopioRepository.ts

import { Pool } from 'pg';
import { Acopio } from '../../domain/entities/Acopio.js';
import { Jaba } from '../../domain/entities/Jaba.js';
import { IAcopioRepository } from '../../domain/repositories/IAcopioRepository.js';
import { EstadoAcopio, EstadoJaba, TipoPalta } from '../../domain/constants/clasificacion.js';

export class PostgresAcopioRepository implements IAcopioRepository {
  constructor(private readonly db: Pool) {}

  async save(acopio: Acopio): Promise<Acopio> {
    const query = `
      INSERT INTO acopios (empresa_id, encargado_lote, fecha_compra, fecha_llegada, origen, flete_costo, estado, creado_por_usuario_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING acopio_id, empresa_id, encargado_lote, fecha_compra::text as fecha_compra, fecha_llegada, origen, flete_costo, estado, creado_por_usuario_id, fecha_creacion, fecha_actualizacion
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
      fechaCompra: String(row.fecha_compra),
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
      SELECT acopio_id, empresa_id, encargado_lote, fecha_compra::text as fecha_compra, fecha_llegada, origen, flete_costo, estado, creado_por_usuario_id, fecha_creacion, fecha_actualizacion
      FROM acopios
      WHERE acopio_id = $1
    `;
    const { rows } = await this.db.query(query, [acopioId]);
    if (rows.length === 0) return null;

    const row = rows[0];

    // Cargar jabas asociadas
    const jabasQuery = `
      SELECT jaba_id, acopio_id, ubicacion_id, tipo_palta, categoria, codigo_color, cantidad_jabas, peso_bruto,
             CASE 
               WHEN estado = 'Convertida_Kilos' THEN 0.00
               WHEN peso_actual IS NULL THEN peso_bruto 
               ELSE peso_actual 
             END as peso_actual,
             estado, fecha_creacion, fecha_actualizacion
      FROM jabas
      WHERE acopio_id = $1
      ORDER BY fecha_creacion ASC
    `;
    const { rows: jabaRows } = await this.db.query(jabasQuery, [acopioId]);
    const jabas = jabaRows.map(
      (jr) =>
        new Jaba({
          jabaId: jr.jaba_id,
          acopioId: jr.acopio_id,
          ubicacionId: jr.ubicacion_id,
          tipoPalta: jr.tipo_palta as TipoPalta,
          categoria: jr.categoria,
          codigoColor: jr.codigo_color,
          cantidadJabas: parseInt(jr.cantidad_jabas, 10),
          pesoBruto: parseFloat(jr.peso_bruto),
          pesoActual: parseFloat(jr.peso_actual),
          estado: jr.estado as EstadoJaba,
          fechaCreacion: new Date(jr.fecha_creacion),
          fechaActualizacion: new Date(jr.fecha_actualizacion),
        })
    );

    // Cargar gastos asociados
    const gastosQuery = `
      SELECT gasto_id, acopio_id, nombre_receptor, tipo_gasto, concepto, cantidad_jabas, tarifa_por_jaba, monto_total, usuario_registro_id, fecha_creacion, fecha_actualizacion
      FROM gastos_operativos
      WHERE acopio_id = $1
      ORDER BY fecha_creacion ASC
    `;
    const { rows: gastoRows } = await this.db.query(gastosQuery, [acopioId]);
    const gastos = gastoRows.map((gr) => ({
      gastoId: gr.gasto_id,
      acopioId: gr.acopio_id,
      nombreReceptor: gr.nombre_receptor,
      tipoGasto: gr.tipo_gasto,
      concepto: gr.concepto,
      cantidadJabas: gr.cantidad_jabas ? parseInt(gr.cantidad_jabas, 10) : null,
      tarifaPorJaba: gr.tarifa_por_jaba ? parseFloat(gr.tarifa_por_jaba) : null,
      montoTotal: parseFloat(gr.monto_total),
      usuarioRegistroId: gr.usuario_registro_id,
      fechaCreacion: new Date(gr.fecha_creacion),
      fechaActualizacion: new Date(gr.fecha_actualizacion),
    }));

    return new Acopio({
      acopioId: row.acopio_id,
      empresaId: row.empresa_id,
      encargadoLote: row.encargado_lote,
      fechaCompra: String(row.fecha_compra),
      fechaLlegada: row.fecha_llegada ? new Date(row.fecha_llegada) : null,
      origen: row.origen,
      fleteCosto: parseFloat(row.flete_costo),
      estado: row.estado as EstadoAcopio,
      creadoPorUsuarioId: row.creado_por_usuario_id,
      jabas,
      gastos,
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion),
    });
  }

  async findByEmpresaId(empresaId: string): Promise<Acopio[]> {
    const query = `
      SELECT acopio_id, empresa_id, encargado_lote, fecha_compra::text as fecha_compra, fecha_llegada, origen, flete_costo, estado, creado_por_usuario_id, fecha_creacion, fecha_actualizacion
      FROM acopios
      WHERE empresa_id = $1
      ORDER BY fecha_creacion DESC
    `;
    const { rows } = await this.db.query(query, [empresaId]);
    if (rows.length === 0) return [];

    // Consultar todas las jabas correspondientes a estos lotes de acopio
    const acopioIds = rows.map((r) => r.acopio_id);
    const jabasQuery = `
      SELECT jaba_id, acopio_id, ubicacion_id, tipo_palta, categoria, codigo_color, cantidad_jabas, peso_bruto,
             CASE 
               WHEN estado = 'Convertida_Kilos' THEN 0.00
               WHEN peso_actual IS NULL THEN peso_bruto 
               ELSE peso_actual 
             END as peso_actual,
             estado, fecha_creacion, fecha_actualizacion
      FROM jabas
      WHERE acopio_id = ANY($1)
      ORDER BY fecha_creacion ASC
    `;
    const { rows: jabaRows } = await this.db.query(jabasQuery, [acopioIds]);

    const jabasPorAcopio = new Map<string, Jaba[]>();
    for (const jr of jabaRows) {
      if (!jabasPorAcopio.has(jr.acopio_id)) {
        jabasPorAcopio.set(jr.acopio_id, []);
      }
      jabasPorAcopio.get(jr.acopio_id)!.push(
        new Jaba({
          jabaId: jr.jaba_id,
          acopioId: jr.acopio_id,
          ubicacionId: jr.ubicacion_id,
          tipoPalta: jr.tipo_palta as TipoPalta,
          categoria: jr.categoria,
          codigoColor: jr.codigo_color,
          cantidadJabas: parseInt(jr.cantidad_jabas, 10),
          pesoBruto: parseFloat(jr.peso_bruto),
          pesoActual: parseFloat(jr.peso_actual),
          estado: jr.estado as EstadoJaba,
          fechaCreacion: new Date(jr.fecha_creacion),
          fechaActualizacion: new Date(jr.fecha_actualizacion),
        })
      );
    }

    // Consultar todos los gastos operativos correspondientes a estos lotes de acopio
    const gastosQuery = `
      SELECT gasto_id, acopio_id, nombre_receptor, tipo_gasto, concepto, cantidad_jabas, tarifa_por_jaba, monto_total, usuario_registro_id, fecha_creacion, fecha_actualizacion
      FROM gastos_operativos
      WHERE acopio_id = ANY($1)
      ORDER BY fecha_creacion ASC
    `;
    const { rows: gastoRows } = await this.db.query(gastosQuery, [acopioIds]);
    const gastosPorAcopio = new Map<string, any[]>();
    for (const gr of gastoRows) {
      if (!gastosPorAcopio.has(gr.acopio_id)) {
        gastosPorAcopio.set(gr.acopio_id, []);
      }
      gastosPorAcopio.get(gr.acopio_id)!.push({
        gastoId: gr.gasto_id,
        acopioId: gr.acopio_id,
        nombreReceptor: gr.nombre_receptor,
        tipoGasto: gr.tipo_gasto,
        concepto: gr.concepto,
        cantidadJabas: gr.cantidad_jabas ? parseInt(gr.cantidad_jabas, 10) : null,
        tarifaPorJaba: gr.tarifa_por_jaba ? parseFloat(gr.tarifa_por_jaba) : null,
        montoTotal: parseFloat(gr.monto_total),
        usuarioRegistroId: gr.usuario_registro_id,
        fechaCreacion: new Date(gr.fecha_creacion),
        fechaActualizacion: new Date(gr.fecha_actualizacion),
      });
    }

    return rows.map(
      (row) =>
        new Acopio({
          acopioId: row.acopio_id,
          empresaId: row.empresa_id,
          encargadoLote: row.encargado_lote,
          fechaCompra: String(row.fecha_compra),
          fechaLlegada: row.fecha_llegada ? new Date(row.fecha_llegada) : null,
          origen: row.origen,
          fleteCosto: parseFloat(row.flete_costo),
          estado: row.estado as EstadoAcopio,
          creadoPorUsuarioId: row.creado_por_usuario_id,
          jabas: jabasPorAcopio.get(row.acopio_id) || [],
          gastos: gastosPorAcopio.get(row.acopio_id) || [],
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

  async verificarYLiquidarSiAgotado(acopioId: string): Promise<boolean> {
    const query = `
      SELECT 
        COUNT(*) as total_jabas,
        COALESCE(SUM(
          CASE 
            WHEN estado = 'Convertida_Kilos' THEN 0
            WHEN peso_actual IS NULL THEN peso_bruto 
            ELSE peso_actual 
          END
        ), 0) as total_peso_remanente
      FROM jabas
      WHERE acopio_id = $1
    `;
    const { rows } = await this.db.query(query, [acopioId]);
    const totalJabas = parseInt(rows[0].total_jabas, 10);
    const remanente = parseFloat(rows[0].total_peso_remanente);

    if (totalJabas > 0 && remanente <= 0) {
      await this.db.query(
        "UPDATE acopios SET estado = 'Liquidado', fecha_actualizacion = CURRENT_TIMESTAMP WHERE acopio_id = $1",
        [acopioId]
      );
      return true;
    }
    return false;
  }

  async delete(acopioId: string): Promise<void> {
    // 1. Eliminar el acopio (hace eliminación en cascada a jabas y gastos_operativos)
    await this.db.query('DELETE FROM acopios WHERE acopio_id = $1', [acopioId]);

    // 2. Si ya no quedan acopios en la base de datos, purgar completamente inventarios_kilos huérfanos
    const countRes = await this.db.query('SELECT COUNT(*) FROM acopios');
    const totalAcopios = parseInt(countRes.rows[0].count, 10);
    if (totalAcopios === 0) {
      await this.db.query('DELETE FROM inventarios_kilos');
    } else {
      // 3. Si quedan otros acopios, recalcular y sincronizar inventarios_kilos con las jabas restantes
      await this.db.query(`
        UPDATE inventarios_kilos ik
        SET kilos_disponibles = GREATEST(0, COALESCE((
          SELECT SUM(j.peso_bruto)
          FROM jabas j
          WHERE j.ubicacion_id = ik.ubicacion_id
            AND j.tipo_palta = ik.tipo_palta
            AND j.categoria = ik.categoria
        ), 0) - COALESCE((
          SELECT SUM(dv.kilos_vendidos)
          FROM ventas v
          INNER JOIN detalles_venta dv ON v.venta_id = dv.venta_id
          WHERE v.ubicacion_id = ik.ubicacion_id
            AND dv.tipo_palta = ik.tipo_palta
            AND dv.categoria = ik.categoria
        ), 0))
      `);
      // 4. Eliminar registros huérfanos que quedaron en 0 kilos y no tienen jabas existentes
      await this.db.query(`
        DELETE FROM inventarios_kilos ik
        WHERE ik.kilos_disponibles = 0
          AND NOT EXISTS (
            SELECT 1 FROM jabas j 
            WHERE j.ubicacion_id = ik.ubicacion_id 
              AND j.tipo_palta = ik.tipo_palta 
              AND j.categoria = ik.categoria
          )
      `);
    }
  }
}
