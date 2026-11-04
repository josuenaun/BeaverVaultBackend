// Capa 3: Interfaces - src/interfaces/routes/api.routes.ts

import { Router } from 'express';
import { Pool } from 'pg';

// Repositorios de infraestructura (Capa 4)
import { PostgresAcopioRepository } from '../../infrastructure/repositories/PostgresAcopioRepository.js';
import { PostgresJabaRepository } from '../../infrastructure/repositories/PostgresJabaRepository.js';
import { PostgresGastoOperativoRepository } from '../../infrastructure/repositories/PostgresGastoOperativoRepository.js';
import { PostgresInventarioRepository } from '../../infrastructure/repositories/PostgresInventarioRepository.js';
import { PostgresVentaRepository } from '../../infrastructure/repositories/PostgresVentaRepository.js';
import { PostgresFiadoRepository } from '../../infrastructure/repositories/PostgresFiadoRepository.js';
import { PostgresEmpresaRepository } from '../../infrastructure/repositories/PostgresEmpresaRepository.js';
import { PostgresUbicacionRepository } from '../../infrastructure/repositories/PostgresUbicacionRepository.js';
import { PostgresUsuarioRepository } from '../../infrastructure/repositories/PostgresUsuarioRepository.js';
import { PostgresRolRepository } from '../../infrastructure/repositories/PostgresRolRepository.js';
import { PostgresSuperAdministradorRepository } from '../../infrastructure/repositories/PostgresSuperAdministradorRepository.js';

// Casos de uso de aplicación (Capa 2)
import { RegistrarAcopioUseCase } from '../../application/use-cases/acopio/RegistrarAcopioUseCase.js';
import { RegistrarGastoSeleccionadorUseCase } from '../../application/use-cases/acopio/RegistrarGastoSeleccionadorUseCase.js';
import { RegistrarTransporteUseCase } from '../../application/use-cases/transporte/RegistrarTransporteUseCase.js';
import { RegistrarDescargaLimaUseCase } from '../../application/use-cases/lima/RegistrarDescargaLimaUseCase.js';
import { DistribuirUbicacionUseCase } from '../../application/use-cases/lima/DistribuirUbicacionUseCase.js';
import { TransformarJabasAKilosUseCase } from '../../application/use-cases/ventas/TransformarJabasAKilosUseCase.js';
import { RegistrarVentaKilosUseCase } from '../../application/use-cases/ventas/RegistrarVentaKilosUseCase.js';
import { RegistrarFiadoUseCase } from '../../application/use-cases/fiados/RegistrarFiadoUseCase.js';
import { RegistrarRolUseCase } from '../../application/use-cases/configuracion/RegistrarRolUseCase.js';
import { RegistrarEmpresaUseCase } from '../../application/use-cases/configuracion/RegistrarEmpresaUseCase.js';
import { RegistrarUbicacionUseCase } from '../../application/use-cases/configuracion/RegistrarUbicacionUseCase.js';
import { RegistrarUsuarioUseCase } from '../../application/use-cases/configuracion/RegistrarUsuarioUseCase.js';
import { RegistrarSuperAdminUseCase } from '../../application/use-cases/configuracion/RegistrarSuperAdminUseCase.js';
import { LoginSuperAdminUseCase } from '../../application/use-cases/auth/LoginSuperAdminUseCase.js';

