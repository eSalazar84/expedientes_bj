import { Controller, Post, Body, Patch, Param, Delete, Get, Query } from '@nestjs/common';
import { PaseService } from './pase.service';
import { CreatePaseDto } from './dto/create-pase.dto';
import { UpdatePaseDto } from './dto/update-pase.dto';
import { Pase } from './entities/pase.entity';

@Controller('pases')
export class PaseController {
  constructor(private readonly paseService: PaseService) { }

  @Post()
  async create(@Body() createPaseDto: CreatePaseDto): Promise<Pase> {
    return await this.paseService.createPase(createPaseDto);
  }

  @Get()
  async findAllPase(@Query('idExpediente') idExpediente: number): Promise<CreatePaseDto[]> {
    if(!idExpediente){
      return await this.paseService.findAllPase()
    } else {
      return await this.paseService.findPasesByIdExpediente(idExpediente)
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaseDto: UpdatePaseDto) {
    return this.paseService.updatePase(+id, updatePaseDto);
  }
}
