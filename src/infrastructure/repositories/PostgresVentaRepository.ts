// Capa 4: Infrastructure - src/infrastructure/repositories/PostgresVentaRepository.ts

import { Pool } from 'pg';
import { Venta, DetalleVenta } from '../../domain/entities/Venta.js';
import { IVentaRepository } from '../../domain/repositories/IVentaRepository.js';
import { TipoPalta } from '../../domain/constants/clasificacion.js';

export class PostgresVentaRepository implements IVentaRepository {
  constructor(private readonly db: Pool) {}

  async save(venta: Venta): Promise<Venta> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      const ventaQuery = `
        INSERT INTO ventas (empresa_id, vendedor_usuario_id, ubicacion_id, fecha_venta, monto_total, metodo_pago)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING venta_id, empresa_id, vendedor_usuario_id, ubicacion_id, fecha_venta, monto_total, metodo_pago, fecha_creacion, fecha_actualizacion
      `;
      const ventaValues = [
        venta.empresaId,
        venta.vendedorUsuarioId,
        venta.ubicacionId || null,
        venta.fechaVenta,
        venta.montoTotal,
        venta.metodoPago || 'Efectivo',
      ];

      const { rows: ventaRows } = await client.query(ventaQuery, ventaValues);
      const ventaRow = ventaRows[0];
      const ventaId = ventaRow.venta_id;

      const savedDetalles: DetalleVenta[] = [];

      for (const detalle of venta.detalles) {
        const detalleQuery = `
          INSERT INTO detalles_venta (venta_id, tipo_palta, categoria, kilos_vendidos, precio_unitario, subtotal)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING detalle_id, venta_id, tipo_palta, categoria, kilos_vendidos, precio_unitario, subtotal, fecha_creacion, fecha_actualizacion
        `;
        const detalleValues = [
          ventaId,
          detalle.tipoPalta,
          detalle.categoria,
          detalle.kilosVendidos,
          detalle.precioUnitario,
          detalle.subtotal,
        ];

        const { rows: detalleRows } = await client.query(detalleQuery, detalleValues);
        const dRow = detalleRows[0];

        savedDetalles.push(
          new DetalleVenta({
            detalleId: dRow.detalle_id,
            ventaId: dRow.venta_id,
            tipoPalta: dRow.tipo_palta as TipoPalta,
            categoria: dRow.categoria,
            kilosVendidos: parseFloat(dRow.kilos_vendidos),
            precioUnitario: parseFloat(dRow.precio_unitario),
            subtotal: parseFloat(dRow.subtotal),
            fechaCreacion: new Date(dRow.fecha_creacion),
            fechaActualizacion: new Date(dRow.fecha_actualizacion),
          })
        );
      }

      await client.query('COMMIT');

