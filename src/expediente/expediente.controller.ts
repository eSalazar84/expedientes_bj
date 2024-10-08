import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExpedienteService } from './expediente.service';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { Expediente } from './entities/expediente.entity';

@Controller('expediente')
export class ExpedienteController {
  constructor(private readonly expedienteService: ExpedienteService) { }

  @Post()
  async create(@Body() createExpedienteDto: CreateExpedienteDto): Promise<Expediente> {
    return await this.expedienteService.createExpediente(createExpedienteDto);
  }

  @Get()
  findAll() {
    return this.expedienteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expedienteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpedienteDto: UpdateExpedienteDto) {
    return this.expedienteService.update(+id, updateExpedienteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expedienteService.remove(+id);
  }
}
