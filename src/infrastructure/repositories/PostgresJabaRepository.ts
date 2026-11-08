// Capa 4: Infrastructure - src/infrastructure/repositories/PostgresJabaRepository.ts

import { Pool } from 'pg';
import { Jaba } from '../../domain/entities/Jaba.js';
import { IJabaRepository } from '../../domain/repositories/IJabaRepository.js';
import { EstadoJaba, TipoPalta } from '../../domain/constants/clasificacion.js';

export class PostgresJabaRepository implements IJabaRepository {
  constructor(private readonly db: Pool) {}

  async saveMany(jabas: Jaba[]): Promise<Jaba[]> {
    const saved: Jaba[] = [];
    for (const jaba of jabas) {
      const query = `
        INSERT INTO jabas (acopio_id, ubicacion_id, tipo_palta, categoria, codigo_color, cantidad_jabas, peso_bruto, peso_actual, estado)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING jaba_id, acopio_id, ubicacion_id, tipo_palta, categoria, codigo_color, cantidad_jabas, peso_bruto, COALESCE(peso_actual, peso_bruto) as peso_actual, estado, fecha_creacion, fecha_actualizacion
      `;
      const values = [
        jaba.acopioId,
        jaba.ubicacionId,
        jaba.tipoPalta,
        jaba.categoria,
        jaba.codigoColor,
        jaba.cantidadJabas,
        jaba.pesoBruto,
        jaba.pesoActual !== undefined ? jaba.pesoActual : jaba.pesoBruto,
        jaba.estado,
      ];

      const { rows } = await this.db.query(query, values);
      const row = rows[0];

      saved.push(
        new Jaba({
          jabaId: row.jaba_id,
          acopioId: row.acopio_id,
          ubicacionId: row.ubicacion_id,
          tipoPalta: row.tipo_palta as TipoPalta,
          categoria: row.categoria,
          codigoColor: row.codigo_color,
          cantidadJabas: parseInt(row.cantidad_jabas, 10),
          pesoBruto: parseFloat(row.peso_bruto),
          pesoActual: parseFloat(row.peso_actual),
          estado: row.estado as EstadoJaba,
          fechaCreacion: new Date(row.fecha_creacion),
          fechaActualizacion: new Date(row.fecha_actualizacion),
        })
      );
    }
    return saved;
  }

