// Capa 2: Application - src/application/use-cases/ventas/TransformarJabasAKilosUseCase.ts

import { IJabaRepository } from '../../../domain/repositories/IJabaRepository.js';
import { IInventarioKilosRepository } from '../../../domain/repositories/IInventarioKilosRepository.js';
import { InventarioKilos } from '../../../domain/entities/InventarioKilos.js';
import { ValidationError } from '../../../domain/errors/DomainError.js';
import { TransformarJabasInputDTO } from '../../dtos/VentaDTO.js';

export class TransformarJabasAKilosUseCase {
  constructor(
    private readonly jabaRepo: IJabaRepository,
    private readonly inventarioRepo: IInventarioKilosRepository
  ) {}

  async execute(input: TransformarJabasInputDTO): Promise<InventarioKilos> {
    const jaba = await this.jabaRepo.findById(input.jabaId);
    if (!jaba) {
      throw new ValidationError(`Lote de jaba con ID ${input.jabaId} no encontrado`);
    }

    // Regla de dominio: valida estado y pasa a Convertida_Kilos
    jaba.marcarConvertidaKilos();
    await this.jabaRepo.updateEstado(input.jabaId, 'Convertida_Kilos');
    await this.jabaRepo.updateUbicacion(input.jabaId, input.ubicacionId);

    // Obtener inventario de kilos existente o crear uno nuevo
    let inventario = await this.inventarioRepo.findByUbicacionYPalta(
      input.ubicacionId,
      jaba.tipoPalta,
      jaba.categoria
    );

    if (!inventario) {
      inventario = new InventarioKilos({
        ubicacionId: input.ubicacionId,
        tipoPalta: jaba.tipoPalta,
        categoria: jaba.categoria,
        kilosDisponibles: 0,
      });
    }

    // Regla de negocio crítica: NO HAY MERMA.
    inventario.ingresarStock(jaba.pesoBruto);

    return await this.inventarioRepo.save(inventario);
  }
}
