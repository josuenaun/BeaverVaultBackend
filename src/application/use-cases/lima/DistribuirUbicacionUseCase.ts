// Capa 2: Application - src/application/use-cases/lima/DistribuirUbicacionUseCase.ts

import { IJabaRepository } from '../../../domain/repositories/IJabaRepository.js';
import { IAcopioRepository } from '../../../domain/repositories/IAcopioRepository.js';
import { IInventarioKilosRepository } from '../../../domain/repositories/IInventarioKilosRepository.js';
import { InventarioKilos } from '../../../domain/entities/InventarioKilos.js';
import { ValidationError } from '../../../domain/errors/DomainError.js';
import { DistribuirJabaInputDTO } from '../../dtos/lima.dto.js';

export class DistribuirUbicacionUseCase {
  constructor(
    private readonly jabaRepo: IJabaRepository,
    private readonly acopioRepo?: IAcopioRepository,
    private readonly inventarioRepo?: IInventarioKilosRepository
  ) {}

  async execute(input: DistribuirJabaInputDTO): Promise<void> {
    if (!input.ubicacionId) {
      throw new ValidationError('El ID de ubicación de destino es requerido');
    }

    const jaba = await this.jabaRepo.findById(input.jabaId);
    if (!jaba) {
      throw new ValidationError(`Lote de jaba con ID ${input.jabaId} no encontrado`);
    }

    const ubicacionAnteriorId = jaba.ubicacionId;

    jaba.trasladar(input.ubicacionId);
    await this.jabaRepo.updateUbicacion(input.jabaId, input.ubicacionId);
    await this.jabaRepo.updateEstado(input.jabaId, 'Almacenada');

    if (this.acopioRepo && jaba.acopioId) {
      await this.acopioRepo.updateEstado(jaba.acopioId, 'Recibido', new Date());
    }

    // Reubicar kilos en la base de datos PostgreSQL (inventarios_kilos)
    if (this.inventarioRepo && ubicacionAnteriorId && ubicacionAnteriorId !== input.ubicacionId) {
      const invOrigen = await this.inventarioRepo.findByUbicacionYPalta(
        ubicacionAnteriorId,
        jaba.tipoPalta,
        jaba.categoria
      );
      if (invOrigen && invOrigen.kilosDisponibles > 0) {
        const kilosAMover = Math.min(invOrigen.kilosDisponibles, jaba.pesoBruto);
        if (kilosAMover > 0) {
          invOrigen.descontarStock(kilosAMover);
          await this.inventarioRepo.save(invOrigen);

          let invDestino = await this.inventarioRepo.findByUbicacionYPalta(
            input.ubicacionId,
            jaba.tipoPalta,
            jaba.categoria
          );
          if (!invDestino) {
            invDestino = new InventarioKilos({
              ubicacionId: input.ubicacionId,
              tipoPalta: jaba.tipoPalta,
              categoria: jaba.categoria,
              kilosDisponibles: 0,
            });
          }
          invDestino.ingresarStock(kilosAMover);
          await this.inventarioRepo.save(invDestino);
        }
      }
    }
  }
}
