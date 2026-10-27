// Capa 4: Infrastructure - src/infrastructure/docs/openapi.ts

export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Sistema Mayorista JOSBECORSA - API',
    version: '1.0.0',
    description: 'Gestión comercial y operativa mayorista de palta con Clean Architecture.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor Local',
    },
  ],
  security: [
    {
      bearerAuth: [],
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtenido de /api/auth/login',
      },
    },
  },
  tags: [
    { name: 'Autenticación', description: 'Acceso y tokens' },
    { name: 'SuperAdmins', description: 'Administradores globales' },
    { name: 'Roles', description: 'Gestión de roles' },
    { name: 'Empresas', description: 'Tenants' },
    { name: 'Ubicaciones', description: 'Puntos físicos' },
    { name: 'Usuarios', description: 'Personal operativo' },
    { name: 'Acopio (Provincia)', description: 'Etapa 1' },
    { name: 'Transporte', description: 'Etapa 2' },
    { name: 'Lima (Distribución)', description: 'Etapa 3' },
    { name: 'Ventas y Kilos', description: 'Etapa 4' },
    { name: 'Fiados', description: 'Créditos y deudas' },
  ],
  paths: {
    '/health': {
      get: {
        security: [],
        tags: ['Autenticación'],
        summary: 'Healthcheck',
        responses: {
          '200': { description: 'OK' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        security: [],
        tags: ['Autenticación'],
        summary: 'Login SuperAdmin',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['correo', 'contrasena'],
                properties: {
                  correo: { type: 'string', example: 'josue@josbecorsa.com' },
                  contrasena: { type: 'string', example: 'Admin123*' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Token JWT generado' },
          '401': { description: 'Credenciales inválidas' },
        },
      },
    },
    '/api/super-admins': {
      post: {
        tags: ['SuperAdmins'],
        summary: 'Crear superadmin',
        description: 'Crea un nuevo super administrador. La contraseña se hashea automáticamente en base de datos.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre', 'correo', 'contrasena'],
                properties: {
                  nombre: { type: 'string', example: 'Admin Soporte' },
                  correo: { type: 'string', format: 'email', example: 'soporte@josbecorsa.com' },
                  contrasena: { type: 'string', format: 'password', example: 'clave123*' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Super Administrador creado' },
        },
      },
      get: {
        tags: ['SuperAdmins'],
        summary: 'Listar superadmins',
        responses: {
          '200': { description: 'Lista de super administradores' },
        },
      },
    },
    '/api/super-admins/{superAdminId}': {
      delete: {
        tags: ['SuperAdmins'],
        summary: 'Eliminar superadmin',
        parameters: [
          { name: 'superAdminId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Super Administrador eliminado' },
        },
      },
    },
    '/api/roles': {
      post: {
        tags: ['Roles'],
        summary: 'Crear rol',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre'],
                properties: {
                  nombre: { type: 'string', example: 'Administrador' },
                  descripcion: { type: 'string', example: 'Acceso total a gestión' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Rol creado' },
        },
      },
      get: {
        tags: ['Roles'],
        summary: 'Listar roles',
        responses: {
          '200': { description: 'Lista de roles' },
        },
      },
    },
    '/api/roles/{rolId}': {
      delete: {
        tags: ['Roles'],
        summary: 'Eliminar rol',
        parameters: [
          { name: 'rolId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Rol eliminado' },
        },
      },
    },
    '/api/empresas': {
      post: {
        tags: ['Empresas'],
        summary: 'Crear empresa',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre'],
                properties: {
                  nombre: { type: 'string', example: 'JOSBECORSA S.A.C.' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Empresa creada' },
        },
      },
      get: {
        tags: ['Empresas'],
        summary: 'Listar empresas',
        responses: {
          '200': { description: 'Lista de empresas' },
        },
      },
    },
    '/api/empresas/{empresaId}': {
      delete: {
        tags: ['Empresas'],
        summary: 'Eliminar empresa',
        parameters: [
          { name: 'empresaId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Empresa eliminada' },
        },
      },
    },
    '/api/ubicaciones': {
      post: {
        tags: ['Ubicaciones'],
        summary: 'Crear ubicación',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['empresaId', 'nombre', 'tipo'],
                properties: {
                  empresaId: { type: 'string', format: 'uuid' },
                  nombre: { type: 'string', example: 'Puesto Principal Mercado Mayorista' },
                  tipo: {
                    type: 'string',
                    enum: ['Acopio', 'Camara Frio', 'Puesto Principal', 'Puesto Contingencia'],
                    example: 'Puesto Principal',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Ubicación creada' },
        },
      },
    },
    '/api/empresas/{empresaId}/ubicaciones': {
      get: {
        tags: ['Ubicaciones'],
        summary: 'Listar ubicaciones',
        parameters: [
          { name: 'empresaId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Lista de ubicaciones' },
        },
      },
    },
    '/api/ubicaciones/{ubicacionId}': {
      delete: {
        tags: ['Ubicaciones'],
        summary: 'Eliminar ubicación',
        parameters: [
          { name: 'ubicacionId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Ubicación eliminada' },
        },
      },
    },
    '/api/usuarios': {
      post: {
        tags: ['Usuarios'],
        summary: 'Crear usuario',
        description: 'Ingresa una contraseña normal (ej: juan123) y el backend la hashea automáticamente antes de guardarla en PostgreSQL.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['empresaId', 'rolId', 'nombre', 'correo', 'contrasena'],
                properties: {
                  empresaId: { type: 'string', format: 'uuid' },
                  rolId: { type: 'string', format: 'uuid' },
                  nombre: { type: 'string', example: 'Juan Pérez' },
                  correo: { type: 'string', format: 'email', example: 'juan.perez@josbecorsa.com' },
                  contrasena: { type: 'string', format: 'password', example: 'juan123' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Usuario creado con contraseña hasheada' },
        },
      },
    },
    '/api/empresas/{empresaId}/usuarios': {
      get: {
        tags: ['Usuarios'],
        summary: 'Listar usuarios',
        parameters: [
          { name: 'empresaId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Lista de usuarios' },
        },
      },
    },
    '/api/usuarios/{usuarioId}': {
      delete: {
        tags: ['Usuarios'],
        summary: 'Eliminar usuario',
        parameters: [
          { name: 'usuarioId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Usuario eliminado' },
        },
      },
    },
    '/api/acopios': {
      post: {
        tags: ['Acopio (Provincia)'],
        summary: 'Crear acopio',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['empresaId', 'encargadoLote', 'fechaCompra', 'origen', 'creadoPorUsuarioId', 'jabas'],
                properties: {
                  empresaId: { type: 'string', format: 'uuid' },
                  encargadoLote: { type: 'string', example: 'Carlos Mendoza' },
                  fechaCompra: { type: 'string', format: 'date', example: '2026-10-26' },
                  origen: { type: 'string', example: 'Huaral' },
                  creadoPorUsuarioId: { type: 'string', format: 'uuid' },
                  jabas: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['tipoPalta', 'categoria', 'codigoColor', 'cantidadJabas', 'pesoBruto'],
                      properties: {
                        tipoPalta: { type: 'string', enum: ['Fuerte', 'Hass', 'Naval', 'Villacampa'], example: 'Fuerte' },
                        categoria: { type: 'string', example: '1era' },
                        codigoColor: { type: 'string', example: 'ROJO-01' },
                        cantidadJabas: { type: 'integer', example: 50 },
                        pesoBruto: { type: 'number', example: 1000.5 },
                        ubicacionId: { type: 'string', format: 'uuid', nullable: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Acopio registrado' },
        },
      },
    },
    '/api/empresas/{empresaId}/acopios': {
      get: {
        tags: ['Acopio (Provincia)'],
        summary: 'Listar acopios',
        parameters: [
          { name: 'empresaId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Lista de acopios' },
        },
      },
    },
    '/api/acopios/{acopioId}': {
      delete: {
        tags: ['Acopio (Provincia)'],
        summary: 'Eliminar acopio',
        parameters: [
          { name: 'acopioId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Acopio eliminado' },
        },
      },
    },
    '/api/acopios/{acopioId}/gastos/seleccionador': {
      post: {
        tags: ['Acopio (Provincia)'],
        summary: 'Pagar seleccionador',
        parameters: [
          { name: 'acopioId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombreReceptor', 'cantidadJabas', 'tarifaPorJaba', 'usuarioRegistroId'],
                properties: {
                  nombreReceptor: { type: 'string', example: 'Roberto Sánchez' },
                  cantidadJabas: { type: 'integer', example: 50 },
                  tarifaPorJaba: { type: 'number', example: 1.5 },
                  usuarioRegistroId: { type: 'string', format: 'uuid' },
                  concepto: { type: 'string', example: 'Clasificación de lote' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Gasto registrado' },
        },
      },
    },
    '/api/acopios/{acopioId}/transporte': {
      post: {
        tags: ['Transporte'],
        summary: 'Asignar transporte',
        parameters: [
          { name: 'acopioId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fleteCosto', 'nombreReceptor', 'usuarioRegistroId'],
                properties: {
                  fleteCosto: { type: 'number', example: 450.0 },
                  nombreReceptor: { type: 'string', example: 'Transportes Sur' },
                  usuarioRegistroId: { type: 'string', format: 'uuid' },
                  concepto: { type: 'string', example: 'Flete Huaral a Lima' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Transporte asignado' },
        },
      },
    },
    '/api/acopios/{acopioId}/gastos/descarga': {
      post: {
        tags: ['Lima (Distribución)'],
        summary: 'Pagar descarga',
        parameters: [
          { name: 'acopioId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['tipoGasto', 'nombreReceptor', 'cantidadJabas', 'tarifaPorJaba', 'usuarioRegistroId'],
                properties: {
                  tipoGasto: { type: 'string', enum: ['Estibador', 'Cargador'], example: 'Estibador' },
                  nombreReceptor: { type: 'string', example: 'Cuadrilla Central' },
                  cantidadJabas: { type: 'integer', example: 50 },
                  tarifaPorJaba: { type: 'number', example: 0.8 },
                  usuarioRegistroId: { type: 'string', format: 'uuid' },
                  concepto: { type: 'string', example: 'Descarga en puesto' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Descarga liquidada' },
        },
      },
    },
    '/api/jabas/{jabaId}/ubicacion': {
      patch: {
        tags: ['Lima (Distribución)'],
        summary: 'Mover jaba',
        parameters: [
          { name: 'jabaId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['ubicacionId'],
                properties: {
                  ubicacionId: { type: 'string', format: 'uuid' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Jaba movida' },
        },
      },
    },
    '/api/jabas/{jabaId}/transformar-kilos': {
      post: {
        tags: ['Ventas y Kilos'],
        summary: 'Transformar a kilos',
        description: 'Convierte jabas a kilos disponibles sin merma.',
        parameters: [
          { name: 'jabaId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['ubicacionId'],
                properties: {
                  ubicacionId: { type: 'string', format: 'uuid' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Stock en kilos actualizado' },
        },
      },
    },
    '/api/ubicaciones/{ubicacionId}/inventario-kilos': {
      get: {
        tags: ['Ventas y Kilos'],
        summary: 'Stock en kilos',
        parameters: [
          { name: 'ubicacionId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Kilos disponibles' },
        },
      },
    },
    '/api/ventas': {
      post: {
        tags: ['Ventas y Kilos'],
        summary: 'Registrar venta',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['empresaId', 'vendedorUsuarioId', 'ubicacionId', 'detalles'],
                properties: {
                  empresaId: { type: 'string', format: 'uuid' },
                  vendedorUsuarioId: { type: 'string', format: 'uuid' },
                  ubicacionId: { type: 'string', format: 'uuid' },
                  detalles: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['tipoPalta', 'categoria', 'kilosVendidos', 'precioUnitario'],
                      properties: {
                        tipoPalta: { type: 'string', enum: ['Fuerte', 'Hass', 'Naval', 'Villacampa'], example: 'Fuerte' },
                        categoria: { type: 'string', example: '1era' },
                        kilosVendidos: { type: 'number', example: 120.5 },
                        precioUnitario: { type: 'number', example: 7.5 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Venta registrada' },
        },
      },
    },
    '/api/empresas/{empresaId}/ventas': {
      get: {
        tags: ['Ventas y Kilos'],
        summary: 'Listar ventas',
        parameters: [
          { name: 'empresaId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Historial de ventas' },
        },
      },
    },
    '/api/fiados': {
      post: {
        tags: ['Fiados'],
        summary: 'Crear fiado',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['empresaId', 'nombreDeudor', 'motivoDeuda', 'montoDeuda', 'fechaAdvertencia', 'creadoPorUsuarioId'],
                properties: {
                  empresaId: { type: 'string', format: 'uuid' },
                  nombreDeudor: { type: 'string', example: 'Frutería Doña Rosa' },
                  motivoDeuda: { type: 'string', example: '10 jabas de palta fuerte' },
                  montoDeuda: { type: 'number', example: 850.0 },
                  fechaAdvertencia: { type: 'string', format: 'date', example: '2026-11-05' },
                  creadoPorUsuarioId: { type: 'string', format: 'uuid' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Fiado registrado' },
        },
      },
    },
    '/api/empresas/{empresaId}/fiados': {
      get: {
        tags: ['Fiados'],
        summary: 'Listar fiados',
        parameters: [
          { name: 'empresaId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Lista de fiados' },
        },
      },
    },
    '/api/fiados/{fiadoId}': {
      delete: {
        tags: ['Fiados'],
        summary: 'Eliminar fiado',
        parameters: [
          { name: 'fiadoId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Fiado eliminado' },
        },
      },
    },
  },
};
