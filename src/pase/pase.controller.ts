import { Controller, Post, Body, Patch, Param, Delete, Get, Query, HttpException, HttpStatus, ValidationPipe, UsePipes, ParseIntPipe } from '@nestjs/common';
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
    if (!idExpediente) {
      return await this.paseService.findAllPase()
    } else {
      return await this.paseService.findPasesByIdExpediente(idExpediente)
    }
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updatePase(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
    @Body() updatePaseDto: UpdatePaseDto
  ): Promise<CreatePaseDto> {
    try {
      return this.paseService.updatePase(+id, updatePaseDto);
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
}
