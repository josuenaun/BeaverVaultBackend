// Capa 2: Application - src/application/use-cases/configuracion/RegistrarEmpresaUseCase.ts

import { Empresa } from '../../../domain/entities/Empresa.js';
import { IEmpresaRepository } from '../../../domain/repositories/IEmpresaRepository.js';
import { RegistrarEmpresaInputDTO } from '../../dtos/ConfiguracionDTO.js';

export class RegistrarEmpresaUseCase {
  constructor(private readonly empresaRepo: IEmpresaRepository) {}

  async execute(input: RegistrarEmpresaInputDTO): Promise<Empresa> {
    const empresa = new Empresa({
      nombre: input.nombre,
    });
    return await this.empresaRepo.save(empresa);
  }
}
