import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, ParseIntPipe, HttpStatus, Query, HttpException } from '@nestjs/common';
import { ExpedienteService } from './expediente.service';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';

@Controller('expediente')
export class ExpedienteController {
  constructor(private readonly expedienteService: ExpedienteService) { }

  @Post()
  async createExpediente(@Body() createExpedienteDto: CreateExpedienteDto): Promise<CreateExpedienteDto> {
    try {
      return await this.expedienteService.createExpediente(createExpedienteDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;  // Lanza el error tal cual si ya es una HttpException
      }
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: `Ocurrio un error inesperado`
      }, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get()
  async findAll(
    @Query() filters: {
      search_title_exp?: string,
      search_anio_exp?: number,
      search_dependencia?: string
    }
  ): Promise<CreateExpedienteDto[]> {
    try {
      if (Object.keys(filters).length > 0) {
        return await this.expedienteService.findExpedienteByFilters(filters);
      } else {
        return await this.expedienteService.findAllExpediente();
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;  // Lanza el error tal cual si ya es una HttpException
      }
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: `Ocurrio un error inesperado.`
      }, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async findOne(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number
  ): Promise<CreateExpedienteDto> {
    try {
      return await this.expedienteService.findOneExpediente(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;  // Lanza el error tal cual si ya es una HttpException
      }
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: `Ocurrió un error inesperado.`
      }, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateExpediente(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
    @Body() updateExpedienteDto: UpdateExpedienteDto
  ): Promise<CreateExpedienteDto> {
    try {
      return this.expedienteService.updateExpediente(id, updateExpedienteDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;  // Lanza el error tal cual si ya es una HttpException
      }
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: `Ocurrió un error inesperado.`
      }, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Delete(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async removeExpediente(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
  ): Promise<void> {
    return this.expedienteService.removeExpediente(id);
  }
}
