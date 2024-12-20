import { Controller, Post, UseInterceptors, UploadedFile, HttpStatus, HttpException, UseGuards } from '@nestjs/common';
import { MigrationService } from './migration.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer'
import { extname } from 'path';
import * as fs from 'fs'
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { Rol } from 'src/auth/enums/rol.enum';


@Controller('migration')
export class MigrationController {
  constructor(private readonly migrationService: MigrationService) { }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Rol.SUPER_ADMIN)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads', // Directorio para guardar archivos subidos
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    })
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<{ status: number, message: string }> {
    if (!file) throw new HttpException({
      status: HttpStatus.BAD_REQUEST,
      error: `you must upload a file`
    }, HttpStatus.BAD_REQUEST)
    await this.migrationService.migrateCSV(file);
    // Procesamos el archivo CSV
    try {
      fs.unlinkSync(file.path); // Elimina el archivo después de procesarlo
      return {
        status: HttpStatus.CREATED,
        message: 'Migration started successfuly.-'
      };
    } catch (error) {
      fs.unlinkSync(file.path); // Elimina el archivo en caso de error
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: `Error processing file: ${error.message}`,
      }, HttpStatus.BAD_REQUEST);
    }
  }
}
