import { Module } from '@nestjs/common';
import { ExpedienteService } from './expediente.service';
import { ExpedienteController } from './expediente.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expediente } from './entities/expediente.entity';
import { Pase } from 'src/pase/entities/pase.entity';
import { Dependencia } from 'src/organigrama/entities/dependencia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Expediente, Pase, Dependencia])],
  controllers: [ExpedienteController],
  providers: [ExpedienteService],
})
export class ExpedienteModule {}
