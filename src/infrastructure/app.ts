// Capa 4: Infrastructure - src/infrastructure/app.ts

import express, { Express } from 'express';
import { Pool } from 'pg';
import { apiReference } from '@scalar/express-api-reference';
import { createApiRouter } from '../interfaces/routes/api.routes.js';
import { errorHandler } from '../interfaces/middlewares/errorHandler.js';
import { openApiDocument } from './docs/openapi.js';

export function createApp(db: Pool): Express {
  const app = express();

  app.use(express.json());

  // Servir especificación OpenAPI en formato JSON
  app.get('/openapi.json', (_req, res) => {
    res.status(200).json(openApiDocument);
  });

  // Documentación Interactiva Scalar API Reference
  app.use(
    '/docs',
    apiReference({
      theme: 'purple',
      layout: 'modern',
      spec: {
        content: openApiDocument,
      },
    })
  );

  // Ruta raíz de bienvenida con enlace a Scalar
  app.get('/', (_req, res) => {
    res.status(200).json({
      success: true,
      service: 'BeaverVault Backend - Sistema Mayorista JOSBECORSA',
      version: '1.0.0',
      status: 'online',
      documentacion_scalar: 'http://localhost:3000/docs',
      openapi_spec: 'http://localhost:3000/openapi.json',
      rutas_disponibles: {
        scalar_docs: '/docs',
        health: '/health',
        api: '/api',
        empresas: '/api/empresas',
        roles: '/api/roles',
      },
    });
  });

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'BeaverVault Backend JOSBECORSA' });
  });

  // API router
  app.use('/api', createApiRouter(db));

  // Error handling middleware
  app.use(errorHandler);

  return app;
}
