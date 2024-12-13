import { Module } from '@nestjs/common';
import { PaseService } from './pase.service';
import { PaseController } from './pase.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pase } from './entities/pase.entity';
import { Dependencia } from 'src/dependencia/entities/dependencia.entity';
import { Expediente } from 'src/expediente/entities/expediente.entity';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Pase, Dependencia, Expediente]),
    AuthModule
  ],
  controllers: [PaseController],
  providers: [PaseService],
})
export class PaseModule { }
