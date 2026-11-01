// Capa 4: Infrastructure - src/infrastructure/repositories/PostgresGastoOperativoRepository.ts

import { Pool } from 'pg';
import { GastoOperativo } from '../../domain/entities/GastoOperativo.js';
import { IGastoOperativoRepository } from '../../domain/repositories/IGastoOperativoRepository.js';
import { TipoGasto } from '../../domain/constants/clasificacion.js';

export class PostgresGastoOperativoRepository implements IGastoOperativoRepository {
  constructor(private readonly db: Pool) {}

  async save(gasto: GastoOperativo): Promise<GastoOperativo> {
    const query = `
      INSERT INTO gastos_operativos (acopio_id, nombre_receptor, tipo_gasto, concepto, cantidad_jabas, tarifa_por_jaba, monto_total, usuario_registro_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING gasto_id, acopio_id, nombre_receptor, tipo_gasto, concepto, cantidad_jabas, tarifa_por_jaba, monto_total, usuario_registro_id, fecha_creacion, fecha_actualizacion
    `;
    const values = [
      gasto.acopioId ?? null,
      gasto.nombreReceptor,
      gasto.tipoGasto,
      gasto.concepto,
      gasto.cantidadJabas ?? null,
      gasto.tarifaPorJaba ?? null,
      gasto.montoTotal,
      gasto.usuarioRegistroId,
    ];

    const { rows } = await this.db.query(query, values);
    const row = rows[0];

    return new GastoOperativo({
      gastoId: row.gasto_id,
      acopioId: row.acopio_id,
      nombreReceptor: row.nombre_receptor,
      tipoGasto: row.tipo_gasto as TipoGasto,
      concepto: row.concepto,
      cantidadJabas: row.cantidad_jabas ? parseInt(row.cantidad_jabas, 10) : null,
      tarifaPorJaba: row.tarifa_por_jaba ? parseFloat(row.tarifa_por_jaba) : null,
      montoTotal: parseFloat(row.monto_total),
      usuarioRegistroId: row.usuario_registro_id,
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion),
    });
  }

  async findById(gastoId: string): Promise<GastoOperativo | null> {
    const query = `
      SELECT gasto_id, acopio_id, nombre_receptor, tipo_gasto, concepto, cantidad_jabas, tarifa_por_jaba, monto_total, usuario_registro_id, fecha_creacion, fecha_actualizacion
      FROM gastos_operativos
      WHERE gasto_id = $1
    `;
    const { rows } = await this.db.query(query, [gastoId]);
    if (rows.length === 0) return null;

    const row = rows[0];
    return new GastoOperativo({
      gastoId: row.gasto_id,
      acopioId: row.acopio_id,
      nombreReceptor: row.nombre_receptor,
      tipoGasto: row.tipo_gasto as TipoGasto,
      concepto: row.concepto,
      cantidadJabas: row.cantidad_jabas ? parseInt(row.cantidad_jabas, 10) : null,
      tarifaPorJaba: row.tarifa_por_jaba ? parseFloat(row.tarifa_por_jaba) : null,
      montoTotal: parseFloat(row.monto_total),
      usuarioRegistroId: row.usuario_registro_id,
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion),
    });
  }

  async findByAcopioId(acopioId: string): Promise<GastoOperativo[]> {
    const query = `
      SELECT gasto_id, acopio_id, nombre_receptor, tipo_gasto, concepto, cantidad_jabas, tarifa_por_jaba, monto_total, usuario_registro_id, fecha_creacion, fecha_actualizacion
      FROM gastos_operativos
      WHERE acopio_id = $1
      ORDER BY fecha_creacion DESC
    `;
    const { rows } = await this.db.query(query, [acopioId]);
    return rows.map(
      (row) =>
        new GastoOperativo({
          gastoId: row.gasto_id,
          acopioId: row.acopio_id,
          nombreReceptor: row.nombre_receptor,
          tipoGasto: row.tipo_gasto as TipoGasto,
          concepto: row.concepto,
          cantidadJabas: row.cantidad_jabas ? parseInt(row.cantidad_jabas, 10) : null,
          tarifaPorJaba: row.tarifa_por_jaba ? parseFloat(row.tarifa_por_jaba) : null,
          montoTotal: parseFloat(row.monto_total),
          usuarioRegistroId: row.usuario_registro_id,
          fechaCreacion: new Date(row.fecha_creacion),
          fechaActualizacion: new Date(row.fecha_actualizacion),
        })
    );
  }

  async findByTipo(tipoGasto: TipoGasto): Promise<GastoOperativo[]> {
    const query = `
      SELECT gasto_id, acopio_id, nombre_receptor, tipo_gasto, concepto, cantidad_jabas, tarifa_por_jaba, monto_total, usuario_registro_id, fecha_creacion, fecha_actualizacion
      FROM gastos_operativos
      WHERE tipo_gasto = $1
      ORDER BY fecha_creacion DESC
    `;
    const { rows } = await this.db.query(query, [tipoGasto]);
    return rows.map(
      (row) =>
        new GastoOperativo({
          gastoId: row.gasto_id,
          acopioId: row.acopio_id,
          nombreReceptor: row.nombre_receptor,
          tipoGasto: row.tipo_gasto as TipoGasto,
          concepto: row.concepto,
          cantidadJabas: row.cantidad_jabas ? parseInt(row.cantidad_jabas, 10) : null,
          tarifaPorJaba: row.tarifa_por_jaba ? parseFloat(row.tarifa_por_jaba) : null,
          montoTotal: parseFloat(row.monto_total),
          usuarioRegistroId: row.usuario_registro_id,
          fechaCreacion: new Date(row.fecha_creacion),
          fechaActualizacion: new Date(row.fecha_actualizacion),
        })
    );
  }

  async findByEmpresaId(empresaId: string): Promise<any[]> {
    const query = `
      SELECT g.gasto_id, g.acopio_id, g.nombre_receptor, g.tipo_gasto, g.concepto, 
             g.cantidad_jabas, g.tarifa_por_jaba, g.monto_total, g.usuario_registro_id, 
             g.fecha_creacion, g.fecha_actualizacion,
             a.origen as acopio_origen, a.encargado_lote as acopio_encargado
      FROM gastos_operativos g
      LEFT JOIN acopios a ON g.acopio_id = a.acopio_id
      WHERE a.empresa_id = $1
      ORDER BY g.fecha_creacion DESC
    `;
    const { rows } = await this.db.query(query, [empresaId]);
    return rows.map((row) => ({
      gastoId: row.gasto_id,
      acopioId: row.acopio_id,
      nombreReceptor: row.nombre_receptor,
      tipoGasto: row.tipo_gasto,
      concepto: row.concepto,
      cantidadJabas: row.cantidad_jabas ? parseInt(row.cantidad_jabas, 10) : null,
      tarifaPorJaba: row.tarifa_por_jaba ? parseFloat(row.tarifa_por_jaba) : null,
      montoTotal: parseFloat(row.monto_total),
      usuarioRegistroId: row.usuario_registro_id,
      acopioOrigen: row.acopio_origen,
      acopioEncargado: row.acopio_encargado,
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion),
    }));
  }

  async update(gastoId: string, data: Partial<GastoOperativo>): Promise<GastoOperativo> {
    const existing = await this.findById(gastoId);
    if (!existing) {
      throw new Error(`Gasto operativo con ID ${gastoId} no encontrado`);
    }

    const nombreReceptor = data.nombreReceptor ?? existing.nombreReceptor;
    const concepto = data.concepto ?? existing.concepto;
    const cantidadJabas = data.cantidadJabas !== undefined ? data.cantidadJabas : existing.cantidadJabas;
    const tarifaPorJaba = data.tarifaPorJaba !== undefined ? data.tarifaPorJaba : existing.tarifaPorJaba;
    const montoTotal = data.montoTotal !== undefined ? data.montoTotal : existing.montoTotal;

    const query = `
      UPDATE gastos_operativos
      SET nombre_receptor = $1,
          concepto = $2,
          cantidad_jabas = $3,
          tarifa_por_jaba = $4,
          monto_total = $5,
          fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE gasto_id = $6
      RETURNING gasto_id, acopio_id, nombre_receptor, tipo_gasto, concepto, cantidad_jabas, tarifa_por_jaba, monto_total, usuario_registro_id, fecha_creacion, fecha_actualizacion
    `;
    const values = [nombreReceptor, concepto, cantidadJabas ?? null, tarifaPorJaba ?? null, montoTotal, gastoId];
    const { rows } = await this.db.query(query, values);
    const row = rows[0];

    if (existing.tipoGasto === 'Transporte' && existing.acopioId) {
      await this.db.query(
        'UPDATE acopios SET flete_costo = $1, fecha_actualizacion = CURRENT_TIMESTAMP WHERE acopio_id = $2',
        [montoTotal, existing.acopioId]
      );
    }

    return new GastoOperativo({
      gastoId: row.gasto_id,
      acopioId: row.acopio_id,
      nombreReceptor: row.nombre_receptor,
      tipoGasto: row.tipo_gasto as TipoGasto,
      concepto: row.concepto,
      cantidadJabas: row.cantidad_jabas ? parseInt(row.cantidad_jabas, 10) : null,
      tarifaPorJaba: row.tarifa_por_jaba ? parseFloat(row.tarifa_por_jaba) : null,
      montoTotal: parseFloat(row.monto_total),
      usuarioRegistroId: row.usuario_registro_id,
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion),
    });
  }

  async delete(gastoId: string): Promise<void> {
    await this.db.query('DELETE FROM gastos_operativos WHERE gasto_id = $1', [gastoId]);
  }
}
