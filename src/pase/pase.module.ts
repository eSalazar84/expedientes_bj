import { Module } from '@nestjs/common';
import { PaseService } from './pase.service';
import { PaseController } from './pase.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pase } from './entities/pase.entity';
import { Dependencia } from 'src/organigrama/entities/dependencia.entity';
import { Expediente } from 'src/expediente/entities/expediente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pase, Dependencia, Expediente])],
  controllers: [PaseController],
  providers: [PaseService],
})
export class PaseModule { }
