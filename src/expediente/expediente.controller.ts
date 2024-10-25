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
  async findAll(
    @Query() filters: {
      search_title_exp?: string,
      search_anio_exp?: number,
      search_dependencia?: string
    }
  ): Promise<CreateExpedienteDto[]> {
    if (Object.keys(filters).length > 0) {
      return await this.expedienteService.findExpedienteByFilters(filters);
    } else {
      return await this.expedienteService.findAllExpediente();
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
