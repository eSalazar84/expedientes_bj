import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Expediente } from './entities/expediente.entity';
import { Dependencia } from 'src/organigrama/entities/dependencia.entity';
import { Repository } from 'typeorm';
import { Pase } from 'src/migration/entities/pase.entity';

@Injectable()
export class ExpedienteService {
  constructor(
    @InjectRepository(Expediente)
    private readonly expedienteRepository: Repository<Expediente>,
    @InjectRepository(Dependencia)
    private readonly dependenciaRepository: Repository<Dependencia>,
    @InjectRepository(Pase)
    private readonly paseRepository: Repository<Pase>,
  ) {}
  async createExpediente(createExpedienteDto: CreateExpedienteDto): Promise<Expediente> {
    const { dependenciaId, titulo_expediente, descripcion } = createExpedienteDto;

    // 1. Buscar la dependencia por ID
    const dependencia = await this.dependenciaRepository.findOne(dependenciaId);
    if (!dependencia) {
      throw new NotFoundException('Dependencia no encontrada');
    }

    // 2. Obtener la letra asignada a la dependencia
    const letraAsignada = dependencia.letra_identificadora;
    if (!letraAsignada) {
      throw new BadRequestException('La dependencia no tiene una letra asignada');
    }

    // 3. Obtener el año actual
    const anioActual = new Date().getFullYear();

    // 4. Buscar el número más alto de expediente con la misma letra y año
    const ultimoExpediente = await this.expedienteRepository.findOne({
      where: {
        letra_identificadora: letraAsignada,
        anio_expediente: anioActual,
      },
      order: { nro_expediente: 'DESC' },
    });

    // 5. Incrementar el número del expediente
    const nuevoNumeroExpediente = ultimoExpediente ? ultimoExpediente.nro_expediente + 1 : 1;

    // 6. Inicializar la ruta del expediente
    const rutaInicial = 1;

    // 7. Crear el nuevo expediente
    const expediente = this.expedienteRepository.create({
      anio_expediente: anioActual, // Año en curso
      letra_identificadora: letraAsignada, // Letra de la dependencia
      nro_expediente: nuevoNumeroExpediente, // Número secuencial
      ruta_expediente: rutaInicial, // Inicia en 1
      titulo_expediente, // Asignado por el usuario
      descripcion, // Asignado por el usuario
      dependencia, // Relacionado con la dependencia
    });

    // 8. Guardar el expediente en la base de datos
    return this.expedienteRepository.save(expediente);
  }

  // Método adicional para manejar el cambio de ruta en base a la cantidad de pases
  async actualizarRutaExpediente(expedienteId: number): Promise<void> {
    const expediente = await this.expedienteRepository.findOne(expedienteId, {
      relations: ['pases'],
    });

    if (!expediente) {
      throw new NotFoundException('Expediente no encontrado');
    }

    const totalPases = expediente.pases.length;
    const nuevaRuta = Math.floor(totalPases / 25) + 1;

    // Solo actualiza la ruta si ha cambiado
    if (expediente.ruta_expediente !== nuevaRuta) {
      expediente.ruta_expediente = nuevaRuta;
      await this.expedienteRepository.save(expediente);
    }
  }

  findAll() {
    return `This action returns all expediente`;
  }

  findOne(id: number) {
    return `This action returns a #${id} expediente`;
  }

  update(id: number, updateExpedienteDto: UpdateExpedienteDto) {
    return `This action updates a #${id} expediente`;
  }

  remove(id: number) {
    return `This action removes a #${id} expediente`;
  }
}
