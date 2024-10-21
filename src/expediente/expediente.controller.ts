import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, ParseIntPipe, HttpStatus, Query } from '@nestjs/common';
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
  async findAll(@Query('query') query ?: string): Promise<CreateExpedienteDto[]> {
    if (query) {
      return await this.expedienteService.findExpedienteByTitle(query)
    } else {
      return await this.expedienteService.findAllExpediente()
    }
  }

  @Get(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async findOne(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Expediente> {
    return await this.expedienteService.findOneExpediente(id);
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
