// Capa 4: Infrastructure - src/infrastructure/server.ts

import { createApp } from './app.js';
import { pool } from './database/pool.js';
import { config } from './config/env.js';

const app = createApp(pool);

app.listen(config.port, () => {
  console.log(`[JOSBECORSA Backend] Servidor ejecutándose en http://localhost:${config.port}`);
  console.log(`[JOSBECORSA Backend] Documentación interactiva Scalar: http://localhost:${config.port}/docs`);
  console.log(`[JOSBECORSA Backend] Especificación OpenAPI JSON: http://localhost:${config.port}/openapi.json`);
});
