import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateDependenciaDto } from './dto/create-dependencia.dto';
import { UpdateDependenciaDto } from './dto/update-dependencia.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Dependencia } from './entities/dependencia.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { Expediente } from 'src/expediente/entities/expediente.entity';
import * as bcrypt from 'bcrypt';
import { Rol } from 'src/auth/enums/rol.enum';
import { error } from 'console';

@Injectable()
export class DependenciaService {
  constructor(
    @InjectRepository(Dependencia)
    private readonly dependenciaRepository: Repository<Dependencia>
  ) { }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }

  async finByRole(rol: Rol): Promise<CreateDependenciaDto | null> {
    return this.dependenciaRepository.findOne({
      where: {
        rol: rol
      }
    })
  }

  async createInitialUser(data: Partial<CreateDependenciaDto>): Promise<CreateDependenciaDto> {
    const newDependencia = this.dependenciaRepository.create(data)
    return this.dependenciaRepository.save(newDependencia)
  }

  async createDependencia(createDependenciaDto: CreateDependenciaDto): Promise<CreateDependenciaDto> {
    // Normalizar el valor ingresado por el usuario
    const dependenciaNormalizada = createDependenciaDto.nombre_dependencia.trim();

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
      letra_identificadora: createDependenciaDto.letra_identificadora.trim().toUpperCase(),
      nombre_dependencia: dependenciaNormalizada,  // Guardar el nombre normalizado
    });

    // Guardar la nueva dependencia en la base de datos
    return await this.dependenciaRepository.save(newDependencia);
  }

  async findOneDependencia(id: number): Promise<Dependencia> {
    const dependenciaFound = await this.dependenciaRepository.findOne({
      where: { idDependencia: id }
    })
    if (!dependenciaFound) {
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: `no existe una dependencia con ese Id`,
      }, HttpStatus.CONFLICT);
    }
    return dependenciaFound;
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
    const dependenciaFound = await this.dependenciaRepository.findOne({
      where: { idDependencia: id }
    })
    if (!dependenciaFound) {
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: `no existe una dependencia con ese Id`,
      }, HttpStatus.CONFLICT);
    }

    if (updateDependenciaDto.password) {
      updateDependenciaDto.password = await this.hashPassword(updateDependenciaDto.password);
    }

    const updateDependencia = Object.assign(dependenciaFound, updateDependenciaDto)

    return this.dependenciaRepository.save(updateDependencia)
  }

  async removeDependencia(id: number) {
    const dependenciaFound = await this.dependenciaRepository.findOne({
      where: { idDependencia: id }
    })
    if (!dependenciaFound) {
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: `no existe una dependencia con ese Id`,
      }, HttpStatus.CONFLICT);
    }

    const superAdminCount = await this.dependenciaRepository.count({
      where: {
        rol: Rol.SUPER_ADMIN
      }
    })

    if (dependenciaFound && superAdminCount <= 1) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: `Debe existir al menos una dependencia con rol SUPERADMIN`
      }, HttpStatus.FORBIDDEN)
    }
    return this.dependenciaRepository.delete(id)
  }
}
