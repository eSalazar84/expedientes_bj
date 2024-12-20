import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePaseDto } from './dto/create-pase.dto';
import { UpdatePaseDto } from './dto/update-pase.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pase } from './entities/pase.entity';
import { Repository } from 'typeorm';
import { Dependencia } from 'src/dependencia/entities/dependencia.entity';
import { Expediente } from 'src/expediente/entities/expediente.entity';

@Injectable()
export class PaseService {
  constructor(
    @InjectRepository(Pase)
    private readonly paseRepository: Repository<Pase>,
    @InjectRepository(Dependencia)
    private readonly dependenciaRepository: Repository<Dependencia>,
    @InjectRepository(Expediente)
    private readonly expedienteRepository: Repository<Expediente>
  ) { }

  async createPase(createPaseDto: CreatePaseDto): Promise<Pase> {
    const { destinoId, expedienteId } = createPaseDto;

    // Verificar si existe la dependencia destino
    const destinoFound = await this.dependenciaRepository.findOne({
      where: { idDependencia: destinoId }
    });

    if (!destinoFound) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: `No existe la dependencia que estás buscando`,
      }, HttpStatus.NOT_FOUND);
    }

    // Verificar si existe el expediente
    const expedienteFound: Expediente = await this.expedienteRepository.findOne({
      where: { idExpediente: expedienteId },
      relations: ['pases'] // Asegura que traemos los pases relacionados
    });

    if (!expedienteFound) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: `No existe el expediente que estás buscando`,
      }, HttpStatus.NOT_FOUND);
    }

    // Contar el número de pases asociados a este expediente
    const paseCount = await this.paseRepository.count({
      where: { expediente: { idExpediente: expedienteId } }
    });

    // Si el conteo de pases es múltiplo de 25, incrementamos ruta_expediente
    if ((paseCount + 1) % 25 === 0) {
      expedienteFound.ruta_expediente += 1;
      await this.expedienteRepository.save(expedienteFound); // Guardar el cambio en ruta_expediente
    }

    // Crear y guardar el nuevo pase
    const newPase = this.paseRepository.create({
      expediente: expedienteFound, // Relación con el expediente existente
      destinoId: destinoId
    });

    return await this.paseRepository.save(newPase);
  }


  async findAllPase(): Promise<CreatePaseDto[]> {
    return this.paseRepository.find()
  }

  async findPasesByIdExpediente(idExpediente: number): Promise<Pase[]> {
    const expedienteFound = await this.paseRepository.find({
      where: {
        expedienteId: idExpediente
      },
      order: {
        fecha_pase: 'DESC' 
      }
    });

    if (!expedienteFound.length) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: `No existe el expediente que estás buscando`,
      }, HttpStatus.NOT_FOUND);
    }
    return expedienteFound;
  }

  async updatePase(id: number, updatePaseDto: UpdatePaseDto): Promise<CreatePaseDto> {
    const paseFound = await this.paseRepository.findOne({
      where: { idPase: id }
    });
    if (!paseFound) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: `no existe un pase con ese Id`,
      }, HttpStatus.NOT_FOUND);
    }

    const updateExpediente = Object.assign(paseFound, updatePaseDto);
    return this.paseRepository.save(updateExpediente);
  }

}
