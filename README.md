# 🥑 JOSBECORSA — BeaverVault Backend

> **Sistema de Gestión Mayorista de Acopio, Transporte, Distribución y Venta de Paltas**  
> Desarrollado bajo **Clean Architecture Estricta** en Node.js, Express, TypeScript y PostgreSQL.

---

## 📋 1. Contexto del Negocio

**JOSBECORSA** es una empresa mayorista comercializadora de palta en el mercado peruano. Este backend gestiona la trazabilidad operativa y financiera en **4 etapas críticas**:

```
[ Etapa 1: Provincia ] ──► [ Etapa 2: Transporte ] ──► [ Etapa 3: Lima ] ──► [ Etapa 4: Ventas ]
   Acopio & Jabas              Flete en Ruta              Descarga & Cámaras       Kilos (¡SIN MERMA!)
```

### 🥑 Las 4 Etapas Operativas

1. **Etapa 1: Provincia (Acopio):**
   - Compra de fruta por lotes en zonas de acopio (Chanchamayo, Huaral, etc.).
   - Clasificación en jabas por color, tipo y categoría según la **Matriz Estricta**:
     - **Fuerte:** 1era, 2da, 3era, 4ta, Semimanchada, Manchada.
     - **Hass:** 1era, 2da, 3era, 4ta, Manchada.
     - **Naval:** Limpia, Manchada.
     - **Villacampa:** 1era, Manchada.
   - Liquidación a seleccionadores de campo por jaba procesada.

2. **Etapa 2: Transporte:**
   - Contratación y liquidación de fletes hacia Lima.
   - Registro de transportista, placa y costo real de flete.

3. **Etapa 3: Lima (Llegada y Distribución):**
   - Recepción en el Mercado Mayorista.
   - Liquidación de cuadrilla de descarga (estibadores y cargadores por bulto).
   - Movimiento físico a ubicaciones: `Acopio`, `Camara Frio`, `Puesto Principal` o `Puesto Contingencia`.

4. **Etapa 4: Ventas y Stock en Kilos:**
   - **Transformación de Jabas a Kilos:** Proceso transaccional donde las jabas pasan a estado `Convertida_Kilos`.
   - ⚠️ **REGLA DE ORO:** **¡NO HAY MERMA!** El 100% del peso bruto de la jaba se convierte en kilogramos netos disponibles en la tabla `inventarios_kilos`.
   - **Ventas en Puesto:** Facturación y despacho estrictamente por kilogramos.
   - **Fiados:** Control de cuentas corrientes y saldos pendientes por cobrar a clientes.

---

## 🏛️ 2. Arquitectura de Software (Clean Architecture)

El backend implementa Clean Architecture desacoplada en 4 capas concéntricas con regla de dependencia estricta:

```
src/
├── domain/                  # Capa 1: Reglas de Negocio Puras (Entidades, Interfaces y Constantes)
│   ├── constants/           # Matriz estricta de clasificación de palta y enums
│   ├── entities/            # 12 Entidades del dominio
│   ├── errors/              # DomainError, ValidationError, BusinessRuleError
│   └── repositories/        # Contratos de interfaces (IRepository)
│
├── application/             # Capa 2: Casos de Uso y DTOs (Orquestación del Negocio)
│   ├── dtos/                # Transferencia de datos tipados de entrada y salida
│   └── use-cases/           # Acopio, Transporte, Lima, Ventas, Auth y Configuración
│
├── interfaces/              # Capa 3: Adaptadores de Entrada (HTTP / Controladores)
│   ├── controllers/         # Controladores Express (parsean peticiones y manejan respuestas)
│   ├── middlewares/         # authMiddleware (Bearer JWT) y errorHandler global
│   └── routes/              # api.routes.ts (Enrutamiento unificado bajo /api)
│
└── infrastructure/          # Capa 4: Adaptadores de Salida y Frameworks
    ├── config/              # env.ts (Validación y tipado de variables de entorno)
    ├── database/            # pool.ts (PostgreSQL) y schema.sql (12 tablas con UUIDs)
    ├── docs/                # openapi.ts (Especificación OpenAPI 3.0 para Scalar)
    ├── repositories/        # Implementaciones concretas de repositorios con pg
    ├── app.ts               # Configuración Express + Scalar UI (/docs)
    └── server.ts            # Arranque del servidor HTTP
```

