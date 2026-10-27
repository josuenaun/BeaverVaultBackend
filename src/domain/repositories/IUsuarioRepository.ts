// Capa 1: Domain - src/domain/repositories/IUsuarioRepository.ts

import { Usuario } from '../entities/Usuario.js';

export interface IUsuarioRepository {
  save(usuario: Usuario): Promise<Usuario>;
  findById(usuarioId: string): Promise<Usuario | null>;
  findByCorreo(correo: string): Promise<Usuario | null>;
  findByEmpresaId(empresaId: string): Promise<Usuario[]>;
  delete(usuarioId: string): Promise<void>;
}
