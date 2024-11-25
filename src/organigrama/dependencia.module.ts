import { Module } from '@nestjs/common';
import { DependenciaService } from './dependencia.service';
import { DependenciaController } from './dependencia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dependencia } from './entities/dependencia.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Dependencia]),
    AuthModule
  ],
  controllers: [DependenciaController],
  providers: [DependenciaService],
})
export class DependenciaModule { }
