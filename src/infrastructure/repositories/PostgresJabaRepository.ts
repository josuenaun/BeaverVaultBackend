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
        INSERT INTO jabas (acopio_id, ubicacion_id, tipo_palta, categoria, codigo_color, cantidad_jabas, peso_bruto, estado)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING jaba_id, acopio_id, ubicacion_id, tipo_palta, categoria, codigo_color, cantidad_jabas, peso_bruto, estado, fecha_creacion, fecha_actualizacion
      `;
      const values = [
        jaba.acopioId,
        jaba.ubicacionId,
        jaba.tipoPalta,
        jaba.categoria,
        jaba.codigoColor,
        jaba.cantidadJabas,
        jaba.pesoBruto,
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
      SELECT jaba_id, acopio_id, ubicacion_id, tipo_palta, categoria, codigo_color, cantidad_jabas, peso_bruto, estado, fecha_creacion, fecha_actualizacion
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
      estado: row.estado as EstadoJaba,
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion),
    });
  }

  async findByAcopioId(acopioId: string): Promise<Jaba[]> {
    const query = `
      SELECT jaba_id, acopio_id, ubicacion_id, tipo_palta, categoria, codigo_color, cantidad_jabas, peso_bruto, estado, fecha_creacion, fecha_actualizacion
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
          estado: row.estado as EstadoJaba,
          fechaCreacion: new Date(row.fecha_creacion),
          fechaActualizacion: new Date(row.fecha_actualizacion),
        })
    );
  }

  async findByUbicacionId(ubicacionId: string): Promise<Jaba[]> {
    const query = `
      SELECT jaba_id, acopio_id, ubicacion_id, tipo_palta, categoria, codigo_color, cantidad_jabas, peso_bruto, estado, fecha_creacion, fecha_actualizacion
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
}
