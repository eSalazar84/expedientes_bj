import { Module } from '@nestjs/common';
import { MigrationModule } from './migration/migration.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { DependenciaModule } from './organigrama/dependencia.module';
import { ExpedienteModule } from './expediente/expediente.module';
import { PaseModule } from './pase/pase.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'prueba_exp',
      entities: [
        join(__dirname, '/**/*.entity{.ts,.js}')
      ],
      synchronize: true
    }),
    MigrationModule,
    DependenciaModule,
    ExpedienteModule,
    PaseModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
