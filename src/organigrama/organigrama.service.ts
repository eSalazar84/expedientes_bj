import { Injectable } from '@nestjs/common';
import { CreateOrganigramaDto } from './dto/create-organigrama.dto';
import { UpdateOrganigramaDto } from './dto/update-organigrama.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Dependencia } from './entities/dependencia.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OrganigramaService {
  constructor(
    @InjectRepository(Dependencia)
    private readonly dependenciaRepository: Repository<CreateOrganigramaDto>
  ) { }

  async create(createOrganigramaDto: CreateOrganigramaDto) {
    const newDependencia = this.dependenciaRepository.create(createOrganigramaDto)

    return await this.dependenciaRepository.save(newDependencia)
  }

  async findAll(): Promise<CreateOrganigramaDto[]> {
    return await this.dependenciaRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} organigrama`;
  }

  update(id: number, updateOrganigramaDto: UpdateOrganigramaDto) {
    return `This action updates a #${id} organigrama`;
  }

  remove(id: number) {
    return `This action removes a #${id} organigrama`;
  }
}
