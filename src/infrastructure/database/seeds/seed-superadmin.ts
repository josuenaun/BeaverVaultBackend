// Capa 4: Infrastructure - src/infrastructure/database/seeds/seed-superadmin.ts

import bcrypt from 'bcryptjs';
import { pool } from '../pool.js';

async function seedSuperAdmin(): Promise<void> {
  console.log('--- Creando Super Administrador Inicial ---');

  const nombre = 'Josue';
  const correo = 'josue@josbecorsa.com';
  const passwordPlano = process.env.ADMIN_INITIAL_PASSWORD || 'Admin123*';

  try {
    const salt = await bcrypt.genSalt(10);
    const contrasenaHash = await bcrypt.hash(passwordPlano, salt);

    const query = `
      INSERT INTO super_administradores (nombre, correo, contrasena_hash, activo)
      VALUES ($1, $2, $3, TRUE)
      ON CONFLICT (correo) 
      DO UPDATE SET 
        nombre = EXCLUDED.nombre,
        contrasena_hash = EXCLUDED.contrasena_hash,
        activo = TRUE,
        fecha_actualizacion = CURRENT_TIMESTAMP
      RETURNING super_admin_id, nombre, correo, activo;
    `;

    const { rows } = await pool.query(query, [nombre, correo, contrasenaHash]);
    const admin = rows[0];

    console.log('\n✅ ¡Super Administrador configurado con éxito en PostgreSQL!');
    console.log(`ID: ${admin.super_admin_id}`);
    console.log(`Nombre: ${admin.nombre}`);
    console.log(`Correo: ${admin.correo}`);
    console.log(`Contraseña inicial: ${passwordPlano}`);
    console.log(`Estado: ${admin.activo ? 'Activo' : 'Inactivo'}`);
    console.log('\nYa puedes usar estas credenciales para iniciar sesión en:');
    console.log('POST http://localhost:3000/api/auth/login');
    console.log('O directamente desde Scalar en http://localhost:3000/docs');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error al crear el Super Administrador:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedSuperAdmin();
