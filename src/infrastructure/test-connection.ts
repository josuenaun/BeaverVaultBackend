// Capa 4: Infrastructure - src/infrastructure/test-connection.ts

import { pool } from './database/pool.js';
import { config } from './config/env.js';

async function testConnection(): Promise<void> {
  console.log('--- Probando Conexión a PostgreSQL ---');
  console.log(`Host: ${config.database.host}`);
  console.log(`Puerto: ${config.database.port}`);
  console.log(`Usuario: ${config.database.user}`);
  console.log(`Base de Datos: ${config.database.database}`);
  console.log('Intentando conectar...');

  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW() AS current_time, current_database() AS db_name, version() AS pg_version;');
    client.release();

    console.log('\n✅ ¡Conexión exitosa a la base de datos PostgreSQL!');
    console.log(`Base conectada: ${res.rows[0].db_name}`);
    console.log(`Hora del servidor BD: ${res.rows[0].current_time}`);
    console.log(`Versión: ${res.rows[0].pg_version.split(' on ')[0]}`);

    // Verificar si las tablas del schema existen
    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log(`\nTablas encontradas en 'public' (${tablesRes.rows.length}):`);
    if (tablesRes.rows.length === 0) {
      console.log('⚠️ No se encontraron tablas aún. Recuerda ejecutar schema.sql.');
    } else {
      tablesRes.rows.forEach((row: { table_name: string }, i: number) => {
        console.log(`  ${i + 1}. ${row.table_name}`);
      });
    }

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error al conectar a PostgreSQL:');
    console.error(`Mensaje: ${error.message}`);
    if (error.code) console.error(`Código de error: ${error.code}`);
    console.error('\nVerifica que:');
    console.error('1. El servicio de PostgreSQL esté iniciado.');
    console.error('2. Exista el archivo .env con las credenciales correctas.');
    console.error('3. La base de datos especificada exista en tu Postgres.');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
