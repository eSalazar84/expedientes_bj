import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { ExpedienteService } from './expediente.service';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { Expediente } from './entities/expediente.entity';
import { Iexpediente } from './interface/expediente.interface';

@Controller('expediente')
export class ExpedienteController {
  constructor(private readonly expedienteService: ExpedienteService) { }

  @Post()
  async createExpediente(@Body() createExpedienteDto: CreateExpedienteDto): Promise<Expediente> {
    return await this.expedienteService.createExpediente(createExpedienteDto);
  }

  @Get()
  async findAllExpedientes(): Promise<CreateExpedienteDto[]> {
    return this.expedienteService.findAllExpedientes();
  }

  @Get(':id')
  async findOneExpediente(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Iexpediente> {
    return this.expedienteService.findOneExpediente(id);
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
