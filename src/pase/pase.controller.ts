import { Controller, Post, Body, Patch, Param, Delete, Get, Query, HttpException, HttpStatus, ValidationPipe, UsePipes, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PaseService } from './pase.service';
import { CreatePaseDto } from './dto/create-pase.dto';
import { UpdatePaseDto } from './dto/update-pase.dto';
import { Pase } from './entities/pase.entity';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Rol } from 'src/auth/enums/rol.enum';
import { Roles } from 'src/auth/guard/roles.decorator';

@Controller('pases')
@UseGuards(AuthGuard, RolesGuard)
export class PaseController {
  constructor(private readonly paseService: PaseService) { }

  @Post()
  @Roles(Rol.ADMIN, Rol.SUPER_ADMIN)
  async create(@Body() createPaseDto: CreatePaseDto): Promise<Pase> {
    return await this.paseService.createPase(createPaseDto);
  }

  @Get()
  @Roles(Rol.ADMIN, Rol.SUPER_ADMIN, Rol.USER)
  async findAllPase(@Query('idExpediente') idExpediente: number): Promise<CreatePaseDto[]> {
    if (!idExpediente) {
      return await this.paseService.findAllPase()
    } else {
      return await this.paseService.findPasesByIdExpediente(idExpediente)
    }
  }

  @Patch(':id')
  @Roles(Rol.ADMIN, Rol.SUPER_ADMIN)
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
