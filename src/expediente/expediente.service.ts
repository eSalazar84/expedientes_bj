import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Expediente } from './entities/expediente.entity';
import { Dependencia } from 'src/organigrama/entities/dependencia.entity';
import { FindOneOptions, FindOptionsWhere, ILike, Repository } from 'typeorm';


@Injectable()
export class ExpedienteService {
  constructor(
    @InjectRepository(Expediente)
    private readonly expedienteRepository: Repository<Expediente>,
    @InjectRepository(Dependencia)
    private readonly dependenciaRepository: Repository<Dependencia>,
  ) { }

  async createExpediente(createExpedienteDto: CreateExpedienteDto): Promise<CreateExpedienteDto> {
    const { dependenciaId, titulo_expediente, descripcion } = createExpedienteDto;

    // Buscar la dependencia por ID
    const dependencia = await this.dependenciaRepository.findOne({
      where: { idDependencia: dependenciaId }
    });
    if (!dependencia) {
      throw new HttpException('Dependencia no encontrada', HttpStatus.NOT_FOUND);
    }

    // Obtener el año actual y contar los expedientes existentes para la dependencia en este año
    const anioActual = new Date().getFullYear();
    const expedientesAnioActual = await this.expedienteRepository.count({
      where: {
        dependencia_creadora: dependencia,
        anio_expediente: anioActual,
      },
    });

    // Asignar el próximo número de expediente para la dependencia en este año
    const nuevoNroExpediente = expedientesAnioActual + 1;

    // Crear el nuevo expediente con el número de expediente calculado
    const nuevoExpediente = this.expedienteRepository.create({
      anio_expediente: anioActual,
      ruta_expediente: 1,
      nro_expediente: nuevoNroExpediente,  // asignar el número aquí
      titulo_expediente,
      descripcion,
      dependencia_creadora: dependencia
    });

    // Guardar el expediente en la base de datos
    return this.expedienteRepository.save(nuevoExpediente);
  }

  findAllExpediente(): Promise<CreateExpedienteDto[]> {
    return this.expedienteRepository.find({
      relations: ['pases', 'dependencia_creadora'],
      order: {
        anio_expediente: 'DESC',
        nro_expediente: 'DESC'
      }
    });
  }

  async findOneExpediente(id: number): Promise<CreateExpedienteDto> {
    const query: FindOneOptions = { where: { idExpediente: id }, relations: ['pases', 'dependencia_creadora'] }
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
      relations: ['dependencia_creadora', 'pases'], // Incluir relaciones
      order: {
        anio_expediente: 'DESC',
        nro_expediente: 'DESC'
      }
    });

    // Verificar si se encontraron expedientes
    if (expedientes.length === 0) {
      throw new HttpException('No existen expedientes con ese criterio', HttpStatus.NOT_FOUND);
    }

    return expedientes;
  }

  async updateExpediente(id: number, updateExpedienteDto: UpdateExpedienteDto): Promise<CreateExpedienteDto> {
    const expedienteFound = await this.expedienteRepository.findOne({
      where: { idExpediente: id }
    })
    if (!expedienteFound) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: `no existe un expediente con ese Id`,
      }, HttpStatus.NOT_FOUND);
    }

    const updateExpediente = Object.assign(expedienteFound, updateExpedienteDto)

    return this.expedienteRepository.save(updateExpediente)
  }

  async removeExpediente(id: number): Promise<void> {
    const expediente = await this.expedienteRepository.findOne({
      where: { idExpediente: id },
      relations: ['pases'], // Carga los pases relacionados
    });

    if (!expediente) throw new HttpException({
      status: HttpStatus.NOT_FOUND,
      error: `No existe un producto con el id ${id}`
    }, HttpStatus.NOT_FOUND)

    // Borra los pases manualmente antes de eliminar el expediente
    await this.expedienteRepository.manager.transaction(async (transactionalEntityManager) => {
      for (const pase of expediente.pases) {
        await transactionalEntityManager.remove(pase);
      }
      // Luego elimina el expediente
      await transactionalEntityManager.remove(expediente);
    });
  }
}