      return new Venta({
        ventaId: ventaRow.venta_id,
        empresaId: ventaRow.empresa_id,
        ubicacionId: ventaRow.ubicacion_id,
        vendedorUsuarioId: ventaRow.vendedor_usuario_id,
        fechaVenta: new Date(ventaRow.fecha_venta),
        montoTotal: parseFloat(ventaRow.monto_total),
        metodoPago: ventaRow.metodo_pago || 'Efectivo',
        detalles: savedDetalles,
        fechaCreacion: new Date(ventaRow.fecha_creacion),
        fechaActualizacion: new Date(ventaRow.fecha_actualizacion),
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(ventaId: string): Promise<Venta | null> {
    const ventaQuery = `
      SELECT 
        v.venta_id, 
        v.empresa_id, 
        v.vendedor_usuario_id, 
        v.ubicacion_id,
        u.nombre AS ubicacion_nombre,
        u.tipo AS ubicacion_tipo,
        v.fecha_venta, 
        v.monto_total, 
        v.metodo_pago,
        v.fecha_creacion, 
        v.fecha_actualizacion
      FROM ventas v
      LEFT JOIN ubicaciones u ON v.ubicacion_id = u.ubicacion_id
      WHERE v.venta_id = $1
    `;
    const { rows: ventaRows } = await this.db.query(ventaQuery, [ventaId]);
    if (ventaRows.length === 0) return null;
    const vRow = ventaRows[0];

    const detallesQuery = `
      SELECT detalle_id, venta_id, tipo_palta, categoria, kilos_vendidos, precio_unitario, subtotal, fecha_creacion, fecha_actualizacion
      FROM detalles_venta
      WHERE venta_id = $1
    `;
    const { rows: detalleRows } = await this.db.query(detallesQuery, [ventaId]);

    const detalles = detalleRows.map(
      (dRow) =>
        new DetalleVenta({
          detalleId: dRow.detalle_id,
          ventaId: dRow.venta_id,
          tipoPalta: dRow.tipo_palta as TipoPalta,
          categoria: dRow.categoria,
          kilosVendidos: parseFloat(dRow.kilos_vendidos),
          precioUnitario: parseFloat(dRow.precio_unitario),
          subtotal: parseFloat(dRow.subtotal),
          fechaCreacion: new Date(dRow.fecha_creacion),
          fechaActualizacion: new Date(dRow.fecha_actualizacion),
        })
    );

    return new Venta({
      ventaId: vRow.venta_id,
      empresaId: vRow.empresa_id,
      ubicacionId: vRow.ubicacion_id,
      ubicacionNombre: vRow.ubicacion_nombre || vRow.ubicacion_tipo,
      vendedorUsuarioId: vRow.vendedor_usuario_id,
      fechaVenta: new Date(vRow.fecha_venta),
      montoTotal: parseFloat(vRow.monto_total),
      metodoPago: vRow.metodo_pago || 'Efectivo',
      detalles,
      fechaCreacion: new Date(vRow.fecha_creacion),
      fechaActualizacion: new Date(vRow.fecha_actualizacion),
    });
  }

  async findByEmpresaId(empresaId: string): Promise<Venta[]> {
    const ventaQuery = `
      SELECT 
        v.venta_id, 
        v.empresa_id, 
        v.vendedor_usuario_id, 
        v.ubicacion_id,
        u.nombre AS ubicacion_nombre,
        u.tipo AS ubicacion_tipo,
        v.fecha_venta, 
        v.monto_total, 
        v.metodo_pago,
        v.fecha_creacion, 
        v.fecha_actualizacion
      FROM ventas v
      LEFT JOIN ubicaciones u ON v.ubicacion_id = u.ubicacion_id
      WHERE v.empresa_id = $1
      ORDER BY v.fecha_venta DESC
    `;
    const { rows: ventaRows } = await this.db.query(ventaQuery, [empresaId]);
    const ventas: Venta[] = [];

    for (const vRow of ventaRows) {
      const detallesQuery = `
        SELECT detalle_id, venta_id, tipo_palta, categoria, kilos_vendidos, precio_unitario, subtotal, fecha_creacion, fecha_actualizacion
        FROM detalles_venta
        WHERE venta_id = $1
      `;
      const { rows: detalleRows } = await this.db.query(detallesQuery, [vRow.venta_id]);
      const detalles = detalleRows.map(
        (dRow) =>
          new DetalleVenta({
            detalleId: dRow.detalle_id,
            ventaId: dRow.venta_id,
            tipoPalta: dRow.tipo_palta as TipoPalta,
            categoria: dRow.categoria,
            kilosVendidos: parseFloat(dRow.kilos_vendidos),
            precioUnitario: parseFloat(dRow.precio_unitario),
            subtotal: parseFloat(dRow.subtotal),
            fechaCreacion: new Date(dRow.fecha_creacion),
            fechaActualizacion: new Date(dRow.fecha_actualizacion),
          })
      );

      ventas.push(
        new Venta({
          ventaId: vRow.venta_id,
          empresaId: vRow.empresa_id,
          ubicacionId: vRow.ubicacion_id,
          ubicacionNombre: vRow.ubicacion_nombre || vRow.ubicacion_tipo,
          vendedorUsuarioId: vRow.vendedor_usuario_id,
          fechaVenta: new Date(vRow.fecha_venta),
          montoTotal: parseFloat(vRow.monto_total),
          metodoPago: vRow.metodo_pago || 'Efectivo',
          detalles,
          fechaCreacion: new Date(vRow.fecha_creacion),
          fechaActualizacion: new Date(vRow.fecha_actualizacion),
        })
      );
    }

    return ventas;
  }
}
