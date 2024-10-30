import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, Query, UsePipes, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { DependenciaService } from './dependencia.service';
import { CreateDependenciaDto } from './dto/create-dependencia.dto';
import { UpdateDependenciaDto } from './dto/update-dependencia.dto';

@Controller('dependencia')
export class DependenciaController {
  constructor(private readonly dependenciaService: DependenciaService) { }

  @Post()
  async createDependencia(@Body() createDependenciaDto: CreateDependenciaDto): Promise<CreateDependenciaDto> {
    try {
      return await this.dependenciaService.createDependencia(createDependenciaDto);
    } catch (error) {
      // Si el error ya tiene un código de estado (por ejemplo, 409), se conserva.
      if (error instanceof HttpException) {
        throw error;  // Lanza el error tal cual si ya es una HttpException
      }
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: `Ocurrio un error al crear la nueva dependencia`
      }, HttpStatus.INTERNAL_SERVER_ERROR)

    }
  }

  @Get()
  async findAllDependencia(@Query('dependencia') dependencia?: string): Promise<CreateDependenciaDto[] | CreateDependenciaDto> {
    try {
      if (dependencia) {
        return await this.dependenciaService.findOneByDependencia(dependencia)
      } else {
        return await this.dependenciaService.findAllDependencia()
      }
    } catch (error) {
      // Si el error ya es una HttpException (manejado previamente), lo volvemos a lanzar
      if (error instanceof HttpException) {
        throw error;
      }

      // Si el error no es controlado, lanzamos un 500 Internal Server Error
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Ocurrió un error al obtener las dependencias',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOneDependencia(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<CreateDependenciaDto> {
    try {
      return await this.dependenciaService.findOneDependencia(id);
    } catch (error) {
      // Si el error ya es una HttpException (manejado previamente), lo volvemos a lanzar
      if (error instanceof HttpException) {
        throw error;
      }

      // Si el error no es controlado, lanzamos un 500 Internal Server Error
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Ocurrió un error al obtener las dependencias',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @Get(':dependencia')
  async findOneByDependencia(@Param('dependencia') dependencia: string): Promise<CreateDependenciaDto> {
    try {
      return await this.dependenciaService.findOneByDependencia(dependencia);
    } catch (error) {
      // Si el error ya es una HttpException (manejado previamente), lo volvemos a lanzar
      if (error instanceof HttpException) {
        throw error;
      }

      // Si el error no es controlado, lanzamos un 500 Internal Server Error
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Ocurrió un error al obtener las dependencias',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateDependencia(
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
    @Body() updateDependenciaDto: UpdateDependenciaDto
  ): Promise<UpdateDependenciaDto> {
    try {
      console.log(`Llego?`);
      
      return await this.dependenciaService.updateDependencia(id, updateDependenciaDto);
    } catch (error) {
      // Si el error ya es una HttpException (manejado previamente), lo volvemos a lanzar
      if (error instanceof HttpException) {
        throw error;
      }

      // Si el error no es controlado, lanzamos un 500 Internal Server Error
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Ocurrió un error al obtener las dependencias',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  removeDependencia(@Param('id') id: string) {
    return this.dependenciaService.removeDependencia(+id);
  }
}
