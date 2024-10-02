import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateDependenciaDto } from './dto/create-dependencia.dto';
import { UpdateDependenciaDto } from './dto/update-dependencia.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Dependencia } from './entities/dependencia.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { error } from 'console';

@Injectable()
export class DependenciaService {
  constructor(
    @InjectRepository(Dependencia)
    private readonly dependenciaRepository: Repository<CreateDependenciaDto>
  ) { }

  async createDependencia(createDependenciaDto: CreateDependenciaDto): Promise<CreateDependenciaDto> {
    // Normalizar el valor ingresado por el usuario
    const dependenciaNormalizada = createDependenciaDto.nombre_dependencia.trim().toUpperCase();

    // Buscar la dependencia con el nombre normalizado
    const DependenciaFound = await this.dependenciaRepository.findOne({
      where: { nombre_dependencia: dependenciaNormalizada },
    });

    // Si ya existe, lanzar una excepción de conflicto
    if (DependenciaFound) {
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: `Ya existe una dependencia con ese nombre`,
      }, HttpStatus.CONFLICT);
    }

    // Crear una nueva dependencia con el nombre normalizado
    const newDependencia = this.dependenciaRepository.create({
      ...createDependenciaDto,
      nombre_dependencia: dependenciaNormalizada,  // Guardar el nombre normalizado
    });

    // Guardar la nueva dependencia en la base de datos
    return await this.dependenciaRepository.save(newDependencia);
  }

  async findAllDependencia(): Promise<CreateDependenciaDto[]> {
    return await this.dependenciaRepository.find();
  }

  async findOneByDependencia(dependenciaAbuscar: string): Promise<CreateDependenciaDto> {
    const dependenciaNormalizada = dependenciaAbuscar.trim().toUpperCase();

    // Buscar la dependencia con el nombre normalizado
    const DependenciaFound = await this.dependenciaRepository.findOne({
      where: { nombre_dependencia: dependenciaNormalizada },
    });

    // Si ya existe, lanzar una excepción de conflicto
    if (!DependenciaFound) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: `No existe una dependencia con ese nombre`,
      }, HttpStatus.NOT_FOUND);
    }

    return DependenciaFound;
  }

  async updateDependencia(id: number, updateDependenciaDto: UpdateDependenciaDto): Promise<UpdateDependenciaDto> {
    const queryFound: FindOneOptions = { where: { id: id } }
    const productFound = await this.dependenciaRepository.findOne(queryFound)
    if (!productFound) throw new HttpException({
      status: HttpStatus.NOT_FOUND,
      error: `No existe un producto con el id ${id}`
    }, HttpStatus.NOT_FOUND)
    
    const updateUser = Object.assign(productFound, updateDependenciaDto)
    return this.dependenciaRepository.save(updateUser)
  }

  removeDependencia(id: number) {
    return `This action removes a #${id} Dependencia`;
  }
}
