import { Module } from '@nestjs/common';
import { MigrationService } from './migration.service';
import { MigrationController } from './migration.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expediente } from './entities/expediente.entity';
import { Pase } from './entities/pase.entity';
import { Dependencia } from '../organigrama/entities/dependencia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Expediente, Pase, Dependencia])],
  controllers: [MigrationController],
  providers: [MigrationService],
})
export class MigrationModule { }
