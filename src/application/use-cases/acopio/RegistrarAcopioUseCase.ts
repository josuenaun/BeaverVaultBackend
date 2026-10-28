// Capa 2: Application - src/application/use-cases/acopio/RegistrarAcopioUseCase.ts

import { Acopio } from '../../../domain/entities/Acopio.js';
import { Jaba } from '../../../domain/entities/Jaba.js';
import { IAcopioRepository } from '../../../domain/repositories/IAcopioRepository.js';
import { IJabaRepository } from '../../../domain/repositories/IJabaRepository.js';
import { RegistrarAcopioInputDTO } from '../../dtos/acopio.dto.js';
import { ValidationError } from '../../../domain/errors/DomainError.js';

export class RegistrarAcopioUseCase {
  constructor(
    private readonly acopioRepo: IAcopioRepository,
    private readonly jabaRepo: IJabaRepository
  ) {}

  async execute(input: RegistrarAcopioInputDTO): Promise<Acopio> {
    if (!input.jabas || input.jabas.length === 0) {
      throw new ValidationError('Debe registrar al menos un lote de jabas en el acopio');
    }

    const acopio = new Acopio({
      empresaId: input.empresaId,
      encargadoLote: input.encargadoLote,
      fechaCompra: input.fechaCompra,
      origen: input.origen,
      creadoPorUsuarioId: input.creadoPorUsuarioId,
      estado: 'En Transito',
    });

    const acopioGuardado = await this.acopioRepo.save(acopio);
    const acopioId = acopioGuardado.acopioId!;

    const jabaEntities = input.jabas.map(
      (item) =>
        new Jaba({
          acopioId,
          ubicacionId: item.ubicacionId ?? null,
          tipoPalta: item.tipoPalta,
          categoria: item.categoria,
          codigoColor: item.codigoColor,
          cantidadJabas: item.cantidadJabas,
          pesoBruto: item.pesoBruto,
          estado: 'Almacenada',
        })
    );

    const jabasGuardadas = await this.jabaRepo.saveMany(jabaEntities);
    jabasGuardadas.forEach((j) => acopioGuardado.agregarJaba(j));

    return acopioGuardado;
  }
}
