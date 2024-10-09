import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Expediente } from './entities/expediente.entity';
import { Dependencia } from 'src/organigrama/entities/dependencia.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { DependenciaEnum } from 'src/organigrama/enums/organigrama.enum';
import { Iexpediente } from './interface/expediente.interface';

@Injectable()
export class ExpedienteService {
  constructor(
    @InjectRepository(Expediente)
    private readonly expedienteRepository: Repository<Expediente>,
    @InjectRepository(Dependencia)
    private readonly dependenciaRepository: Repository<Dependencia>,
  ) { }

  async createExpediente(createExpedienteDto: CreateExpedienteDto): Promise<Expediente> {
    const { dependenciaId, titulo_expediente, descripcion, apellidoSolicitante } = createExpedienteDto;

    // 1. Buscar la dependencia por ID
    const dependencia = await this.dependenciaRepository.findOne({
      where: { idDependencia: dependenciaId },
    });

    if (!dependencia) {
      throw new NotFoundException('Dependencia no encontrada');
    }

    // 2. Obtener la letra asignada
    let letraAsignada: string;

    // Comprobar si la dependencia es PERMISOS o HABILITACIONES
    if (dependencia.nombre_dependencia === DependenciaEnum.PERMISOS || dependencia.nombre_dependencia === DependenciaEnum.HABILITACIONES) {
      // Usar la primera letra del apellido del solicitante
      if (!apellidoSolicitante) {
        throw new BadRequestException('El apellido del solicitante es necesario para esta dependencia');
      }
      letraAsignada = apellidoSolicitante[0].toUpperCase(); // Primera letra del apellido
    } else {
      // Usar la primera letra del nombre de la dependencia
      letraAsignada = dependencia.nombre_dependencia[0];
    }

    if (!letraAsignada) {
      throw new BadRequestException('No se ha podido determinar la letra identificadora');
    }

    // 3. Obtener el año actual
    const anioActual = new Date().getFullYear();

    // 4. Buscar el expediente más reciente con la misma letra y año para determinar el próximo número
    const ultimoExpediente = await this.expedienteRepository.findOne({
      where: { letra_identificadora: letraAsignada, anio_expediente: anioActual },
      order: { nro_expediente: 'DESC' },
    });

    // 5. Incrementar el número del expediente
    const nuevoNumeroExpediente = ultimoExpediente ? ultimoExpediente.nro_expediente + 1 : 1;

    // 6. Inicializar la ruta del expediente en 1
    const rutaInicial = 1;

    // 7. Crear el nuevo expediente
    const nuevoExpediente = this.expedienteRepository.create({
      anio_expediente: anioActual, // Asignar el año en curso
      letra_identificadora: letraAsignada, // Letra basada en la dependencia o el apellido
      nro_expediente: nuevoNumeroExpediente, // Número secuencial del expediente
      ruta_expediente: rutaInicial, // Inicializa la ruta en 1
      titulo_expediente, // Proporcionado por el usuario
      descripcion, // Proporcionado por el usuario
      dependencia, // Asignar la dependencia relacionada
    });

    // 8. Guardar el expediente en la base de datos
    return this.expedienteRepository.save(nuevoExpediente);
  }

  // Método adicional para manejar el cambio de ruta en base a la cantidad de pases
  async actualizarRutaExpediente(expedienteId: number): Promise<void> {
    // Ahora pasamos el expedienteId como parte de las opciones en el objeto
    const expediente = await this.expedienteRepository.findOne({
      where: { idExpediente: expedienteId }, // Buscamos por el ID del expediente
      relations: ['pases'], // Incluimos la relación con los pases
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

  async findAllExpedientes(): Promise<CreateExpedienteDto[]> {
    const expedientes = await this.expedienteRepository.find({ relations: ['pases', 'dependencia', 'pases.destino'] });

    return expedientes.map(expediente => ({
      idExpediente: expediente.idExpediente,
      anio_expediente: expediente.anio_expediente,
      letra_identificadora: expediente.letra_identificadora,
      nro_expediente: expediente.nro_expediente,
      ruta_expediente: expediente.ruta_expediente,
      titulo_expediente: expediente.titulo_expediente,
      descripcion: expediente.descripcion,
      dependenciaId: expediente.dependencia ? expediente.dependencia.idDependencia : null,
      pases: expediente.pases.map(pase => ({
        idPase: pase.idPase,
        fecha_pase: pase.fecha_pase,
        destino: pase.destino ? {
          idDependencia: pase.destino.idDependencia,
          nombre_dependencia: pase.destino.nombre_dependencia
        } : null
      }))
    }));
  }

  async findOneExpediente(id: number): Promise<Iexpediente> {
    const query: FindOneOptions = { where: { idExpediente: id }, relations: ['pases', 'dependencia', 'pases.destino'] }
    const expedienteFound = await this.expedienteRepository.findOne(query)
    if (!expedienteFound) throw new HttpException({
      status: HttpStatus.NOT_FOUND,
      error: `No existe el expediente que esta buscando`
    }, HttpStatus.NOT_FOUND)

    return {
      idExpediente: expedienteFound.idExpediente,
      anio_expediente: expedienteFound.anio_expediente,
      letra_identificadora: expedienteFound.letra_identificadora,
      nro_expediente: expedienteFound.nro_expediente,
      ruta_expediente: expedienteFound.ruta_expediente,
      titulo_expediente: expedienteFound.titulo_expediente,
      descripcion: expedienteFound.descripcion,
      dependencia: {
        idDependencia: expedienteFound.dependencia ? expedienteFound.dependencia.idDependencia : null,
        nombre_dependencia: expedienteFound.dependencia.nombre_dependencia
      },
      pases: expedienteFound.pases.map(pase => ({
        idPase: pase.idPase,
        fecha_pase: pase.fecha_pase,
        destino: pase.destino ? {
          idDependencia: pase.destino.idDependencia,
          nombre_dependencia: pase.destino.nombre_dependencia
        } : null
      }))
    };
  }

  update(id: number, updateExpedienteDto: UpdateExpedienteDto) {
    return `This action updates a #${id} expediente`;
  }

  remove(id: number) {
    return `This action removes a #${id} expediente`;
  }
}
