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

  /* async createExpediente(createExpedienteDto: CreateExpedienteDto): Promise<CreateExpedienteDto> {
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
  } */

  async createExpediente(createExpedienteDto: CreateExpedienteDto): Promise<CreateExpedienteDto> {
    const { dependenciaId, titulo_expediente, descripcion } = createExpedienteDto;

    // Buscar la dependencia por ID
    const dependencia = await this.dependenciaRepository.findOne({
      where: { idDependencia: dependenciaId }
    });

    if (!dependencia) {
      throw new HttpException('Dependencia no encontrada', HttpStatus.NOT_FOUND);
    }

    const letraIdentificadora = dependencia.letra_identificadora;
    if (!letraIdentificadora) {
      throw new HttpException(
        'La dependencia no tiene letra identificadora asignada',
        HttpStatus.BAD_REQUEST
      );
    }

    // Obtener el año actual
    const anioActual = new Date().getFullYear();

    // Buscar el último expediente con la misma letra para el año actual
    const ultimoExpediente = await this.expedienteRepository
      .createQueryBuilder('expediente')
      .innerJoin('expediente.dependencia_creadora', 'dependencia')
      .where('dependencia.letra_identificadora = :letra', { letra: letraIdentificadora })
      .andWhere('expediente.anio_expediente = :anio', { anio: anioActual })
      .orderBy('expediente.nro_expediente', 'DESC')
      .getOne();

    // Calcular el próximo número de expediente
    const nuevoNroExpediente = ultimoExpediente ? ultimoExpediente.nro_expediente + 1 : 1;

    // Validación adicional para asegurar que no exista el número
    const existeExpediente = await this.expedienteRepository
        .createQueryBuilder('expediente')
        .innerJoin('expediente.dependencia_creadora', 'dependencia')
        .where('dependencia.letra_identificadora = :letra', { letra: letraIdentificadora })
        .andWhere('expediente.anio_expediente = :anio', { anio: anioActual })
        .andWhere('expediente.nro_expediente = :nro', { nro: nuevoNroExpediente })
        .getOne();

    if (existeExpediente) {
        throw new HttpException(
            `Ya existe un expediente con número ${letraIdentificadora}-${nuevoNroExpediente}/${anioActual}`,
            HttpStatus.CONFLICT
        );
    }

    // Crear el nuevo expediente
    const nuevoExpediente = this.expedienteRepository.create({
      anio_expediente: anioActual,
      ruta_expediente: 1,
      nro_expediente: nuevoNroExpediente,
      titulo_expediente,
      descripcion,
      dependencia_creadora: dependencia
    });

    try {
      const expedienteGuardado = await this.expedienteRepository.save(nuevoExpediente);

      console.log(`Expediente creado: ${letraIdentificadora}-${nuevoNroExpediente}/${anioActual}`);

      return expedienteGuardado;
    } catch (error) {
      throw new HttpException(
        'Error al crear el expediente',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAllExpediente(): Promise<CreateExpedienteDto[]> {
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

  async findOneExpedienteByFilters(
    nroExpediente: number,
    anioExpediente: number,
    letraExpediente: string
  ): Promise<Expediente> {
    const expediente = await this.expedienteRepository
      .createQueryBuilder('expediente')
      .innerJoinAndSelect('expediente.dependencia_creadora', 'dependencia')
      .leftJoinAndSelect('expediente.pases', 'pases')
      .where('expediente.nro_expediente = :nro', { nro: nroExpediente })
      .andWhere('expediente.anio_expediente = :anio', { anio: anioExpediente })
      .andWhere('UPPER(dependencia.letra_identificadora) = UPPER(:letra)', {
        letra: letraExpediente.trim()
      })
      .getOne();

    if (!expediente) {
      throw new HttpException(
        `No se encontró el expediente ${letraExpediente}-${nroExpediente}/${anioExpediente}`,
        HttpStatus.NOT_FOUND
      );
    }

    return expediente;
  }

  async findExpedienteByFilters(filters: {
    search_title_exp?: string,
    search_anio_exp?: number,
    search_nro_exp?: number,
    search_dependencia?: string,
    search_letra_exp?: string
  }): Promise<CreateExpedienteDto[]> {
    const queryBuilder = this.expedienteRepository.createQueryBuilder('expediente')
      .innerJoinAndSelect('expediente.dependencia_creadora', 'dependencia')
      .leftJoinAndSelect('expediente.pases', 'pases');

    if (filters.search_title_exp) {
      queryBuilder.andWhere('LOWER(expediente.titulo_expediente) LIKE LOWER(:titulo)', {
        titulo: `%${filters.search_title_exp}%`
      });
    }

    if (filters.search_anio_exp) {
      queryBuilder.andWhere('expediente.anio_expediente = :anio', {
        anio: filters.search_anio_exp
      });
    }

    if (filters.search_nro_exp) {
      queryBuilder.andWhere('expediente.nro_expediente = :nro', {
        nro: filters.search_nro_exp
      });
    }

    if (filters.search_dependencia) {
      queryBuilder.andWhere('LOWER(dependencia.nombre_dependencia) = LOWER(:nombre)', {
        nombre: filters.search_dependencia.trim()
      });
    }

    if (filters.search_letra_exp) {
      queryBuilder.andWhere('UPPER(dependencia.letra_identificadora) = UPPER(:letra)', {
        letra: filters.search_letra_exp.trim()
      });
    }

    queryBuilder
      .orderBy('expediente.anio_expediente', 'DESC')
      .addOrderBy('expediente.nro_expediente', 'DESC');

    const expedientes = await queryBuilder.getMany();

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
