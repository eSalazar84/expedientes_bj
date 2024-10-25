import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Expediente } from './entities/expediente.entity';
import { Dependencia } from 'src/organigrama/entities/dependencia.entity';
import { FindManyOptions, FindOneOptions, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Pase } from 'src/pase/entities/pase.entity';
import { serialize } from 'v8';

@Injectable()
export class ExpedienteService {
  constructor(
    @InjectRepository(Expediente)
    private readonly expedienteRepository: Repository<Expediente>,
    @InjectRepository(Dependencia)
    private readonly dependenciaRepository: Repository<Dependencia>,
  ) { }

  async createExpediente(createExpedienteDto: CreateExpedienteDto): Promise<Expediente> {
    const { dependenciaId, titulo_expediente, descripcion } = createExpedienteDto;

    // 1. Buscar la dependencia por ID
    const dependencia = await this.dependenciaRepository.findOne({
      where: { idDependencia: dependenciaId },
    });

    if (!dependencia) {
      throw new NotFoundException('Dependencia no encontrada');
    }

    // 2. Obtener la letra asignada a la dependencia
    const letraAsignada = dependencia.nombre_dependencia[0]; // Asignar la primera letra del nombre de la dependencia como letra_identificadora

    if (!letraAsignada) {
      throw new BadRequestException('La dependencia no tiene una letra identificadora');
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
      letra_identificadora: letraAsignada, // Letra basada en la dependencia
      nro_expediente: nuevoNumeroExpediente, // Número secuencial del expediente
      ruta_expediente: rutaInicial, // Inicializa la ruta en 1
      titulo_expediente, // Proporcionado por el usuario
      descripcion, // Proporcionado por el usuario
      dependenciaId, // Asignar la dependencia relacionada,      
    });

    // 8. Guardar el expediente en la base de datos
    return this.expedienteRepository.save(nuevoExpediente);
  }

  findAllExpediente(): Promise<CreateExpedienteDto[]> {
    return this.expedienteRepository.find();
  }

  async findOneExpediente(id: number): Promise<Expediente> {
    const query: FindOneOptions = { where: { idExpediente: id }, relations: ['pases', 'dependencia', 'pases.dependencia'] }
    const expedienteFound = await this.expedienteRepository.findOne(query)
    if (!expedienteFound) throw new HttpException({
      status: HttpStatus.NOT_FOUND,
      error: `No existe el expediente que esta buscando`
    }, HttpStatus.NOT_FOUND)
    return expedienteFound;
  }

  async findExpedienteByFilters(filters: {
    search_title_exp?: string,
    search_anio_exp?: number,
    search_dependencia?: string
  }): Promise<CreateExpedienteDto[]> {
    const where: FindOptionsWhere<Expediente> = {};
  
    // Condiciones de búsqueda por título, año y dependencia
    if (filters.search_title_exp) {
      where.titulo_expediente = ILike(`%${filters.search_title_exp}%`);
    }
  
    if (filters.search_anio_exp) {
      where.anio_expediente = filters.search_anio_exp;
    }
  
    if (filters.search_dependencia) {
      where.dependencia_creadora = {
        nombre_dependencia: ILike(`%${filters.search_dependencia}%`)
      };
    }
  
    // Hacer la consulta con las condiciones combinadas
    const expedientes = await this.expedienteRepository.find({
      where: Object.keys(where).length ? where : undefined,  // Solo aplicar where si hay criterios
      relations: ['dependencia_creadora', 'pases'] // Incluir relaciones
    });
  
    // Verificar si se encontraron expedientes
    if (expedientes.length === 0) {
      throw new HttpException('No existen expedientes con ese criterio', HttpStatus.NOT_FOUND);
    }
  
    return expedientes;
  }
  


  update(id: number, updateExpedienteDto: UpdateExpedienteDto) {
    return `This action updates a #${id} expediente`;
  }

  remove(id: number) {
    return `This action removes a #${id} expediente`;
  }
}