  async findById(jabaId: string): Promise<Jaba | null> {
    const query = `
      SELECT jaba_id, acopio_id, ubicacion_id, tipo_palta, categoria, codigo_color, cantidad_jabas, peso_bruto,
             CASE 
               WHEN estado = 'Convertida_Kilos' THEN 0.00
               WHEN peso_actual IS NULL THEN peso_bruto 
               ELSE peso_actual 
             END as peso_actual,
             estado, fecha_creacion, fecha_actualizacion
      FROM jabas
      WHERE jaba_id = $1
    `;
    const { rows } = await this.db.query(query, [jabaId]);
    if (rows.length === 0) return null;

    const row = rows[0];
    return new Jaba({
      jabaId: row.jaba_id,
      acopioId: row.acopio_id,
      ubicacionId: row.ubicacion_id,
      tipoPalta: row.tipo_palta as TipoPalta,
      categoria: row.categoria,
      codigoColor: row.codigo_color,
      cantidadJabas: parseInt(row.cantidad_jabas, 10),
      pesoBruto: parseFloat(row.peso_bruto),
      pesoActual: parseFloat(row.peso_actual),
      estado: row.estado as EstadoJaba,
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion),
    });
  }

  async findByAcopioId(acopioId: string): Promise<Jaba[]> {
    const query = `
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
    const { rows } = await this.db.query(query, [acopioId]);
    return rows.map(
      (row) =>
        new Jaba({
          jabaId: row.jaba_id,
          acopioId: row.acopio_id,
          ubicacionId: row.ubicacion_id,
          tipoPalta: row.tipo_palta as TipoPalta,
          categoria: row.categoria,
          codigoColor: row.codigo_color,
          cantidadJabas: parseInt(row.cantidad_jabas, 10),
          pesoBruto: parseFloat(row.peso_bruto),
          pesoActual: parseFloat(row.peso_actual),
          estado: row.estado as EstadoJaba,
          fechaCreacion: new Date(row.fecha_creacion),
          fechaActualizacion: new Date(row.fecha_actualizacion),
        })
    );
  }

  async findByUbicacionId(ubicacionId: string): Promise<Jaba[]> {
    const query = `
      SELECT jaba_id, acopio_id, ubicacion_id, tipo_palta, categoria, codigo_color, cantidad_jabas, peso_bruto,
             CASE 
               WHEN estado = 'Convertida_Kilos' THEN 0.00
               WHEN peso_actual IS NULL THEN peso_bruto 
               ELSE peso_actual 
             END as peso_actual,
             estado, fecha_creacion, fecha_actualizacion
      FROM jabas
      WHERE ubicacion_id = $1
      ORDER BY fecha_creacion ASC
    `;
    const { rows } = await this.db.query(query, [ubicacionId]);
    return rows.map(
      (row) =>
        new Jaba({
          jabaId: row.jaba_id,
          acopioId: row.acopio_id,
          ubicacionId: row.ubicacion_id,
          tipoPalta: row.tipo_palta as TipoPalta,
          categoria: row.categoria,
          codigoColor: row.codigo_color,
          cantidadJabas: parseInt(row.cantidad_jabas, 10),
          pesoBruto: parseFloat(row.peso_bruto),
          pesoActual: parseFloat(row.peso_actual),
          estado: row.estado as EstadoJaba,
          fechaCreacion: new Date(row.fecha_creacion),
          fechaActualizacion: new Date(row.fecha_actualizacion),
        })
    );
  }

  async updateUbicacion(jabaId: string, ubicacionId: string): Promise<void> {
    const query = `
      UPDATE jabas
      SET ubicacion_id = $1, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE jaba_id = $2
    `;
    await this.db.query(query, [ubicacionId, jabaId]);
  }

  async updateEstado(jabaId: string, estado: EstadoJaba): Promise<void> {
    const query = `
      UPDATE jabas
      SET estado = $1, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE jaba_id = $2
    `;
    await this.db.query(query, [estado, jabaId]);
  }

  async updateUbicacionYEstadoByAcopio(
    acopioId: string,
    ubicacionId: string | null,
    estado: EstadoJaba
  ): Promise<void> {
    const query = `
      UPDATE jabas
      SET ubicacion_id = COALESCE($1, ubicacion_id),
          estado = $2,
          fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE acopio_id = $3
    `;
    await this.db.query(query, [ubicacionId, estado, acopioId]);
  }

  async dividirJaba(
    jabaId: string,
    cantidadSeparar: number,
    pesoSeparado: number,
    ubicacionId: string
  ): Promise<{ original: Jaba; nueva: Jaba }> {
    const original = await this.findById(jabaId);
    if (!original) {
      throw new Error(`Jaba con ID ${jabaId} no encontrada`);
    }

    if (cantidadSeparar <= 0 || cantidadSeparar >= original.cantidadJabas) {
      throw new Error(
        `Cantidad a separar inválida: debe ser mayor a 0 y menor a ${original.cantidadJabas}`
      );
    }

    if (pesoSeparado <= 0 || pesoSeparado >= original.pesoBruto) {
      throw new Error(
        `Peso a separar inválido: debe ser mayor a 0 y menor a ${original.pesoBruto} kg`
      );
    }

    const nuevaCantOriginal = original.cantidadJabas - cantidadSeparar;
    const nuevoPesoOriginal = Number((original.pesoBruto - pesoSeparado).toFixed(2));
    const pesoActualBase = original.pesoActual > 0 ? original.pesoActual : original.pesoBruto;
    const nuevoPesoActualOriginal = Math.max(0, Number((pesoActualBase - pesoSeparado).toFixed(2)));

    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // 1. Actualizar jaba original con remanente
      const updateQuery = `
        UPDATE jabas
        SET cantidad_jabas = $1,
            peso_bruto = $2,
            peso_actual = $3,
            fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE jaba_id = $4
        RETURNING jaba_id, acopio_id, ubicacion_id, tipo_palta, categoria, codigo_color, cantidad_jabas, peso_bruto, peso_actual, estado, fecha_creacion, fecha_actualizacion
      `;
      const { rows: updateRows } = await client.query(updateQuery, [
        nuevaCantOriginal,
        nuevoPesoOriginal,
        nuevoPesoActualOriginal,
        jabaId,
      ]);
      const ur = updateRows[0];

      // 2. Insertar nueva jaba separada con la ubicación destino
      const insertQuery = `
        INSERT INTO jabas (acopio_id, ubicacion_id, tipo_palta, categoria, codigo_color, cantidad_jabas, peso_bruto, peso_actual, estado)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING jaba_id, acopio_id, ubicacion_id, tipo_palta, categoria, codigo_color, cantidad_jabas, peso_bruto, peso_actual, estado, fecha_creacion, fecha_actualizacion
      `;
      const insertValues = [
        original.acopioId,
        ubicacionId,
        original.tipoPalta,
        original.categoria,
        original.codigoColor,
        cantidadSeparar,
        pesoSeparado,
        pesoSeparado,
        'Almacenada',
      ];
      const { rows: insertRows } = await client.query(insertQuery, insertValues);
      const ir = insertRows[0];

      // 3. Confirmar lote en estado Recibido en Lima
      if (original.acopioId) {
        await client.query(
          "UPDATE acopios SET estado = 'Recibido', fecha_llegada = COALESCE(fecha_llegada, CURRENT_TIMESTAMP), fecha_actualizacion = CURRENT_TIMESTAMP WHERE acopio_id = $1",
          [original.acopioId]
        );
      }

      await client.query('COMMIT');

      const originalActualizada = new Jaba({
        jabaId: ur.jaba_id,
        acopioId: ur.acopio_id,
        ubicacionId: ur.ubicacion_id,
        tipoPalta: ur.tipo_palta as TipoPalta,
        categoria: ur.categoria,
        codigoColor: ur.codigo_color,
        cantidadJabas: parseInt(ur.cantidad_jabas, 10),
        pesoBruto: parseFloat(ur.peso_bruto),
        pesoActual: parseFloat(ur.peso_actual),
        estado: ur.estado as EstadoJaba,
        fechaCreacion: new Date(ur.fecha_creacion),
        fechaActualizacion: new Date(ur.fecha_actualizacion),
      });

      const nuevaJaba = new Jaba({
        jabaId: ir.jaba_id,
        acopioId: ir.acopio_id,
        ubicacionId: ir.ubicacion_id,
        tipoPalta: ir.tipo_palta as TipoPalta,
        categoria: ir.categoria,
        codigoColor: ir.codigo_color,
        cantidadJabas: parseInt(ir.cantidad_jabas, 10),
        pesoBruto: parseFloat(ir.peso_bruto),
        pesoActual: parseFloat(ir.peso_actual),
        estado: ir.estado as EstadoJaba,
        fechaCreacion: new Date(ir.fecha_creacion),
        fechaActualizacion: new Date(ir.fecha_actualizacion),
      });

      return { original: originalActualizada, nueva: nuevaJaba };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async findActivasPorUbicacionYPalta(
    ubicacionId: string,
    tipoPalta: string,
    categoria: string
  ): Promise<Jaba[]> {
    const query = `
      SELECT j.jaba_id, j.acopio_id, j.ubicacion_id, j.tipo_palta, j.categoria, j.codigo_color, 
             j.cantidad_jabas, j.peso_bruto, 
             COALESCE(j.peso_actual, j.peso_bruto) as peso_actual, 
             j.estado, j.fecha_creacion, j.fecha_actualizacion
      FROM jabas j
      INNER JOIN acopios a ON j.acopio_id = a.acopio_id
      WHERE j.ubicacion_id = $1
        AND j.tipo_palta = $2
        AND j.categoria = $3
        AND j.estado NOT IN ('Convertida_Kilos', 'Descartada')
        AND COALESCE(j.peso_actual, j.peso_bruto) > 0
      ORDER BY a.fecha_compra ASC, j.fecha_creacion ASC
    `;
    const { rows } = await this.db.query(query, [ubicacionId, tipoPalta, categoria]);
    return rows.map(
      (row) =>
        new Jaba({
          jabaId: row.jaba_id,
          acopioId: row.acopio_id,
          ubicacionId: row.ubicacion_id,
          tipoPalta: row.tipo_palta as TipoPalta,
          categoria: row.categoria,
          codigoColor: row.codigo_color,
          cantidadJabas: parseInt(row.cantidad_jabas, 10),
          pesoBruto: parseFloat(row.peso_bruto),
          pesoActual: parseFloat(row.peso_actual),
          estado: row.estado as EstadoJaba,
          fechaCreacion: new Date(row.fecha_creacion),
          fechaActualizacion: new Date(row.fecha_actualizacion),
        })
    );
  }

  async descontarPeso(jabaId: string, kilosADescontar: number): Promise<void> {
    const query = `
      UPDATE jabas
      SET peso_actual = GREATEST(0, COALESCE(peso_actual, peso_bruto) - $1),
          estado = CASE 
            WHEN GREATEST(0, COALESCE(peso_actual, peso_bruto) - $1) = 0 THEN 'Convertida_Kilos'
            ELSE estado 
          END,
          fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE jaba_id = $2
    `;
    await this.db.query(query, [kilosADescontar, jabaId]);
  }
}