---

## 🔒 3. Seguridad y Autenticación

- **Contraseñas Cifradas:** El usuario envía su contraseña normal (`juan123`), y el caso de uso la encripta con `bcryptjs` (10 rondas de salt) antes de persistirla en `contrasena_hash`. Los hashes nunca se exponen en las respuestas JSON.
- **Tokens JWT:** Login mediante `POST /api/auth/login` genera un Bearer Token con 8 horas de vigencia firmado con `JWT_SECRET`.
- **Rutas Protegidas:** Toda la API (`/api/*`) exige la cabecera:
  ```http
  Authorization: Bearer <TOKEN_JWT>
  ```
- **Aislamiento de Secretos:** `.gitignore` previene la filtración de credenciales reales del archivo `.env`.

---

## 🗄️ 4. Esquema de Base de Datos (PostgreSQL)

12 tablas relacionales normalizadas con identificadores UUID v4 (`uuid-ossp`):

| Tabla | Descripción |
| :--- | :--- |
| `super_administradores` | Usuarios administradores globales de la plataforma |
| `empresas` | Tenants o razones sociales de JOSBECORSA |
| `roles` | Perfiles de permisos (`Administrador`, `Vendedor`, `Acopiador`, etc.) |
| `usuarios` | Personal operativo asignado a una empresa y rol |
| `ubicaciones` | Almacenes físicos (`Acopio`, `Camara Frio`, `Puesto Principal`, `Puesto Contingencia`) |
| `acopios` | Lotes de compra de fruta en provincia |
| `jabas` | Bultos individuales con código de color, tipo, calidad y peso bruto |
| `gastos_operativos` | Egresos de operación (`Seleccionador`, `Transporte`, `Estibador`, `Cargador`) |
| `inventarios_kilos` | Stock neto disponible en puesto comercial por tipo y categoría |
| `ventas` | Cabeceras de comprobantes comerciales por cliente |
| `detalles_ventas` | Detalle de kilogramos vendidos, precio unitario y subtotales |
| `fiados` | Créditos otorgados y saldos pendientes por cobrar |

---

## 🚀 5. Puesta en Marcha

### Requisitos Previos
- **Node.js:** v20+ o v22+
- **PostgreSQL:** v15+ o v16+
- **Python:** 3.10+ (opcional, para regenerar el PDF del manual)

### Instalación y Configuración

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno (`.env`):**
   Crear un archivo `.env` en la raíz con tus credenciales:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=tu_contrasena_de_postgres
   DB_NAME=beavervault_db
   JWT_SECRET=tu_clave_secreta_jwt_super_segura
   ```

3. **Verificar conexión a base de datos:**
   ```bash
   npm run test:db
   ```

4. **Crear Super Administrador inicial:**
   ```bash
   npm run seed:admin
   ```
   *(Crea el usuario `josue@josbecorsa.com` con clave inicial `Admin123*`)*

5. **Iniciar en modo desarrollo:**
   ```bash
   npm run dev
   ```

6. **Compilar para producción:**
   ```bash
   npm run build
   npm start
   ```

---

## 📖 6. Documentación de la API

Con el servidor corriendo (`npm run dev`), ingresa en tu navegador a:

- **Interfaz Interactiva Scalar:** [http://localhost:3000/docs](http://localhost:3000/docs) *(Permite probar peticiones con tu token JWT)*
- **Especificación OpenAPI JSON:** [http://localhost:3000/openapi.json](http://localhost:3000/openapi.json)
- **Health Check:** [http://localhost:3000/health](http://localhost:3000/health)