// Controladores y Middlewares (Capa 3)
import { AcopioController } from '../controllers/AcopioController.js';
import { TransporteController } from '../controllers/TransporteController.js';
import { DistribucionController } from '../controllers/DistribucionController.js';
import { VentaController } from '../controllers/VentaController.js';
import { ConfiguracionController } from '../controllers/ConfiguracionController.js';
import { AuthController } from '../controllers/AuthController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export function createApiRouter(db: Pool): Router {
  const router = Router();

  // 1. Instanciación de Repositorios (Capa 4)
  const acopioRepo = new PostgresAcopioRepository(db);
  const jabaRepo = new PostgresJabaRepository(db);
  const gastoRepo = new PostgresGastoOperativoRepository(db);
  const inventarioRepo = new PostgresInventarioRepository(db);
  const ventaRepo = new PostgresVentaRepository(db);
  const fiadoRepo = new PostgresFiadoRepository(db);
  const empresaRepo = new PostgresEmpresaRepository(db);
  const ubicacionRepo = new PostgresUbicacionRepository(db);
  const usuarioRepo = new PostgresUsuarioRepository(db);
  const rolRepo = new PostgresRolRepository(db);
  const superAdminRepo = new PostgresSuperAdministradorRepository(db);

  // 2. Instanciación de Casos de Uso (Capa 2)
  const registrarAcopioUseCase = new RegistrarAcopioUseCase(acopioRepo, jabaRepo);
  const registrarGastoSeleccionadorUseCase = new RegistrarGastoSeleccionadorUseCase(gastoRepo, acopioRepo);
  const registrarTransporteUseCase = new RegistrarTransporteUseCase(acopioRepo, jabaRepo, gastoRepo);
  const registrarDescargaLimaUseCase = new RegistrarDescargaLimaUseCase(gastoRepo, acopioRepo);
  const distribuirUbicacionUseCase = new DistribuirUbicacionUseCase(jabaRepo, acopioRepo, inventarioRepo);
  const transformarJabasAKilosUseCase = new TransformarJabasAKilosUseCase(jabaRepo, inventarioRepo);
  const registrarVentaKilosUseCase = new RegistrarVentaKilosUseCase(ventaRepo, inventarioRepo);
  const registrarFiadoUseCase = new RegistrarFiadoUseCase(fiadoRepo);
  const registrarRolUseCase = new RegistrarRolUseCase(rolRepo);
  const registrarEmpresaUseCase = new RegistrarEmpresaUseCase(empresaRepo);
  const registrarUbicacionUseCase = new RegistrarUbicacionUseCase(ubicacionRepo, empresaRepo);
  const registrarUsuarioUseCase = new RegistrarUsuarioUseCase(usuarioRepo, empresaRepo, rolRepo);
  const registrarSuperAdminUseCase = new RegistrarSuperAdminUseCase(superAdminRepo);
  const loginSuperAdminUseCase = new LoginSuperAdminUseCase(superAdminRepo, usuarioRepo);

  // 3. Instanciación de Controladores (Capa 3)
  const acopioController = new AcopioController(registrarAcopioUseCase, registrarGastoSeleccionadorUseCase, acopioRepo, gastoRepo);
  const transporteController = new TransporteController(registrarTransporteUseCase);
  const distribucionController = new DistribucionController(registrarDescargaLimaUseCase, distribuirUbicacionUseCase, jabaRepo);
  const ventaController = new VentaController(
    transformarJabasAKilosUseCase,
    registrarVentaKilosUseCase,
    registrarFiadoUseCase,
    inventarioRepo,
    ventaRepo,
    fiadoRepo
  );
  const configuracionController = new ConfiguracionController(
    registrarRolUseCase,
    registrarEmpresaUseCase,
    registrarUbicacionUseCase,
    registrarUsuarioUseCase,
    registrarSuperAdminUseCase,
    empresaRepo,
    ubicacionRepo,
    usuarioRepo,
    rolRepo,
    superAdminRepo
  );
  const authController = new AuthController(loginSuperAdminUseCase);

  // --- RUTA PÚBLICA: Autenticación ---
  router.post('/auth/login', (req, res, next) => authController.loginSuperAdmin(req, res, next));

  // --- RUTAS PROTEGIDAS (Requieren Bearer Token JWT) ---
  router.use(authMiddleware);

  // 0. Super Administradores
  router.post('/super-admins', (req, res, next) => configuracionController.crearSuperAdmin(req, res, next));
  router.get('/super-admins', (req, res, next) => configuracionController.listarSuperAdmins(req, res, next));
  router.delete('/super-admins/:superAdminId', (req, res, next) => configuracionController.eliminarSuperAdmin(req, res, next));

  // 1. Roles
  router.post('/roles', (req, res, next) => configuracionController.crearRol(req, res, next));
  router.get('/roles', (req, res, next) => configuracionController.listarRoles(req, res, next));
  router.delete('/roles/:rolId', (req, res, next) => configuracionController.eliminarRol(req, res, next));

  // 2. Empresas (Tenants)
  router.post('/empresas', (req, res, next) => configuracionController.crearEmpresa(req, res, next));
  router.get('/empresas', (req, res, next) => configuracionController.listarEmpresas(req, res, next));
  router.delete('/empresas/:empresaId', (req, res, next) => configuracionController.eliminarEmpresa(req, res, next));

  // 3. Ubicaciones
  router.post('/ubicaciones', (req, res, next) => configuracionController.crearUbicacion(req, res, next));
  router.get('/empresas/:empresaId/ubicaciones', (req, res, next) => configuracionController.listarUbicacionesPorEmpresa(req, res, next));
  router.delete('/ubicaciones/:ubicacionId', (req, res, next) => configuracionController.eliminarUbicacion(req, res, next));

  // 4. Usuarios
  router.post('/usuarios', (req, res, next) => configuracionController.crearUsuario(req, res, next));
  router.get('/empresas/:empresaId/usuarios', (req, res, next) => configuracionController.listarUsuariosPorEmpresa(req, res, next));
  router.delete('/usuarios/:usuarioId', (req, res, next) => configuracionController.eliminarUsuario(req, res, next));

  // 5. Etapa 1: Provincia (Acopio)
  router.post('/acopios', (req, res, next) => acopioController.crearAcopio(req, res, next));
  router.get('/empresas/:empresaId/acopios', (req, res, next) => acopioController.listarAcopiosPorEmpresa(req, res, next));
  router.delete('/acopios/:acopioId', (req, res, next) => acopioController.eliminarAcopio(req, res, next));
  router.post('/acopios/:acopioId/gastos/seleccionador', (req, res, next) => acopioController.registrarPagoSeleccionador(req, res, next));

  // 5.1 Gastos Operativos (CRUD unificado: Seleccionador, Flete, Descarga)
  router.get('/empresas/:empresaId/gastos', (req, res, next) => acopioController.listarGastosPorEmpresa(req, res, next));
  router.get('/acopios/:acopioId/gastos', (req, res, next) => acopioController.listarGastosPorAcopio(req, res, next));
  router.put('/gastos/:gastoId', (req, res, next) => acopioController.actualizarGasto(req, res, next));
  router.delete('/gastos/:gastoId', (req, res, next) => acopioController.eliminarGasto(req, res, next));

  // 6. Etapa 2: Transporte
  router.post('/acopios/:acopioId/transporte', (req, res, next) => transporteController.contratarFlete(req, res, next));

  // 7. Etapa 3: Lima (Descarga y Distribución)
  router.post('/acopios/:acopioId/gastos/descarga', (req, res, next) => distribucionController.registrarDescarga(req, res, next));
  router.patch('/jabas/:jabaId/ubicacion', (req, res, next) => distribucionController.trasladarUbicacion(req, res, next));
  router.post('/jabas/:jabaId/dividir', (req, res, next) => distribucionController.dividirJaba(req, res, next));

  // 8. Etapa 4: Ventas y Stock en Kilos
  router.post('/jabas/:jabaId/transformar-kilos', (req, res, next) => ventaController.transformarJabas(req, res, next));
  router.get('/ubicaciones/:ubicacionId/inventario-kilos', (req, res, next) => ventaController.listarInventarioPorUbicacion(req, res, next));
  router.get('/empresas/:empresaId/inventario-kilos', (req, res, next) => ventaController.listarInventarioPorEmpresa(req, res, next));
  router.post('/ventas', (req, res, next) => ventaController.registrarVenta(req, res, next));
  router.get('/empresas/:empresaId/ventas', (req, res, next) => ventaController.listarVentasPorEmpresa(req, res, next));

  // 9. Fiados
  router.post('/fiados', (req, res, next) => ventaController.registrarFiado(req, res, next));
  router.get('/empresas/:empresaId/fiados', (req, res, next) => ventaController.listarFiadosPorEmpresa(req, res, next));
  router.delete('/fiados/:fiadoId', (req, res, next) => ventaController.eliminarFiado(req, res, next));

  return router;
}
