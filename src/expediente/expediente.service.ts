import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Expediente } from './entities/expediente.entity';
import { Dependencia } from 'src/dependencia/entities/dependencia.entity';
import { Brackets, FindOneOptions, FindOptionsWhere, ILike, Repository } from 'typeorm';


@Injectable()
export class ExpedienteService {
  constructor(
    @InjectRepository(Expediente)
    private readonly expedienteRepository: Repository<Expediente>,
    @InjectRepository(Dependencia)
    private readonly dependenciaRepository: Repository<Dependencia>,
  ) { }

  // Función auxiliar para procesar la letra identificadora
  private processLetraIdentificadora(expediente: Expediente): void {
    if (expediente.dependencia_creadora?.letra_es_variable) {
      expediente.dependencia_creadora.letra_identificadora =
        expediente.titulo_expediente.charAt(0).toUpperCase();
    }
  }

  // Método para procesar array de expedientes
  private processExpedientes(expedientes: Expediente[]): Expediente[] {
    expedientes.forEach(exp => this.processLetraIdentificadora(exp));
    return expedientes;
  }

  async createExpediente(createExpedienteDto: CreateExpedienteDto): Promise<CreateExpedienteDto> {
    const { dependenciaId, titulo_expediente, descripcion } = createExpedienteDto;

    // Buscar la dependencia por ID
    const dependencia = await this.dependenciaRepository.findOne({
      where: { idDependencia: dependenciaId }
    });

    if (!dependencia) {
      throw new HttpException('Dependencia no encontrada', HttpStatus.NOT_FOUND);
    }

    // Determinar la letra identificadora
    let letraIdentificadora: string;
    if (dependencia.letra_es_variable) {
      if (!titulo_expediente || titulo_expediente.trim().length === 0) {
        throw new HttpException(
          'El título del expediente no puede estar vacío cuando la letra es variable',
          HttpStatus.BAD_REQUEST
        );
      }
      letraIdentificadora = titulo_expediente.charAt(0).toUpperCase();
    } else {
      if (!dependencia.letra_identificadora) {
        throw new HttpException(
          'La dependencia no tiene letra identificadora asignada',
          HttpStatus.BAD_REQUEST
        );
      }
      letraIdentificadora = dependencia.letra_identificadora;
    }

    // Obtener el año actual
    const anioActual = new Date().getFullYear();

    // Buscar el último expediente con la misma letra para el año actual
    const ultimoExpediente = await this.expedienteRepository
      .createQueryBuilder('expediente')
      .innerJoin('expediente.dependencia_creadora', 'dependencia')
      .where(new Brackets(qb => {
        qb.where('dependencia.letra_identificadora = :letra', { letra: letraIdentificadora })
          .orWhere(
            'dependencia.letra_es_variable = true AND UPPER(SUBSTRING(expediente.titulo_expediente, 1, 1)) = :letra',
            { letra: letraIdentificadora }
          );
      }))
      .andWhere('expediente.anio_expediente = :anio', { anio: anioActual })
      .orderBy('expediente.nro_expediente', 'DESC')
      .getOne();

    // Calcular el próximo número de expediente
    const nuevoNroExpediente = ultimoExpediente ? ultimoExpediente.nro_expediente + 1 : 1;

    // Validación adicional para asegurar que no exista el número
    const existeExpediente = await this.expedienteRepository
      .createQueryBuilder('expediente')
      .innerJoin('expediente.dependencia_creadora', 'dependencia')
      .where(new Brackets(qb => {
        qb.where('dependencia.letra_identificadora = :letra', { letra: letraIdentificadora })
          .orWhere(
            'dependencia.letra_es_variable = true AND UPPER(SUBSTRING(expediente.titulo_expediente, 1, 1)) = :letra',
            { letra: letraIdentificadora }
          );
      }))
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
      return expedienteGuardado;
    } catch (error) {
      throw new HttpException(
        'Error al crear el expediente',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAllExpediente(): Promise<CreateExpedienteDto[]> {
    const expedientes = await this.expedienteRepository.find({
      relations: ['pases', 'dependencia_creadora'],
      order: {
        anio_expediente: 'DESC',
        nro_expediente: 'DESC'
      }
    });
    return this.processExpedientes(expedientes);
  }

  async findOneExpediente(id: number): Promise<CreateExpedienteDto> {
    const query: FindOneOptions = {
      where: { idExpediente: id },
      relations: ['pases', 'dependencia_creadora']
    };
    const expediente = await this.expedienteRepository.findOne(query);
    if (!expediente) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: `No existe el expediente que esta buscando`
      }, HttpStatus.NOT_FOUND);
    }
    this.processLetraIdentificadora(expediente);
    return expediente;
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

    return this.processExpedientes(expedientes);
  }

  async findExpedientesByDependencia(dependenciaId: number): Promise<Expediente[]> {
    const expedientes = await this.expedienteRepository
      .createQueryBuilder('expediente')
      .leftJoinAndSelect('expediente.dependencia_creadora', 'dependencia_creadora')
      .leftJoinAndSelect('expediente.pases', 'pases')
      .leftJoinAndSelect('pases.destino', 'pase_destino')
      .where(new Brackets(qb => {
        qb.where('dependencia_creadora.idDependencia = :depId', { depId: dependenciaId })
          .orWhere(
            'EXISTS (SELECT 1 FROM pase p ' +
            'WHERE p.expedienteId = expediente.idExpediente ' +
            'AND p.destinoId = :depId)',
            { depId: dependenciaId }
          );
      }))
      .orderBy('expediente.anio_expediente', 'DESC')
      .addOrderBy('expediente.nro_expediente', 'DESC')
      .getMany();

    if (expedientes.length === 0) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: 'No se encontraron expedientes para esta dependencia'
      }, HttpStatus.NOT_FOUND);
    }

    return this.processExpedientes(expedientes);
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
