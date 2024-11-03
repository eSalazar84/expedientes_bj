import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePaseDto } from './dto/create-pase.dto';
import { UpdatePaseDto } from './dto/update-pase.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pase } from './entities/pase.entity';
import { Repository } from 'typeorm';
import { Dependencia } from 'src/organigrama/entities/dependencia.entity';
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
    const { destinoId, expedienteId } = createPaseDto

    const destinoFound = await this.dependenciaRepository.findOne({
      where: { idDependencia: destinoId }
    })

    if (!destinoFound) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: `No existe la dependencia que estas buscando`,
      }, HttpStatus.NOT_FOUND);
    }

    const expedienteFound = await this.expedienteRepository.findOne({
      where: { idExpediente: expedienteId }
    })

    if (!expedienteFound) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: `No existe el expediente que estas buscando`,
      }, HttpStatus.NOT_FOUND);
    }
    const newPase = this.paseRepository.create({
      expedienteId: expedienteId,
      destinoId: destinoId
    })

    return await this.paseRepository.save(newPase)
  }

  async findAllPase(): Promise<CreatePaseDto[]> {
    return this.paseRepository.find()
  }

  update(id: number, updatePaseDto: UpdatePaseDto) {
    return `This action updates a #${id} pase`;
  }

  remove(id: number) {
    return `This action removes a #${id} pase`;
  }
}
