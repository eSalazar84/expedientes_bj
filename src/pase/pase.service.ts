import { Injectable } from '@nestjs/common';
import { CreatePaseDto } from './dto/create-pase.dto';
import { UpdatePaseDto } from './dto/update-pase.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pase } from './entities/pase.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PaseService {
  constructor(
    @InjectRepository(Pase)
    private readonly paseRepository: Repository<Pase>
  ) { }

  async createPase(createPaseDto: CreatePaseDto): Promise<Pase> {
    const newPase = this.paseRepository.create(createPaseDto);
    return await this.paseRepository.save(newPase)
  }

  findAll() {
    return `This action returns all pase`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pase`;
  }

  update(id: number, updatePaseDto: UpdatePaseDto) {
    return `This action updates a #${id} pase`;
  }

  remove(id: number) {
    return `This action removes a #${id} pase`;
  }
}
