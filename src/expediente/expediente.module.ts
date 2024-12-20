import { Module } from '@nestjs/common';
import { ExpedienteService } from './expediente.service';
import { ExpedienteController } from './expediente.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expediente } from './entities/expediente.entity';
import { Pase } from 'src/pase/entities/pase.entity';
import { Dependencia } from 'src/dependencia/entities/dependencia.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Expediente, Pase, Dependencia]),
    AuthModule,
  ],
  controllers: [ExpedienteController],
  providers: [ExpedienteService],
})

export class ExpedienteModule {}
