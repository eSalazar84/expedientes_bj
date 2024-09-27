import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, UsePipes, ValidationPipe, HttpStatus, ParseIntPipe, HttpException } from '@nestjs/common';
import { MigrationService } from './migration.service';
import { UpdateMigrationDto } from './dto/update-migration.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer'
import { extname } from 'path';
import { Expediente } from './entities/expediente.entity';
import * as fs from 'fs'


@Controller('migration')
export class MigrationController {
  constructor(private readonly migrationService: MigrationService) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads', // Directorio para guardar archivos subidos
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<{ status: number, message: string }> {
    if (!file) throw new HttpException({
      status: HttpStatus.BAD_REQUEST,
      error: `you must upload a file`
    }, HttpStatus.BAD_REQUEST)
    await this.migrationService.migrateCSV(file.path);
    // Procesamos el archivo CSV
    try {
      fs.unlinkSync(file.path); // Elimina el archivo después de procesarlo
      return {
        status: HttpStatus.CREATED,
        message: 'Migration started successfuly.-'
      };
    } catch (error) {
      fs.unlinkSync(file.path); // Elimina el archivo en caso de error
      throw new BadRequestException(`Error processing file: ${error.message}`);
    }
  }

  @Get()
  findAll(): Promise<Expediente[]> {
    return this.migrationService.findAll();
  }

  @Get(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async findOne(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Expediente> {
    return await this.migrationService.findOneExpediente(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMigrationDto: UpdateMigrationDto) {
    return this.migrationService.update(+id, updateMigrationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.migrationService.remove(+id);
  }
}
